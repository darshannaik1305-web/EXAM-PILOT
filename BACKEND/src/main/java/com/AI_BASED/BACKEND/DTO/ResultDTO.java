package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResultDTO {

    private int totalQuestions;

    private int correctAnswers;

    private int wrongAnswers;

    private double score;
}
