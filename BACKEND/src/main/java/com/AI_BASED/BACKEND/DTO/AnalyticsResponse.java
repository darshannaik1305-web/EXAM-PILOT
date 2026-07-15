package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private int totalTestsTaken;
    private double averageScore;
    private double averageAccuracy;
    private int studyStreak;
    private List<SubjectAnalytics> subjectBreakdown;
    private List<DifficultyAnalytics> difficultyBreakdown;
    private List<String> weakSubjects;
    private List<String> strongSubjects;
    private List<HistoryItem> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectAnalytics {
        private String subject;
        private int correctAnswers;
        private int wrongAnswers;
        private int skippedQuestions;
        private double averageScore;
        private double accuracy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyAnalytics {
        private String difficulty;
        private int correctAnswers;
        private int wrongAnswers;
        private int skippedQuestions;
        private double accuracy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryItem {
        private Long id; // testSessionId
        private Long practiceSessionId;
        private int attemptNumber;
        private double percentage;
        private int timeTakenSeconds;
        private String title;
        private String date;
        private double score;
        private int correctAnswers;
        private int wrongAnswers;
        private double accuracy;
    }
}
