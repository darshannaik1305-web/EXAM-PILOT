package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.AnswerDTO;
import com.AI_BASED.BACKEND.DTO.ResultDTO;
import com.AI_BASED.BACKEND.DTO.SubmitTestRequest;
import com.AI_BASED.BACKEND.ENTITY.Question;
import com.AI_BASED.BACKEND.ENTITY.Result;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.REPOSITORY.QuestionRepository;
import com.AI_BASED.BACKEND.REPOSITORY.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ResultRepository resultRepository;

    // Create Question
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    // Get Question By ID
    public Question getQuestionById(Long questionId) {

        return questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new RuntimeException("Question not found"));
    }

    // Get All Questions
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Get Questions By Exam
    public List<Question> getQuestionsByExam(Long examId) {
        return questionRepository.findByExam_ExamId(examId);
    }

    // Get Questions By Subject
    public List<Question> getQuestionsBySubject(String subject) {
        return questionRepository.findBySubject(subject);
    }

    // Import Questions
    public List<Question> saveAll(List<Question> questions) {
        return questionRepository.saveAll(questions);
    }

    // Submit Test
    public ResultDTO submitTest(SubmitTestRequest request) {

        List<AnswerDTO> answers = request.getAnswers();
        Long examId = request.getExamId();
        int correct = 0;
        int wrong = 0;
        double score = 0;

        // Get Logged-in User from JWT
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        for (AnswerDTO answer : answers) {

            Question question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() ->
                            new RuntimeException("Question Not Found"));

            if (question.getCorrectAnswer() != null &&
                    question.getCorrectAnswer().trim()
                            .equalsIgnoreCase(answer.getSelectedAnswer().trim())) {

                correct++;

                if (question.getMarks() != null) {
                    score += question.getMarks();
                }

            } else {

                wrong++;

                if (question.getNegativeMarks() != null) {
                    score -= question.getNegativeMarks();
                }
            }
        }

        // Save Result
        Result result = new Result();

        result.setUser(user);
        result.setExamId(examId);
        result.setStudentName(user.getDisplayName());
        result.setTotalQuestions(answers.size());
        result.setCorrectAnswers(correct);
        result.setWrongAnswers(wrong);
        result.setScore(score);
        result.setSubmittedAt(LocalDateTime.now());

        resultRepository.save(result);

        return new ResultDTO(
                answers.size(),
                correct,
                wrong,
                score
        );
    }
}
