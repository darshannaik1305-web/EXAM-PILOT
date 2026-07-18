package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.*;
import com.AI_BASED.BACKEND.REPOSITORY.*;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MockTestService {

    @Autowired
    private MockTestSessionRepository sessionRepository;

    @Autowired
    private MockTestAnswerRepository answerRepository;

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private PracticeQuestionRepository practiceQuestionRepository;

    @Autowired
    private ResultEngineService resultEngineService;

    @Autowired
    private MockTestResultRepository resultRepository;

    @Transactional
    public MockTestSessionResponse startOrResumeTestSession(Long practiceSessionId, User user) {
        PracticeSession practiceSession = practiceSessionRepository.findById(practiceSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        if (!practiceSession.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
        }

        if (practiceSession.getStatus() != PracticeSessionStatus.READY) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.ExtractionException("Practice session is not ready for testing. Status: " + practiceSession.getStatus());
        }

        // 1. Check if there is an active session for the SAME practice session
        Optional<MockTestSession> activeSameSession = sessionRepository
                .findFirstByUserAndPracticeSessionAndStatus(user, practiceSession, MockTestStatus.ACTIVE);

        if (activeSameSession.isPresent()) {
            return convertToResponse(activeSameSession.get());
        }

        // 2. Create new session (no termination of other sessions)
        long attemptCount = sessionRepository.countByUserAndPracticeSession(user, practiceSession);

        MockTestSession session = new MockTestSession();
        session.setUser(user);
        session.setPracticeSession(practiceSession);
        session.setStartedAt(LocalDateTime.now());
        session.setStatus(MockTestStatus.ACTIVE);
        
        int duration = practiceSession.getExamDurationSeconds() != null 
                ? practiceSession.getExamDurationSeconds() : 5400; // fallback to 90 mins (5400s)
        session.setDurationSeconds(duration);
        session.setTotalQuestions(practiceSession.getTotalQuestions());
        session.setScore(0.0);
        session.setAttemptNumber((int) attemptCount + 1);

        session = sessionRepository.save(session);

        // 3. Pre-create MockTestAnswers for every question
        List<PracticeQuestion> questions = practiceQuestionRepository.findByPracticeSession(practiceSession);
        MockTestSession finalSession = session;
        List<MockTestAnswer> answers = questions.stream().map(q -> {
            MockTestAnswer ans = new MockTestAnswer();
            ans.setMockTestSession(finalSession);
            ans.setPracticeQuestion(q);
            ans.setSelectedOption(null);
            ans.setIsMarkedForReview(false);
            ans.setIsSkipped(false);
            ans.setTimeSpentSeconds(0L);
            return ans;
        }).collect(Collectors.toList());

        answerRepository.saveAll(answers);

        return convertToResponse(session);
    }

    public MockTestSessionResponse getTestSession(Long testSessionId, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this test session");
        }

        return convertToResponse(session);
    }

    public MockTestQuestionResponse getQuestion(Long testSessionId, int questionNumber, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this test session");
        }

        PracticeQuestion question = practiceQuestionRepository.findByPracticeSessionAndQuestionNumber(session.getPracticeSession(), questionNumber)
                .orElseThrow(() -> new ExtractionException("Question not found with number: " + questionNumber));

        MockTestAnswer answer = answerRepository.findByMockTestSessionAndPracticeQuestion(session, question)
                .orElseThrow(() -> new ExtractionException("Answer record not initialized for question: " + questionNumber));

        return new MockTestQuestionResponse(
                question.getId(),
                question.getQuestionNumber(),
                question.getQuestion(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                answer.getSelectedOption(),
                answer.getIsMarkedForReview(),
                answer.getIsSkipped(),
                answer.getTimeSpentSeconds(),
                question.getDiagramUrl(),
                question.getDiagramType(),
                question.getDiagramConfidence(),
                question.getDiagramWidth(),
                question.getDiagramHeight()
        );
    }

    @Transactional
    public MockTestQuestionResponse saveAnswer(Long testSessionId, int questionNumber, MockTestAnswerRequest request, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this test session");
        }

        if (session.getStatus() != MockTestStatus.ACTIVE) {
            throw new ExtractionException("Cannot save answer: Test session is " + session.getStatus());
        }

        PracticeQuestion question = practiceQuestionRepository.findByPracticeSessionAndQuestionNumber(session.getPracticeSession(), questionNumber)
                .orElseThrow(() -> new ExtractionException("Question not found"));

        MockTestAnswer answer = answerRepository.findByMockTestSessionAndPracticeQuestion(session, question)
                .orElseThrow(() -> new ExtractionException("Answer not initialized"));

        // Update answer details
        answer.setSelectedOption(request.getSelectedOption());
        answer.setIsMarkedForReview(request.getIsMarkedForReview() != null && request.getIsMarkedForReview());
        answer.setIsSkipped(request.getIsSkipped() != null && request.getIsSkipped());
        
        if (request.getTimeSpentSeconds() != null) {
            answer.setTimeSpentSeconds(answer.getTimeSpentSeconds() + request.getTimeSpentSeconds());
        }

        answer = answerRepository.save(answer);

        return new MockTestQuestionResponse(
                question.getId(),
                question.getQuestionNumber(),
                question.getQuestion(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                answer.getSelectedOption(),
                answer.getIsMarkedForReview(),
                answer.getIsSkipped(),
                answer.getTimeSpentSeconds(),
                question.getDiagramUrl(),
                question.getDiagramType(),
                question.getDiagramConfidence(),
                question.getDiagramWidth(),
                question.getDiagramHeight()
        );
    }

    public List<MockTestPaletteItem> getPalette(Long testSessionId, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this test session");
        }

        List<MockTestAnswer> answers = answerRepository.findByMockTestSession(session);

        return answers.stream().map(ans -> {
            String status = "UNVISITED";
            if (Boolean.TRUE.equals(ans.getIsMarkedForReview())) {
                status = "REVIEW";
            } else if (ans.getSelectedOption() != null && !ans.getSelectedOption().trim().isEmpty()) {
                status = "ANSWERED";
            } else if (Boolean.TRUE.equals(ans.getIsSkipped())) {
                status = "SKIPPED";
            }
            return new MockTestPaletteItem(ans.getPracticeQuestion().getQuestionNumber(), status);
        }).collect(Collectors.toList());
    }

    @Transactional
    public MockTestSessionResponse submitTest(Long testSessionId, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this test session");
        }

        if (session.getStatus() != MockTestStatus.ACTIVE) {
            throw new ExtractionException("Cannot submit: Session is " + session.getStatus());
        }

        session.setStatus(MockTestStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session = sessionRepository.save(session);

        // Invoke the Result Engine to grade and save results
        resultEngineService.calculateAndSaveResults(session);

        return convertToResponse(session);
    }

    private MockTestSessionResponse convertToResponse(MockTestSession session) {
        MockTestSessionResponse resp = new MockTestSessionResponse();
        resp.setId(session.getId());
        resp.setPracticeSessionId(session.getPracticeSession().getId());
        resp.setPracticeSessionTitle(session.getPracticeSession().getTitle());
        resp.setStartedAt(session.getStartedAt());
        resp.setCompletedAt(session.getCompletedAt());
        resp.setDurationSeconds(session.getDurationSeconds());
        resp.setStatus(session.getStatus());
        resp.setTotalQuestions(session.getTotalQuestions());
        resp.setScore(session.getScore());

        resp.setAttemptNumber(session.getAttemptNumber() != null ? session.getAttemptNumber() : 1);

        if (session.getStatus() == MockTestStatus.ACTIVE) {
            resp.setDisplayStatus("IN_PROGRESS");
        } else if (session.getStatus() == MockTestStatus.COMPLETED) {
            resp.setDisplayStatus("SUBMITTED");
        } else {
            resp.setDisplayStatus(session.getStatus().name());
        }

        if (session.getStatus() == MockTestStatus.ACTIVE && session.getStartedAt() != null) {
            long elapsed = java.time.Duration.between(session.getStartedAt(), LocalDateTime.now()).getSeconds();
            int remaining = session.getDurationSeconds() - (int) elapsed;
            resp.setRemainingSeconds(Math.max(0, remaining));
        } else {
            resp.setRemainingSeconds(null);
        }

        return resp;
    }

    @Transactional
    public MockTestSessionResponse retakeTest(Long practiceSessionId, User user) {
        PracticeSession practiceSession = practiceSessionRepository.findById(practiceSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        if (!practiceSession.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
        }

        if (practiceSession.getStatus() != PracticeSessionStatus.READY) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.ExtractionException("Practice session is not ready for testing. Status: " + practiceSession.getStatus());
        }

        // Check if there is an active session for the SAME practice session
        Optional<MockTestSession> activeSameSession = sessionRepository
                .findFirstByUserAndPracticeSessionAndStatus(user, practiceSession, MockTestStatus.ACTIVE);

        if (activeSameSession.isPresent()) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.ExtractionException("An active test session already exists. Resume it before retaking.");
        }

        long attemptCount = sessionRepository.countByUserAndPracticeSession(user, practiceSession);

        MockTestSession session = new MockTestSession();
        session.setUser(user);
        session.setPracticeSession(practiceSession);
        session.setStartedAt(LocalDateTime.now());
        session.setStatus(MockTestStatus.ACTIVE);

        int duration = practiceSession.getExamDurationSeconds() != null
                ? practiceSession.getExamDurationSeconds() : 5400; // fallback to 90 mins (5400s)
        session.setDurationSeconds(duration);
        session.setTotalQuestions(practiceSession.getTotalQuestions());
        session.setScore(0.0);
        session.setAttemptNumber((int) attemptCount + 1);

        session = sessionRepository.save(session);

        // Pre-create MockTestAnswers for every question
        List<PracticeQuestion> questions = practiceQuestionRepository.findByPracticeSession(practiceSession);
        MockTestSession finalSession = session;
        List<MockTestAnswer> answers = questions.stream().map(q -> {
            MockTestAnswer ans = new MockTestAnswer();
            ans.setMockTestSession(finalSession);
            ans.setPracticeQuestion(q);
            ans.setSelectedOption(null);
            ans.setIsMarkedForReview(false);
            ans.setIsSkipped(false);
            ans.setTimeSpentSeconds(0L);
            return ans;
        }).collect(Collectors.toList());

        answerRepository.saveAll(answers);

        return convertToResponse(session);
    }

    public List<AttemptHistoryResponse> getAttemptHistory(Long practiceSessionId, User user) {
        PracticeSession practiceSession = practiceSessionRepository.findById(practiceSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Practice session not found"));

        if (!practiceSession.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this practice session");
        }

        List<MockTestSession> sessions = sessionRepository.findByPracticeSessionAndUserOrderByStartedAtDesc(practiceSession, user);

        return sessions.stream().map(s -> {
            String displayStatus = s.getStatus() == MockTestStatus.ACTIVE ? "IN_PROGRESS" :
                                   (s.getStatus() == MockTestStatus.COMPLETED ? "SUBMITTED" : s.getStatus().name());

            Double accuracy = null;
            Integer timeTaken = null;
            if (s.getStatus() == MockTestStatus.COMPLETED) {
                Optional<MockTestResult> resOpt = resultRepository.findByMockTestSession(s);
                if (resOpt.isPresent()) {
                    accuracy = resOpt.get().getAccuracy();
                    timeTaken = (int) resOpt.get().getTimeTakenSeconds();
                }
            }

            return new AttemptHistoryResponse(
                s.getAttemptNumber() != null ? s.getAttemptNumber() : 1,
                s.getId(),
                s.getStartedAt(),
                s.getCompletedAt(),
                displayStatus,
                s.getScore(),
                accuracy,
                timeTaken
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewQuestionResponse> getReviewData(Long testSessionId, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new com.AI_BASED.BACKEND.EXCEPTION.ResourceNotFoundException("Test attempt not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new com.AI_BASED.BACKEND.EXCEPTION.AccessDeniedException("Access denied: You do not own this test session");
        }

        List<MockTestAnswer> answers = answerRepository.findByMockTestSession(session);
        answers.sort((a, b) -> Integer.compare(a.getPracticeQuestion().getQuestionNumber(), b.getPracticeQuestion().getQuestionNumber()));

        double posMarks = session.getPracticeSession().getPositiveMarks() != null 
                ? session.getPracticeSession().getPositiveMarks() : 4.0;
        double negMarks = session.getPracticeSession().getNegativeMarks() != null 
                ? Math.abs(session.getPracticeSession().getNegativeMarks()) : 1.0;

        return answers.stream().map(ans -> {
            PracticeQuestion q = ans.getPracticeQuestion();
            String studentAns = ans.getSelectedOption();
            String correctAns = q.getCorrectAnswer();
            
            boolean skipped = Boolean.TRUE.equals(ans.getIsSkipped()) || studentAns == null || studentAns.trim().isEmpty();
            boolean correct = !skipped && correctAns != null && !correctAns.trim().isEmpty() && studentAns.trim().equalsIgnoreCase(correctAns.trim());
            
            double marksAwarded = 0.0;
            if (!skipped) {
                if (correct) {
                    marksAwarded = posMarks;
                } else {
                    marksAwarded = -negMarks;
                }
            }

            ReviewQuestionResponse r = new ReviewQuestionResponse();
            r.setQuestionNumber(q.getQuestionNumber());
            r.setQuestion(q.getQuestion());
            r.setOptionA(q.getOptionA());
            r.setOptionB(q.getOptionB());
            r.setOptionC(q.getOptionC());
            r.setOptionD(q.getOptionD());
            r.setCorrectAnswer(correctAns);
            r.setSelectedOption(studentAns);
            r.setIsSkipped(skipped);
            r.setTimeSpentSeconds(ans.getTimeSpentSeconds() != null ? ans.getTimeSpentSeconds() : 0L);
            r.setIsCorrect(correct);
            r.setMarksAwarded(marksAwarded);
            r.setSubject(q.getSubject());
            r.setDifficulty(q.getDifficulty());
            r.setExplanation(q.getExplanation());
            r.setSolution(q.getSolution());
            r.setDiagramUrl(q.getDiagramUrl());
            r.setDiagramType(q.getDiagramType());
            r.setDiagramConfidence(q.getDiagramConfidence());
            r.setDiagramWidth(q.getDiagramWidth());
            r.setDiagramHeight(q.getDiagramHeight());
            return r;
        }).collect(Collectors.toList());
    }
}
