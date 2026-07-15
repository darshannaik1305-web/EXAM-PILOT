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

    // Attempt Details (Sprint 2)
    private String latestTestStatus;
    private Long latestTestSessionId;
    private Double latestScore;
    private Double bestScore;
    private Double bestAccuracy;
    private Integer totalAttempts;
    private String lastAttemptDate;

    // Exam Config details (Sprint 2)
    private Integer examDurationSeconds;
    private Double positiveMarks;
    private Double negativeMarks;
    private String examStructure;
    private String examName;

    // Sprint 3.2 additions
    private String subject;
    private Double latestAccuracy;
}
