package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestQuestionResponse {
    private Long questionId;
    private int questionNumber;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String selectedOption;
    private Boolean isMarkedForReview;
    private Boolean isSkipped;
    private Long timeSpentSeconds;
    private String diagramUrl;
    private String diagramType;
    private Double diagramConfidence;
    private Integer diagramWidth;
    private Integer diagramHeight;
}
