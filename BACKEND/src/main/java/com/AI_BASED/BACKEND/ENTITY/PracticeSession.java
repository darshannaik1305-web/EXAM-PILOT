package com.AI_BASED.BACKEND.ENTITY;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "practice_sessions")
public class PracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private UploadType uploadType;

    @Enumerated(EnumType.STRING)
    private PracticeSessionStatus status;

    private int totalQuestions;

    private Double processingTimeSeconds;

    private String originalPdfName;

    private String processingJobId;

    private Long fileSizeInBytes;

    private Boolean extractionVerified = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Exam Configuration (Sprint 2)
    @Column(name = "exam_duration_seconds")
    private Integer examDurationSeconds;

    @Column(name = "positive_marks")
    private Double positiveMarks;

    @Column(name = "negative_marks")
    private Double negativeMarks;

    @Column(name = "passing_percentage")
    private Double passingPercentage;

    @Column(name = "exam_structure")
    private String examStructure;

    @Column(name = "exam_name")
    private String examName;

    @Column(name = "answer_key_type")
    private String answerKeyType;

    @Column(name = "maximum_marks")
    private Double maximumMarks;

    @Column(name = "subject")
    private String subject;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (extractionVerified == null) {
            extractionVerified = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
