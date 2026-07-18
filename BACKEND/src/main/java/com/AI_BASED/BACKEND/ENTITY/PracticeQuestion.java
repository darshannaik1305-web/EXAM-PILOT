package com.AI_BASED.BACKEND.ENTITY;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "practice_questions", indexes = {
    @Index(name = "idx_pq_session", columnList = "practice_session_id")
})
public class PracticeQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_session_id")
    @JsonIgnore
    private PracticeSession practiceSession;

    private int questionNumber;

    @Column(length = 5000)
    private String question;

    @Column(length = 1000)
    private String optionA;

    @Column(length = 1000)
    private String optionB;

    @Column(length = 1000)
    private String optionC;

    @Column(length = 1000)
    private String optionD;

    private String correctAnswer;

    @Column(length = 5000)
    private String explanation;

    private String subject;

    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(length = 500)
    private String diagramUrl;

    @Column(length = 100)
    private String diagramType;

    private Double diagramConfidence;

    private Integer diagramWidth;

    private Integer diagramHeight;
}
