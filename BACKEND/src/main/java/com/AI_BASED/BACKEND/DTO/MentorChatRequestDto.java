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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessageDto {
        private String role;
        private String content;
    }
}
