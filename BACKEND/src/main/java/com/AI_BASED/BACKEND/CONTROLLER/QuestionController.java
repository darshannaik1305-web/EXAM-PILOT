package com.AI_BASED.BACKEND.CONTROLLER;
import com.AI_BASED.BACKEND.DTO.AnswerDTO;
import com.AI_BASED.BACKEND.DTO.ResultDTO;
import com.AI_BASED.BACKEND.ENTITY.Question;
import com.AI_BASED.BACKEND.SERVICE.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.AI_BASED.BACKEND.DTO.SubmitTestRequest;

import java.util.List;

@RestController
@RequestMapping("/question")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // Create Question
    @PostMapping("/create")
    public Question createQuestion(
            @RequestBody Question question) {

        return questionService
                .createQuestion(question);
    }

    // Get Question By ID
    @GetMapping("/{questionId}")
    public Question getQuestionById(
            @PathVariable Long questionId) {

        return questionService
                .getQuestionById(questionId);
    }

    // Get All Questions
    @GetMapping("/all")
    public List<Question> getAllQuestions() {

        return questionService
                .getAllQuestions();
    }

    // Get Questions By Exam
    @GetMapping("/exam/{examId}")
    public List<Question> getQuestionsByExam(
            @PathVariable Long examId) {

        return questionService
                .getQuestionsByExam(examId);
    }

    // Get Questions By Subject
    @GetMapping("/subject/{subject}")
    public List<Question> getQuestionsBySubject(
            @PathVariable String subject) {

        return questionService
                .getQuestionsBySubject(subject);
    }
    @PostMapping("/import")
    public List<Question> importQuestions(
            @RequestBody List<Question> questions) {

        return questionService.saveAll(questions);
    }
    @PostMapping("/submit")
    public ResponseEntity<ResultDTO> submitTest(
            @RequestBody SubmitTestRequest request) {

        return ResponseEntity.ok(
                questionService.submitTest(request)
        );
    }
}
