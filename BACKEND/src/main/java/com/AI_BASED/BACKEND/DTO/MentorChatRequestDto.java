package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentorChatRequestDto {
    private List<ChatMessageDto> messages;
    private int totalTestsTaken;
    private double averageScore;
    private double averageAccuracy;
    private int studyStreak;
    private List<String> weakSubjects;
    private List<String> strongSubjects;

    private Double latestScore;
    private Double latestAccuracy;
    private Double bestScore;
    private Double bestAccuracy;
    private Integer totalAttempts;
    private Integer totalQuestionsAttempted;
    private List<SubjectStatsDto> subjectBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectStatsDto {
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
    public static class ChatMessageDto {
        private String role;
        private String content;
    }
}
