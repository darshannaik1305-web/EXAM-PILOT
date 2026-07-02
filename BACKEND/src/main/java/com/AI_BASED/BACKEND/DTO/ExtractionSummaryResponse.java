package com.AI_BASED.BACKEND.DTO;

import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtractionSummaryResponse {

    private Long practiceSessionId;

    private PracticeSessionStatus status;

    private int totalQuestions;

    private Double processingTimeSeconds;
}
