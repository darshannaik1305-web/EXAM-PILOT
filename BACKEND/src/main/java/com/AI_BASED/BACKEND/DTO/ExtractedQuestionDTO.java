package com.AI_BASED.BACKEND.DTO;

import lombok.Data;

@Data
public class ExtractedQuestionDTO {

    private Integer questionNumber;

    private String questionText;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;
}
