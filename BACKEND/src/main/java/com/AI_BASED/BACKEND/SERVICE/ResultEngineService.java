package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.ENTITY.*;
import com.AI_BASED.BACKEND.REPOSITORY.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ResultEngineService {

    @Autowired
    private MockTestAnswerRepository answerRepository;

    @Autowired
    private MockTestResultRepository resultRepository;

    @Autowired
    private MockTestSubjectResultRepository subjectResultRepository;

    @Autowired
    private MockTestDifficultyResultRepository difficultyResultRepository;

    @Autowired
    private MockTestSessionRepository sessionRepository;

    @Transactional
    public MockTestResult calculateAndSaveResults(MockTestSession session) {
        List<MockTestAnswer> answers = answerRepository.findByMockTestSession(session);

        int correctAnswers = 0;
        int wrongAnswers = 0;
        int skippedQuestions = 0;
        double score = 0.0;
        
        // Define subject counters
        Map<String, SubjectStats> subjectStatsMap = new HashMap<>();
        // Define difficulty counters
        Map<String, DifficultyStats> difficultyStatsMap = new HashMap<>();

        for (MockTestAnswer ans : answers) {
            PracticeQuestion q = ans.getPracticeQuestion();
            String studentAns = ans.getSelectedOption();
            
            // Classification helpers
            final String finalSubject;
            if (session.getPracticeSession().getSubject() != null && !session.getPracticeSession().getSubject().trim().isEmpty()) {
                finalSubject = session.getPracticeSession().getSubject().trim();
            } else if (q.getSubject() != null && !q.getSubject().trim().isEmpty()) {
                finalSubject = q.getSubject().trim();
            } else {
                finalSubject = "General";
            }
            String difficulty = getDifficulty(q.getQuestionNumber());

            // Initialize stats maps
            subjectStatsMap.computeIfAbsent(finalSubject, k -> new SubjectStats(finalSubject));
            difficultyStatsMap.computeIfAbsent(difficulty, k -> new DifficultyStats(difficulty));

            SubjectStats sStats = subjectStatsMap.get(finalSubject);
            DifficultyStats dStats = difficultyStatsMap.get(difficulty);

            double posMarks = session.getPracticeSession().getPositiveMarks() != null
                    ? session.getPracticeSession().getPositiveMarks() : 4.0;
            double negMarks = session.getPracticeSession().getNegativeMarks() != null
                    ? Math.abs(session.getPracticeSession().getNegativeMarks()) : 1.0;

            String correctAnswer = q.getCorrectAnswer();
            if (studentAns == null || studentAns.trim().isEmpty() || Boolean.TRUE.equals(ans.getIsSkipped())) {
                // Skipped question
                skippedQuestions++;
                sStats.skipped++;
                dStats.skipped++;
            } else if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
                // No correct answer key - treat as skipped to prevent NPE
                skippedQuestions++;
                sStats.skipped++;
                dStats.skipped++;
            } else if (studentAns.trim().equalsIgnoreCase(correctAnswer.trim())) {
                // Correct answer
                correctAnswers++;
                score += posMarks;
                sStats.correct++;
                sStats.score += posMarks;
                dStats.correct++;
                dStats.score += posMarks;
            } else {
                // Wrong answer
                wrongAnswers++;
                score -= negMarks;
                sStats.wrong++;
                sStats.score -= negMarks;
                dStats.wrong++;
                dStats.score -= negMarks;
            }
        }

        // Save Subject results
        for (SubjectStats sStats : subjectStatsMap.values()) {
            MockTestSubjectResult subResult = new MockTestSubjectResult();
            subResult.setMockTestSession(session);
            subResult.setSubject(sStats.subjectName);
            subResult.setCorrectAnswers(sStats.correct);
            subResult.setWrongAnswers(sStats.wrong);
            subResult.setSkippedQuestions(sStats.skipped);
            subResult.setScore(sStats.score);
            subjectResultRepository.save(subResult);
        }

        // Save Difficulty results
        for (DifficultyStats dStats : difficultyStatsMap.values()) {
            MockTestDifficultyResult diffResult = new MockTestDifficultyResult();
            diffResult.setMockTestSession(session);
            diffResult.setDifficultyLevel(dStats.difficultyName);
            diffResult.setCorrectAnswers(dStats.correct);
            diffResult.setWrongAnswers(dStats.wrong);
            diffResult.setSkippedQuestions(dStats.skipped);
            diffResult.setScore(dStats.score);
            difficultyResultRepository.save(diffResult);
        }

        // Calculate time taken
        long timeTaken = 0;
        if (session.getStartedAt() != null && session.getCompletedAt() != null) {
            timeTaken = Duration.between(session.getStartedAt(), session.getCompletedAt()).getSeconds();
        }

        // Prevent exceeding time limit
        if (session.getDurationSeconds() != null && timeTaken > session.getDurationSeconds()) {
            timeTaken = session.getDurationSeconds();
        }

        double posMarks = session.getPracticeSession().getPositiveMarks() != null
                ? session.getPracticeSession().getPositiveMarks() : 4.0;
        double negMarks = session.getPracticeSession().getNegativeMarks() != null
                ? Math.abs(session.getPracticeSession().getNegativeMarks()) : 1.0;

        double maxScore = answers.size() * posMarks;
        double percentage = maxScore > 0 ? (score / maxScore) * 100.0 : 0.0;
        int totalAnswered = correctAnswers + wrongAnswers;
        double accuracy = totalAnswered > 0 ? ((double) correctAnswers / totalAnswered) * 100.0 : 0.0;

        // Save Overall MockTestResult
        MockTestResult result = new MockTestResult();
        result.setMockTestSession(session);
        result.setCorrectAnswers(correctAnswers);
        result.setWrongAnswers(wrongAnswers);
        result.setSkippedQuestions(skippedQuestions);
        result.setScore(score);
        result.setMaxScore(maxScore);
        result.setPercentage(percentage);
        result.setAccuracy(accuracy);
        result.setTimeTakenSeconds(timeTaken);
        result.setSubmittedAt(LocalDateTime.now());

        // Set rich statistics
        result.setAttemptedQuestions(correctAnswers + wrongAnswers);
        result.setPositiveMarksEarned(correctAnswers * posMarks);
        result.setNegativeMarksDeducted(wrongAnswers * negMarks);
        double avgTime = answers.isEmpty() ? 0.0 : (double) timeTaken / answers.size();
        result.setAverageTimePerQuestion(avgTime);

        result = resultRepository.save(result);

        // Update score in session itself for ease of queries
        session.setScore(score);
        sessionRepository.save(session);

        return result;
    }



    private String getDifficulty(int questionNumber) {
        int rem = questionNumber % 3;
        if (rem == 0) return "EASY";
        if (rem == 1) return "MEDIUM";
        return "HARD";
    }

    private static class SubjectStats {
        String subjectName;
        int correct = 0;
        int wrong = 0;
        int skipped = 0;
        double score = 0.0;

        SubjectStats(String name) {
            this.subjectName = name;
        }
    }

    private static class DifficultyStats {
        String difficultyName;
        int correct = 0;
        int wrong = 0;
        int skipped = 0;
        double score = 0.0;

        DifficultyStats(String name) {
            this.difficultyName = name;
        }
    }
}
