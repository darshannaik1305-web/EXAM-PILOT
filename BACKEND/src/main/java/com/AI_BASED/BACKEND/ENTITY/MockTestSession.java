package com.AI_BASED.BACKEND.ENTITY;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "mock_test_sessions")
public class MockTestSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_session_id", nullable = false)
    private PracticeSession practiceSession;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    private MockTestStatus status;

    private Integer totalQuestions;

    private Double score;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) {
            status = MockTestStatus.ACTIVE;
        }
        if (score == null) {
            score = 0.0;
        }
    }
}
