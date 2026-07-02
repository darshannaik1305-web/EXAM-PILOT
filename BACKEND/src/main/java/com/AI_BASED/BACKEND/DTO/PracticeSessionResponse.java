package com.AI_BASED.BACKEND.DTO;

import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionResponse {

    private Long id;

    private String title;

    private Long userId;

    private UploadType uploadType;

    private PracticeSessionStatus status;

    private int totalQuestions;

    private Double processingTimeSeconds;

    private String originalPdfName;

    private String processingJobId;

    private Long fileSizeInBytes;

    private Boolean extractionVerified;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
