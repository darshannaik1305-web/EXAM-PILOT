package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestAnswerRequest {
    private String selectedOption;
    private Boolean isMarkedForReview;
    private Boolean isSkipped;
    private Long timeSpentSeconds;
}
