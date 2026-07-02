package com.AI_BASED.BACKEND.ENTITY;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examId;

    @NotBlank(message = "Exam name cannot be empty")
    private String examName;

    @Enumerated(EnumType.STRING)
    private ExamType examType;

    @Positive(message = "Duration must be greater than 0")
    private Integer duration;

    @NotBlank(message = "Question paper path cannot be empty")
    private String questionPaperPath;

    @Enumerated(EnumType.STRING)
    private ExamStatus status;
}
