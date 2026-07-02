package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.INTEGRATION.FastApiClient;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeSessionRepository;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import org.springframework.beans.factory.annotation.Autowired;
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

    public ExtractionResponseDto createAndProcessSession(String title, UploadType uploadType, MultipartFile file) {
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

        // 3. Process with FastAPI
        try {
            ExtractionResponseDto response = fastApiClient.uploadPdf(file, jobId);

            if (response != null && Boolean.TRUE.equals(response.getSuccess())) {
                session.setStatus(PracticeSessionStatus.READY);
                session.setTotalQuestions(response.getTotalQuestions());
                session.setProcessingTimeSeconds(response.getProcessingTimeSeconds());
                practiceSessionRepository.save(session);
                return response;
            } else {
                session.setStatus(PracticeSessionStatus.FAILED);
                practiceSessionRepository.save(session);
                throw new ExtractionException("FastAPI reported failure during question extraction.");
            }
        } catch (Exception e) {
            session.setStatus(PracticeSessionStatus.FAILED);
            practiceSessionRepository.save(session);
            throw new ExtractionException("Failed to call FastAPI AI Service: " + e.getMessage(), e);
        }
    }

    public PracticeSessionCreateResponse createSession(String title, UploadType uploadType, MultipartFile file, User user) {
        throw new UnsupportedOperationException("Service method 'createSession' is not implemented yet.");
    }

    public PracticeSessionResponse getSessionById(Long id) {
        throw new UnsupportedOperationException("Service method 'getSessionById' is not implemented yet.");
    }

    public List<PracticeSessionResponse> getSessionsByUser(User user) {
        throw new UnsupportedOperationException("Service method 'getSessionsByUser' is not implemented yet.");
    }

    public List<PracticeQuestionResponse> getQuestionsBySessionId(Long sessionId) {
        throw new UnsupportedOperationException("Service method 'getQuestionsBySessionId' is not implemented yet.");
    }

    public ExtractionSummaryResponse getExtractionSummary(Long sessionId) {
        throw new UnsupportedOperationException("Service method 'getExtractionSummary' is not implemented yet.");
    }
}
