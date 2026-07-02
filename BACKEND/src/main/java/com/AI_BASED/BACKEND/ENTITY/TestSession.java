package com.AI_BASED.BACKEND.ENTITY;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class TestSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int totalQuestions;

    private int correctAnswers;

    private int wrongAnswers;

    private double score;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;
}
