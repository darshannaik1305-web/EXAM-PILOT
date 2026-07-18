package com.AI_BASED.BACKEND.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserSettingsDto {

    @NotBlank(message = "Username display name cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    private String email; // Read-only field in requests

    @NotBlank(message = "Target exam cannot be blank")
    @Size(max = 255, message = "Target exam name is too long")
    private String targetExam;

    @NotBlank(message = "Default subject cannot be blank")
    @Size(max = 255, message = "Default subject name is too long")
    private String defaultSubject;

    @NotNull(message = "Weekly study goal is required")
    @Min(value = 1, message = "Weekly study goal must be at least 1 hour")
    @Max(value = 168, message = "Weekly study goal cannot exceed 168 hours")
    private Integer studyGoalHours;
}
