package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.ENTITY.MockTestSession;
import com.AI_BASED.BACKEND.ENTITY.MockTestStatus;
import com.AI_BASED.BACKEND.ENTITY.MockTestResult;
import com.AI_BASED.BACKEND.REPOSITORY.MockTestSessionRepository;
import com.AI_BASED.BACKEND.REPOSITORY.MockTestAnswerRepository;
import com.AI_BASED.BACKEND.REPOSITORY.MockTestSubjectResultRepository;
import com.AI_BASED.BACKEND.REPOSITORY.MockTestDifficultyResultRepository;
import com.AI_BASED.BACKEND.INTEGRATION.FastApiClient;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeSessionRepository;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeQuestionRepository;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.io.IOException;

@Service
public class PracticeSessionService {

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private MockTestSessionRepository sessionRepository;

    @Autowired
    private FastApiClient fastApiClient;

    @Autowired
    private PracticePersistenceService practicePersistenceService;

    @Autowired
    private PracticeQuestionRepository practiceQuestionRepository;

    @Autowired
    private com.AI_BASED.BACKEND.REPOSITORY.MockTestResultRepository mockTestResultRepository;

    @Autowired
    private MockTestAnswerRepository mockTestAnswerRepository;

    @Autowired
    private MockTestSubjectResultRepository mockTestSubjectResultRepository;

    @Autowired
    private MockTestDifficultyResultRepository mockTestDifficultyResultRepository;

    @Autowired
    private ResultEngineService resultEngineService;

    public PracticeSessionCreatedResponse createAndProcessSession(
            String title, UploadType uploadType, MultipartFile file, User user,
            Integer examDurationSeconds, Double positiveMarks, Double negativeMarks,
            String examName, String examStructure, String subject
    ) {
        String jobId = UUID.randomUUID().toString();

        // 1. UPLOADING stage
        PracticeSession session = new PracticeSession();
        session.setTitle(title);
        session.setUploadType(uploadType);
        session.setUser(user);
        session.setStatus(PracticeSessionStatus.UPLOADING);
        session.setOriginalPdfName(file.getOriginalFilename());
        session.setFileSizeInBytes(file.getSize());
        session.setProcessingJobId(jobId);
        session.setExtractionVerified(false);

        session.setExamDurationSeconds(examDurationSeconds);
        session.setPositiveMarks(positiveMarks);
        session.setNegativeMarks(negativeMarks);
        session.setExamName(examName);
        session.setExamStructure(examStructure);
        session.setSubject(subject);

        session = practiceSessionRepository.save(session);

        // 2. EXTRACTING stage
        session.setStatus(PracticeSessionStatus.EXTRACTING);
        session = practiceSessionRepository.save(session);

        Long sessionId = session.getId();

        // 3. Process with FastAPI
        try {
            ExtractionResponseDto response = fastApiClient.uploadPdf(file, jobId);

            if (response != null && Boolean.TRUE.equals(response.getSuccess())) {
                // Save questions to database (Transaction 1)
                practicePersistenceService.saveQuestions(sessionId, response.getQuestions());

                // Update session state to READY (Transaction 2)
                practicePersistenceService.updateSessionReady(sessionId, response.getTotalQuestions(), response.getProcessingTimeSeconds());

                // Return lightweight response
                PracticeSessionCreatedResponse createdResponse = new PracticeSessionCreatedResponse();
                createdResponse.setSessionId(sessionId);
                createdResponse.setTitle(title);
                createdResponse.setTotalQuestions(response.getTotalQuestions());
                createdResponse.setStatus(PracticeSessionStatus.READY);
                createdResponse.setExtractionVerified(false);
                return createdResponse;
            } else {
                practicePersistenceService.updateSessionFailed(sessionId);
                throw new ExtractionException("FastAPI reported failure during question extraction.");
            }
        } catch (Exception e) {
            practicePersistenceService.updateSessionFailed(sessionId);
            throw new ExtractionException("Failed during question extraction: " + e.getMessage(), e);
        }
    }

    public PracticeSessionResponse getSessionById(Long id) {
        PracticeSession session = practiceSessionRepository.findById(id)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        // Validate user ownership
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            currentUser = (User) authentication.getPrincipal();
            if (!session.getUser().getId().equals(currentUser.getId())) {
                throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
            }
        }

        List<MockTestSession> attempts = currentUser != null
                ? sessionRepository.findByPracticeSessionAndUserOrderByStartedAtDesc(session, currentUser)
                : java.util.Collections.emptyList();

        checkAndAutoSubmitExpiredAttempts(attempts);

        return convertToResponse(session, attempts);
    }

    public Page<PracticeSessionResponse> getSessionsByUser(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PracticeSession> sessionsPage = practiceSessionRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        List<PracticeSession> sessions = sessionsPage.getContent();

        // Bulk fetch all mock test sessions for these practice sessions and the user
        List<MockTestSession> attempts = sessions.isEmpty()
                ? java.util.Collections.emptyList()
                : sessionRepository.findByUserAndPracticeSessionInOrderByStartedAtDesc(user, sessions);

        checkAndAutoSubmitExpiredAttempts(attempts);

        // Group attempts by practice session ID
        java.util.Map<Long, List<MockTestSession>> attemptsMap = attempts.stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getPracticeSession().getId()));

        return sessionsPage.map(s -> convertToResponse(s, attemptsMap.getOrDefault(s.getId(), java.util.Collections.emptyList())));
    }

    private void checkAndAutoSubmitExpiredAttempts(List<MockTestSession> attempts) {
        for (MockTestSession s : attempts) {
            if (s.getStatus() == MockTestStatus.ACTIVE && s.getStartedAt() != null) {
                long elapsed = java.time.Duration.between(s.getStartedAt(), java.time.LocalDateTime.now()).getSeconds();
                if (elapsed >= s.getDurationSeconds()) {
                    s.setStatus(MockTestStatus.COMPLETED);
                    s.setCompletedAt(java.time.LocalDateTime.now());
                    sessionRepository.save(s);
                    resultEngineService.calculateAndSaveResults(s);
                }
            }
        }
    }

    public List<PracticeQuestionResponse> getQuestionsBySessionId(Long sessionId) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        // Validate user ownership
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            if (!session.getUser().getId().equals(currentUser.getId())) {
                throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
            }
        }

        List<PracticeQuestion> questions = practiceQuestionRepository.findByPracticeSession(session);
        return questions.stream()
                .map(q -> new PracticeQuestionResponse(
                        q.getId(),
                        session.getId(),
                        q.getQuestionNumber(),
                        q.getQuestion(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD(),
                        q.getCorrectAnswer(),
                        q.getExplanation(),
                        q.getSubject(),
                        q.getDifficulty(),
                        q.getSolution(),
                        q.getDiagramUrl(),
                        q.getDiagramWidth(),
                        q.getDiagramHeight()
                ))
                .toList();
    }

    public ExtractionSummaryResponse getExtractionSummary(Long sessionId) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        // Validate user ownership
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            if (!session.getUser().getId().equals(currentUser.getId())) {
                throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
            }
        }

        return new ExtractionSummaryResponse(
                session.getId(),
                session.getStatus(),
                session.getTotalQuestions(),
                session.getProcessingTimeSeconds()
        );
    }

    private PracticeSessionResponse convertToResponse(PracticeSession session, List<MockTestSession> attempts) {
        PracticeSessionResponse resp = new PracticeSessionResponse();
        resp.setId(session.getId());
        resp.setTitle(session.getTitle());
        resp.setUserId(session.getUser().getId());
        resp.setUploadType(session.getUploadType());
        resp.setStatus(session.getStatus());
        resp.setTotalQuestions(session.getTotalQuestions());
        resp.setProcessingTimeSeconds(session.getProcessingTimeSeconds());
        resp.setOriginalPdfName(session.getOriginalPdfName());
        resp.setProcessingJobId(session.getProcessingJobId());
        resp.setFileSizeInBytes(session.getFileSizeInBytes());
        resp.setExtractionVerified(session.getExtractionVerified());
        resp.setCreatedAt(session.getCreatedAt());
        resp.setUpdatedAt(session.getUpdatedAt());
        resp.setSubject(session.getSubject());

        if (!attempts.isEmpty()) {
            MockTestSession latest = attempts.get(0);
            resp.setLatestTestSessionId(latest.getId());
            if (latest.getStatus() == MockTestStatus.ACTIVE) {
                resp.setLatestTestStatus("ACTIVE");
            } else if (latest.getStatus() == MockTestStatus.COMPLETED) {
                resp.setLatestTestStatus("COMPLETED");
            } else {
                resp.setLatestTestStatus("NOT_STARTED");
            }
            resp.setLatestScore(latest.getScore());
            
            // Count unique attempts by grouping by attempt_number (treating null as separate)
            java.util.Set<Integer> uniqueAttemptNumbers = new java.util.HashSet<>();
            int nullAttemptsCount = 0;
            for (MockTestSession att : attempts) {
                if (att.getAttemptNumber() != null) {
                    uniqueAttemptNumbers.add(att.getAttemptNumber());
                } else {
                    nullAttemptsCount++;
                }
            }
            resp.setTotalAttempts(uniqueAttemptNumbers.size() + nullAttemptsCount);

            double bestScore = -9999.0;
            for (MockTestSession att : attempts) {
                if (att.getScore() != null && att.getScore() > bestScore) {
                    bestScore = att.getScore();
                }
            }
            resp.setBestScore(bestScore == -9999.0 ? 0.0 : bestScore);

            List<MockTestResult> results = mockTestResultRepository.findByMockTestSessionIn(attempts);
            double bestAccuracy = 0.0;
            Double latestAccuracy = null;
            for (MockTestResult r : results) {
                if (r.getMockTestSession().getId().equals(latest.getId())) {
                    latestAccuracy = r.getAccuracy();
                }
                if (r.getAccuracy() > bestAccuracy) {
                    bestAccuracy = r.getAccuracy();
                }
            }
            resp.setLatestAccuracy(latestAccuracy);
            resp.setBestAccuracy(bestAccuracy);

            java.time.LocalDateTime lastDate = latest.getCompletedAt() != null ? latest.getCompletedAt() : latest.getStartedAt();
            if (lastDate != null) {
                resp.setLastAttemptDate(lastDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            }
        } else {
            resp.setLatestTestSessionId(null);
            resp.setLatestTestStatus("NOT_STARTED");
            resp.setLatestScore(null);
            resp.setBestScore(0.0);
            resp.setBestAccuracy(0.0);
            resp.setLatestAccuracy(null);
            resp.setTotalAttempts(0);
            resp.setLastAttemptDate(null);
        }

        resp.setExamDurationSeconds(session.getExamDurationSeconds());
        resp.setPositiveMarks(session.getPositiveMarks());
        resp.setNegativeMarks(session.getNegativeMarks());
        resp.setExamStructure(session.getExamStructure());
        resp.setExamName(session.getExamName());

        return resp;
    }

    public void mergeAnswerKey(Long sessionId, MultipartFile file, User user) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
        }

        try {
            java.util.Map<String, String> answers = fastApiClient.uploadAnswerKeyPdf(file, session.getTotalQuestions());
            saveMergedAnswers(sessionId, answers);
        } catch (IOException e) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.ExtractionException("Failed to upload/read separate answer key file", e);
        }
    }

    @Transactional
    public void saveMergedAnswers(Long sessionId, java.util.Map<String, String> answers) {
        PracticeSession practiceSession = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        List<PracticeQuestion> questions = practiceQuestionRepository.findByPracticeSession(practiceSession);
        for (PracticeQuestion q : questions) {
            String qNumStr = String.valueOf(q.getQuestionNumber());
            if (answers.containsKey(qNumStr)) {
                q.setCorrectAnswer(answers.get(qNumStr));
            }
        }
        practiceQuestionRepository.saveAll(questions);

        // Update session status to READY (if it wasn't already)
        practiceSession.setStatus(PracticeSessionStatus.READY);
        practiceSessionRepository.save(practiceSession);
    }

    // No @Transactional here to keep external REST calls outside DB transactional context
    public void deleteSession(Long id, User user) {
        PracticeSession session = practiceSessionRepository.findById(id)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found with ID: " + id));

        // Enforce ownership check
        if (!session.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not own this practice session.");
        }

        // 1. Best-effort cleanup of PDF and diagram files on the AI Service disk (runs outside DB transaction)
        fastApiClient.cleanupSessionFiles(session.getOriginalPdfName());

        // 2. Perform all database cascade deletions in a dedicated transactional block
        practicePersistenceService.deleteSessionDbData(session, user);
    }
}

