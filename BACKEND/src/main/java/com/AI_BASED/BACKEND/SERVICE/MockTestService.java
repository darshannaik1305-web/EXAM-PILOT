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

    @Transactional
    public MockTestSessionResponse startOrResumeTestSession(Long practiceSessionId, User user) {
        PracticeSession practiceSession = practiceSessionRepository.findById(practiceSessionId)
                .orElseThrow(() -> new ExtractionException("Practice session not found"));

        if (practiceSession.getStatus() != PracticeSessionStatus.READY) {
            throw new ExtractionException("Practice session is not ready for testing. Status: " + practiceSession.getStatus());
        }

        // 1. Check if there is an active session for the SAME practice session
        Optional<MockTestSession> activeSameSession = sessionRepository
                .findFirstByUserAndPracticeSessionAndStatus(user, practiceSession, MockTestStatus.ACTIVE);

        if (activeSameSession.isPresent()) {
            return convertToResponse(activeSameSession.get());
        }

        // 2. Terminate any other ACTIVE sessions the user might have on other practice sessions
        Optional<MockTestSession> otherActiveSession = sessionRepository.findFirstByUserAndStatus(user, MockTestStatus.ACTIVE);
        if (otherActiveSession.isPresent()) {
            MockTestSession oldSession = otherActiveSession.get();
            oldSession.setStatus(MockTestStatus.TERMINATED);
            oldSession.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(oldSession);
        }

        // 3. Create new session
        MockTestSession session = new MockTestSession();
        session.setUser(user);
        session.setPracticeSession(practiceSession);
        session.setStartedAt(LocalDateTime.now());
        session.setStatus(MockTestStatus.ACTIVE);
        session.setDurationSeconds(1800); // 30 minutes default
        session.setTotalQuestions(practiceSession.getTotalQuestions());
        session.setScore(0.0);

        session = sessionRepository.save(session);

        // 4. Pre-create MockTestAnswers for every question
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
                .orElseThrow(() -> new ExtractionException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ExtractionException("Access denied: You do not own this test session");
        }

        return convertToResponse(session);
    }

    public MockTestQuestionResponse getQuestion(Long testSessionId, int questionNumber, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new ExtractionException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ExtractionException("Access denied");
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
                answer.getTimeSpentSeconds()
        );
    }

    @Transactional
    public MockTestQuestionResponse saveAnswer(Long testSessionId, int questionNumber, MockTestAnswerRequest request, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new ExtractionException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ExtractionException("Access denied");
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
                answer.getTimeSpentSeconds()
        );
    }

    public List<MockTestPaletteItem> getPalette(Long testSessionId, User user) {
        MockTestSession session = sessionRepository.findById(testSessionId)
                .orElseThrow(() -> new ExtractionException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ExtractionException("Access denied");
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
                .orElseThrow(() -> new ExtractionException("Test session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ExtractionException("Access denied");
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
        return new MockTestSessionResponse(
                session.getId(),
                session.getPracticeSession().getId(),
                session.getPracticeSession().getTitle(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getDurationSeconds(),
                session.getStatus(),
                session.getTotalQuestions(),
                session.getScore()
        );
    }
}
