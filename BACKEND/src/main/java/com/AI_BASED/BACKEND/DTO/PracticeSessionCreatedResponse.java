package com.AI_BASED.BACKEND.DTO;

import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionCreatedResponse {

    private Long sessionId;

    private String title;

    private int totalQuestions;

    private PracticeSessionStatus status;

    private Boolean extractionVerified;
}
