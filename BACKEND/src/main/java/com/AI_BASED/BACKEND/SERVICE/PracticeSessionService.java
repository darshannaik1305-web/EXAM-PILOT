package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.ENTITY.User;
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

import java.util.List;
import java.util.UUID;

@Service
public class PracticeSessionService {

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private FastApiClient fastApiClient;

    @Autowired
    private PracticePersistenceService practicePersistenceService;

    @Autowired
    private PracticeQuestionRepository practiceQuestionRepository;

    public PracticeSessionCreatedResponse createAndProcessSession(String title, UploadType uploadType, MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new ExtractionException("User is not authenticated");
        }
        User user = (User) authentication.getPrincipal();

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


    public PracticeSessionCreateResponse createSession(String title, UploadType uploadType, MultipartFile file, User user) {
        String jobId = UUID.randomUUID().toString();
        PracticeSession session = new PracticeSession();
        session.setTitle(title);
        session.setUploadType(uploadType);
        session.setUser(user);
        session.setStatus(PracticeSessionStatus.UPLOADING);
        session.setOriginalPdfName(file.getOriginalFilename());
        session.setFileSizeInBytes(file.getSize());
        session.setProcessingJobId(jobId);
        session.setExtractionVerified(false);
        session = practiceSessionRepository.save(session);

        return new PracticeSessionCreateResponse(
            session.getId(),
            session.getTitle(),
            session.getUploadType(),
            session.getStatus()
        );
    }

    public PracticeSessionResponse getSessionById(Long id) {
        PracticeSession session = practiceSessionRepository.findById(id)
                .orElseThrow(() -> new ExtractionException("Practice session not found"));

        // Validate user ownership
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            if (!session.getUser().getId().equals(currentUser.getId())) {
                throw new ExtractionException("Access denied: You do not own this practice session");
            }
        }
        return convertToResponse(session);
    }

    public Page<PracticeSessionResponse> getSessionsByUser(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return practiceSessionRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::convertToResponse);
    }

    public List<PracticeQuestionResponse> getQuestionsBySessionId(Long sessionId) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ExtractionException("Practice session not found"));

        // Validate user ownership
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            if (!session.getUser().getId().equals(currentUser.getId())) {
                throw new ExtractionException("Access denied");
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
                        q.getExplanation()
                ))
                .toList();
    }

    public ExtractionSummaryResponse getExtractionSummary(Long sessionId) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ExtractionException("Practice session not found"));

        // Validate user ownership
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            if (!session.getUser().getId().equals(currentUser.getId())) {
                throw new ExtractionException("Access denied");
            }
        }

        return new ExtractionSummaryResponse(
                session.getId(),
                session.getStatus(),
                session.getTotalQuestions(),
                session.getProcessingTimeSeconds()
        );
    }

    private PracticeSessionResponse convertToResponse(PracticeSession session) {
        return new PracticeSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getUser().getId(),
                session.getUploadType(),
                session.getStatus(),
                session.getTotalQuestions(),
                session.getProcessingTimeSeconds(),
                session.getOriginalPdfName(),
                session.getProcessingJobId(),
                session.getFileSizeInBytes(),
                session.getExtractionVerified(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }
}
