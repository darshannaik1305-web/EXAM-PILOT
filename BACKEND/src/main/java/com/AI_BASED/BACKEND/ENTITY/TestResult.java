package com.AI_BASED.BACKEND.ENTITY;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private TestSession testSession;

    private String subject;

    private int correctAnswers;

    private int wrongAnswers;

    private double score;

    private String performance;
}
