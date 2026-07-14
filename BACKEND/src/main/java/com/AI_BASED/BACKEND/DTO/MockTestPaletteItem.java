package com.AI_BASED.BACKEND.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestPaletteItem {
    private int questionNumber;
    private String status; // ANSWERED, SKIPPED, REVIEW, UNVISITED
}
