package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.ENTITY.Exam;
import com.AI_BASED.BACKEND.ENTITY.ExamStatus;
import com.AI_BASED.BACKEND.SERVICE.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/exam")
public class ExamController {

    @Autowired
    private ExamService examService;


    // Create Exam
    @PostMapping("/create")
    public Exam createExam(@RequestBody Exam exam) {

        return examService.createExam(exam);
    }


    // Get Exam By ID
    @GetMapping("/{examId}")
    public Exam getExamById(@PathVariable Long examId) {

        return examService.getExamById(examId);
    }


    // Get All Exams
    @GetMapping("/all")
    public List<Exam> getAllExams() {

        return examService.getAllExams();
    }


    // Update Exam Status
    @PutMapping("/{examId}/status")
    public Exam updateExamStatus(
            @PathVariable Long examId,
            @RequestParam ExamStatus status) {

        return examService.updateExamStatus(examId, status);
    }
    @PostMapping("/{examId}/upload-question-paper")
    public Exam uploadQuestionPaper(
            @PathVariable Long examId,
            @RequestParam("file") MultipartFile file) {

        return examService.uploadQuestionPaper(
                examId,
                file);
    }
}
