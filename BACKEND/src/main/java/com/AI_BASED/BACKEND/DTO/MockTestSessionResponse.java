package com.AI_BASED.BACKEND.DTO;

import com.AI_BASED.BACKEND.ENTITY.MockTestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestSessionResponse {
    private Long id;
    private Long practiceSessionId;
    private String practiceSessionTitle;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer durationSeconds;
    private MockTestStatus status;
    private Integer totalQuestions;
    private Double score;
    private String displayStatus;
    private Integer remainingSeconds;
    private Integer attemptNumber;
}
