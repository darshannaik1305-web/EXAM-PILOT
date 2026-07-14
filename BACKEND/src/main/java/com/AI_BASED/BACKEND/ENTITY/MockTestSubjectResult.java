package com.AI_BASED.BACKEND.ENTITY;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "mock_test_subject_results")
public class MockTestSubjectResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_test_session_id", nullable = false)
    @JsonIgnore
    private MockTestSession mockTestSession;

    private String subject;

    private int correctAnswers;

    private int wrongAnswers;

    private int skippedQuestions;

    private double score;
}
