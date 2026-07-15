package com.AI_BASED.BACKEND.ENTITY;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "mock_test_results", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"mock_test_session_id"})
})
public class MockTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_test_session_id", nullable = false)
    private MockTestSession mockTestSession;

    private int correctAnswers;

    private int wrongAnswers;

    private int skippedQuestions;

    private double score;

    private double maxScore;

    private double percentage;

    private double accuracy;

    private long timeTakenSeconds;

    private LocalDateTime submittedAt;

    @Column(name = "attempted_questions", nullable = false)
    private int attemptedQuestions;

    @Column(name = "positive_marks_earned", nullable = false)
    private double positiveMarksEarned;

    @Column(name = "negative_marks_deducted", nullable = false)
    private double negativeMarksDeducted;

    @Column(name = "average_time_per_question", nullable = false)
    private double averageTimePerQuestion;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
