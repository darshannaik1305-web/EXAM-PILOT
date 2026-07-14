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
            String subject = getSubject(q.getQuestionNumber(), q.getQuestion());
            String difficulty = getDifficulty(q.getQuestionNumber());

            // Initialize stats maps
            subjectStatsMap.computeIfAbsent(subject, k -> new SubjectStats(subject));
            difficultyStatsMap.computeIfAbsent(difficulty, k -> new DifficultyStats(difficulty));

            SubjectStats sStats = subjectStatsMap.get(subject);
            DifficultyStats dStats = difficultyStatsMap.get(difficulty);

            if (studentAns == null || studentAns.trim().isEmpty() || Boolean.TRUE.equals(ans.getIsSkipped())) {
                // Skipped question
                skippedQuestions++;
                sStats.skipped++;
                dStats.skipped++;
            } else if (studentAns.trim().equalsIgnoreCase(q.getCorrectAnswer().trim())) {
                // Correct answer (+4 marks)
                correctAnswers++;
                score += 4.0;
                sStats.correct++;
                sStats.score += 4.0;
                dStats.correct++;
                dStats.score += 4.0;
            } else {
                // Wrong answer (-1.0 mark negative marking)
                wrongAnswers++;
                score -= 1.0;
                sStats.wrong++;
                sStats.score -= 1.0;
                dStats.wrong++;
                dStats.score -= 1.0;
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

        double maxScore = answers.size() * 4.0;
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

        result = resultRepository.save(result);

        // Update score in session itself for ease of queries
        session.setScore(score);
        sessionRepository.save(session);

        return result;
    }

    // Keyword classifier
    private String getSubject(int questionNumber, String text) {
        String lowerText = text != null ? text.toLowerCase() : "";
        if (lowerText.contains("velocity") || lowerText.contains("force") || lowerText.contains("acceleration") || 
            lowerText.contains("physics") || lowerText.contains("mass") || lowerText.contains("circuit") || 
            lowerText.contains("resistance") || lowerText.contains("current") || lowerText.contains("charge") ||
            lowerText.contains("magnetic") || lowerText.contains("electric") || lowerText.contains("friction") ||
            lowerText.contains("gravity") || lowerText.contains("momentum") || lowerText.contains("energy") ||
            lowerText.contains("wave") || lowerText.contains("light") || lowerText.contains("lens") ||
            lowerText.contains("thermodynamics") || lowerText.contains("projectile") || lowerText.contains("torque")) {
            return "Physics";
        }
        if (lowerText.contains("reaction") || lowerText.contains("molecule") || lowerText.contains("atom") || 
            lowerText.contains("compound") || lowerText.contains("acid") || lowerText.contains("base") || 
            lowerText.contains("organic") || lowerText.contains("chemistry") || lowerText.contains("solution") ||
            lowerText.contains("element") || lowerText.contains("oxidation") || lowerText.contains("gas") ||
            lowerText.contains("alkali") || lowerText.contains("halogen") || lowerText.contains("ester") ||
            lowerText.contains("ether") || lowerText.contains("bonding") || lowerText.contains("catalyst") ||
            lowerText.contains("polymer") || lowerText.contains("thermo-chemistry")) {
            return "Chemistry";
        }
        if (lowerText.contains("matrix") || lowerText.contains("determinant") || lowerText.contains("integration") || 
            lowerText.contains("derivative") || lowerText.contains("limit") || lowerText.contains("probability") || 
            lowerText.contains("vector") || lowerText.contains("triangle") || lowerText.contains("equation") ||
            lowerText.contains("math") || lowerText.contains("geometry") || lowerText.contains("algebra") ||
            lowerText.contains("function") || lowerText.contains("set") || lowerText.contains("log") || lowerText.contains("sin") ||
            lowerText.contains("cos") || lowerText.contains("tan") || lowerText.contains("polynomial") ||
            lowerText.contains("circle") || lowerText.contains("parabola") || lowerText.contains("ellipse") ||
            lowerText.contains("hyperbola") || lowerText.contains("calculus") || lowerText.contains("coefficient")) {
            return "Mathematics";
        }
        
        // Equal thirds split fallback
        if (questionNumber <= 10) return "Physics";
        if (questionNumber <= 20) return "Chemistry";
        return "Mathematics";
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
