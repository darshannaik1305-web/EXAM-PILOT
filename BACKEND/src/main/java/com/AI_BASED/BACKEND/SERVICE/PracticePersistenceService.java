package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.QuestionDto;
import com.AI_BASED.BACKEND.ENTITY.PracticeQuestion;
import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeQuestionRepository;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PracticePersistenceService {

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private PracticeQuestionRepository practiceQuestionRepository;

    @Transactional
    public void saveQuestions(Long sessionId, List<QuestionDto> questionDtos) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ExtractionException("Practice session not found: " + sessionId));

        // Delete any existing questions for this practice session
        practiceQuestionRepository.deleteByPracticeSession(session);

        // Map DTOs to entities
        List<PracticeQuestion> questions = questionDtos.stream().map(qDto -> {
            PracticeQuestion q = new PracticeQuestion();
            q.setPracticeSession(session);
            q.setQuestionNumber(qDto.getQuestionNumber());
            q.setQuestion(qDto.getQuestion());
            q.setOptionA(qDto.getOptionA());
            q.setOptionB(qDto.getOptionB());
            q.setOptionC(qDto.getOptionC());
            q.setOptionD(qDto.getOptionD());
            q.setCorrectAnswer(qDto.getCorrectAnswer());
            q.setExplanation(qDto.getExplanation());
            if (session.getSubject() != null && !session.getSubject().trim().isEmpty()) {
                q.setSubject(session.getSubject().trim());
            } else {
                q.setSubject(qDto.getSubject());
            }
            q.setDifficulty(qDto.getDifficulty());
            q.setSolution(qDto.getSolution());
            return q;
        }).collect(Collectors.toList());

        // Batch persist
        practiceQuestionRepository.saveAll(questions);
    }

    @Transactional
    public void updateSessionReady(Long sessionId, int totalQuestions, Double processingTimeSeconds) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ExtractionException("Practice session not found: " + sessionId));

        if (session.getUploadType() == UploadType.QUESTION_AND_SEPARATE_ANSWER_KEY) {
            session.setStatus(PracticeSessionStatus.IN_PROGRESS);
        } else {
            session.setStatus(PracticeSessionStatus.READY);
        }
        session.setTotalQuestions(totalQuestions);
        session.setProcessingTimeSeconds(processingTimeSeconds);
        session.setExtractionVerified(false);
        practiceSessionRepository.save(session);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateSessionFailed(Long sessionId) {
        practiceSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setStatus(PracticeSessionStatus.FAILED);
            practiceSessionRepository.save(session);
        });
    }
}
