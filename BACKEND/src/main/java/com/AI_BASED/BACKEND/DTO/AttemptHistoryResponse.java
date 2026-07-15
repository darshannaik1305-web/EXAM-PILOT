package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttemptHistoryResponse {
    private int attemptNumber;
    private Long testSessionId;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String status; // "IN_PROGRESS" | "SUBMITTED"
    private Double score;
    private Double accuracy;
    private Integer timeTakenSeconds;
}
