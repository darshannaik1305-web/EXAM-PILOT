package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.ENTITY.Question;
import com.AI_BASED.BACKEND.ENTITY.TestResult;
import com.AI_BASED.BACKEND.ENTITY.TestSession;
import com.AI_BASED.BACKEND.SERVICE.QuestionService;
import com.AI_BASED.BACKEND.SERVICE.TestResultService;
import com.AI_BASED.BACKEND.SERVICE.TestSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private TestResultService resultService;

    @Autowired
    private TestSessionService sessionService;

    private TestSession activeSession;

    private Map<String, Integer> correctMap = new HashMap<>();
    private Map<String, Integer> wrongMap = new HashMap<>();


    // =========================
    // START TEST
    // =========================

    @PostMapping("/start")
    public String startTest() {

        correctMap.clear();
        wrongMap.clear();

        activeSession = new TestSession();

        activeSession.setStartedAt(LocalDateTime.now());
        activeSession.setTotalQuestions(0);
        activeSession.setCorrectAnswers(0);
        activeSession.setWrongAnswers(0);
        activeSession.setScore(0);

        sessionService.save(activeSession);

        return "Test Started Successfully";
    }


    // =========================
    // GET RANDOM QUESTION
    // =========================

    @GetMapping("/next")
    public Question getNextQuestion() {

        List<Question> questions =
                questionService.getAllQuestions();

        if (questions.isEmpty()) {
            throw new RuntimeException("No Questions Available");
        }

        Random random = new Random();

        return questions.get(
                random.nextInt(questions.size())
        );
    }


    // =========================
    // SUBMIT ANSWER
    // =========================

    @PostMapping("/answer")
    public String submitAnswer(
            @RequestParam Long questionId,
            @RequestParam String userAnswer) {

        Question q =
                questionService.getQuestionById(questionId);

        String subject = q.getSubject();

        activeSession.setTotalQuestions(
                activeSession.getTotalQuestions() + 1
        );

        // Correct Answer

        if (userAnswer.equalsIgnoreCase(
                q.getCorrectAnswer())) {

            correctMap.put(
                    subject,
                    correctMap.getOrDefault(subject, 0) + 1
            );

            activeSession.setCorrectAnswers(
                    activeSession.getCorrectAnswers() + 1
            );

            activeSession.setScore(
                    activeSession.getScore()
                            + q.getMarks()
            );

            return "Correct Answer";

        }

        // Wrong Answer

        wrongMap.put(
                subject,
                wrongMap.getOrDefault(subject, 0) + 1
        );

        activeSession.setWrongAnswers(
                activeSession.getWrongAnswers() + 1
        );

        activeSession.setScore(
                activeSession.getScore()
                        - q.getNegativeMarks()
        );

        return "Wrong Answer";
    }


    // =========================
    // ANALYSIS
    // =========================

    @GetMapping("/analysis")
    public Map<String, String> analyzePerformance() {

        Map<String, String> result =
                new HashMap<>();

        Set<String> subjects =
                new HashSet<>();

        subjects.addAll(correctMap.keySet());
        subjects.addAll(wrongMap.keySet());

        for (String subject : subjects) {

            int correct =
                    correctMap.getOrDefault(subject, 0);

            int wrong =
                    wrongMap.getOrDefault(subject, 0);

            String performance;

            if (wrong > correct) {
                performance = "Weak";
            } else {
                performance = "Strong";
            }

            result.put(subject, performance);

            TestResult tr = new TestResult();

            tr.setSubject(subject);
            tr.setCorrectAnswers(correct);
            tr.setWrongAnswers(wrong);
            tr.setScore(activeSession.getScore());
            tr.setPerformance(performance);
            tr.setTestSession(activeSession);

            resultService.save(tr);
        }

        return result;
    }


    // =========================
    // FINISH TEST
    // =========================

    @PostMapping("/finish")
    public TestSession finishTest() {

        activeSession.setCompletedAt(
                LocalDateTime.now()
        );

        sessionService.save(activeSession);

        return activeSession;
    }
}
