package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalPracticeSessions;
    private double averageSolvingSpeed; // seconds per question
    private double overallTestAccuracy; // percentage
    private int studyStreak;            // consecutive days
}
