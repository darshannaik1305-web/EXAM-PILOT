package com.AI_BASED.BACKEND.ENTITY;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "mock_test_answers")
public class MockTestAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_test_session_id", nullable = false)
    @JsonIgnore
    private MockTestSession mockTestSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_question_id", nullable = false)
    private PracticeQuestion practiceQuestion;

    private String selectedOption;

    private Boolean isMarkedForReview = false;

    private Boolean isSkipped = false;

    private Long timeSpentSeconds = 0L;
}
