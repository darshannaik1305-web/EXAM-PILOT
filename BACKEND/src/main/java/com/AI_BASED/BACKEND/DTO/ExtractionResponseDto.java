package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtractionResponseDto {

    private Boolean success;

    private Double processingTimeSeconds;

    private int totalQuestions;

    private List<QuestionDto> questions;
}
