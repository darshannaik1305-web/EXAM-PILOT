package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewQuestionResponse {
    private int questionNumber;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String selectedOption;
    private Boolean isSkipped;
    private Long timeSpentSeconds;
    private Boolean isCorrect;
    private Double marksAwarded;
    private String subject;
    private String difficulty;
    private String explanation;
    private String solution;
}
