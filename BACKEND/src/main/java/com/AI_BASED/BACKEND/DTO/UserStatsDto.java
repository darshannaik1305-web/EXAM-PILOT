package com.AI_BASED.BACKEND.DTO;

import lombok.Data;
import java.time.Instant;

@Data
public class UserStatsDto {
    private Instant memberSince;
    private long totalPracticePapers;
    private long totalMockTests;
    private long totalQuestionsSolved;
    private String role;
    private String frontendVersion;
    private String backendVersion;
    private String aiServiceVersion;
}
