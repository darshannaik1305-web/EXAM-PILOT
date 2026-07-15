package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.AnalyticsResponse;
import com.AI_BASED.BACKEND.ENTITY.*;
import com.AI_BASED.BACKEND.REPOSITORY.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private MockTestSessionRepository sessionRepository;

    @Autowired
    private MockTestResultRepository resultRepository;

    @Autowired
    private MockTestSubjectResultRepository subjectResultRepository;

    @Autowired
    private MockTestDifficultyResultRepository difficultyResultRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getStudentAnalytics(User user) {
        List<MockTestSession> allSessions = sessionRepository.findByUserOrderByStartedAtDesc(user);

        List<MockTestSession> completedSessions = allSessions.stream()
                .filter(s -> s.getStatus() == MockTestStatus.COMPLETED)
                .collect(Collectors.toList());

        int totalTests = completedSessions.size();
        int streak = calculateStreak(allSessions);

        if (totalTests == 0) {
            return new AnalyticsResponse(
                    0, 0.0, 0.0, streak,
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList()
            );
        }

        // 1. Bulk Fetch Overall Results
        List<MockTestResult> results = resultRepository.findByMockTestSessionIn(completedSessions);
        double totalScore = 0.0;
        double totalAccuracy = 0.0;

        for (MockTestResult res : results) {
            totalScore += res.getScore();
            totalAccuracy += res.getAccuracy();
        }

        double averageScore = totalScore / totalTests;
        double averageAccuracy = results.isEmpty() ? 0.0 : totalAccuracy / results.size();

        // 2. Bulk Fetch Subject aggregates
        List<MockTestSubjectResult> allSubjectResults = subjectResultRepository.findByMockTestSessionIn(completedSessions);
        Map<String, List<MockTestSubjectResult>> subjectMap = allSubjectResults.stream()
                .collect(Collectors.groupingBy(MockTestSubjectResult::getSubject));

        List<AnalyticsResponse.SubjectAnalytics> subjectBreakdowns = new ArrayList<>();
        List<String> weakSubjects = new ArrayList<>();
        List<String> strongSubjects = new ArrayList<>();

        for (Map.Entry<String, List<MockTestSubjectResult>> entry : subjectMap.entrySet()) {
            String subject = entry.getKey();
            List<MockTestSubjectResult> sResults = entry.getValue();

            int correct = 0;
            int wrong = 0;
            int skipped = 0;
            double scoreSum = 0.0;

            for (MockTestSubjectResult r : sResults) {
                correct += r.getCorrectAnswers();
                wrong += r.getWrongAnswers();
                skipped += r.getSkippedQuestions();
                scoreSum += r.getScore();
            }

            int totalAns = correct + wrong;
            double accuracy = totalAns > 0 ? ((double) correct / totalAns) * 100.0 : 0.0;
            // Fix: divide scoreSum by sResults.size() instead of completedSessions.size()
            double avgSubScore = sResults.isEmpty() ? 0.0 : scoreSum / sResults.size();

            subjectBreakdowns.add(new AnalyticsResponse.SubjectAnalytics(
                    subject, correct, wrong, skipped, avgSubScore, accuracy
            ));

            if (accuracy < 50.0) {
                weakSubjects.add(subject);
            } else if (accuracy >= 70.0) {
                strongSubjects.add(subject);
            }
        }

        // 3. Bulk Fetch Difficulty aggregates
        List<MockTestDifficultyResult> allDiffResults = difficultyResultRepository.findByMockTestSessionIn(completedSessions);
        Map<String, List<MockTestDifficultyResult>> diffMap = allDiffResults.stream()
                .collect(Collectors.groupingBy(MockTestDifficultyResult::getDifficultyLevel));

        List<AnalyticsResponse.DifficultyAnalytics> difficultyBreakdowns = new ArrayList<>();
        for (Map.Entry<String, List<MockTestDifficultyResult>> entry : diffMap.entrySet()) {
            String diff = entry.getKey();
            List<MockTestDifficultyResult> dResults = entry.getValue();

            int correct = 0;
            int wrong = 0;
            int skipped = 0;

            for (MockTestDifficultyResult r : dResults) {
                correct += r.getCorrectAnswers();
                wrong += r.getWrongAnswers();
                skipped += r.getSkippedQuestions();
            }

            int totalAns = correct + wrong;
            double accuracy = totalAns > 0 ? ((double) correct / totalAns) * 100.0 : 0.0;

            difficultyBreakdowns.add(new AnalyticsResponse.DifficultyAnalytics(
                    diff, correct, wrong, skipped, accuracy
            ));
        }

        // 4. History list (Limit to last 10 completed sessions)
        List<AnalyticsResponse.HistoryItem> history = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (MockTestSession session : completedSessions) {
            final MockTestSession fSession = session;
            Optional<MockTestResult> resOpt = results.stream()
                    .filter(r -> r.getMockTestSession().getId().equals(fSession.getId()))
                    .findFirst();

            double score = session.getScore() != null ? session.getScore() : 0.0;
            int correct = resOpt.map(MockTestResult::getCorrectAnswers).orElse(0);
            int wrong = resOpt.map(MockTestResult::getWrongAnswers).orElse(0);
            double accuracy = resOpt.map(MockTestResult::getAccuracy).orElse(0.0);
            double percentage = resOpt.map(MockTestResult::getPercentage).orElse(0.0);
            int timeTaken = resOpt.map(r -> (int) r.getTimeTakenSeconds()).orElse(0);
            String dateText = session.getCompletedAt() != null ? session.getCompletedAt().format(formatter) : "";

            history.add(new AnalyticsResponse.HistoryItem(
                    session.getId(),
                    session.getPracticeSession().getId(),
                    session.getAttemptNumber() != null ? session.getAttemptNumber() : 1,
                    percentage,
                    timeTaken,
                    session.getPracticeSession().getTitle(),
                    dateText,
                    score,
                    correct,
                    wrong,
                    accuracy
            ));
        }

        // Limit history list size to 10 items
        if (history.size() > 10) {
            history = history.subList(0, 10);
        }

        return new AnalyticsResponse(
                totalTests,
                averageScore,
                averageAccuracy,
                streak,
                subjectBreakdowns,
                difficultyBreakdowns,
                weakSubjects,
                strongSubjects,
                history
        );
    }

    private int calculateStreak(List<MockTestSession> sessions) {
        if (sessions.isEmpty()) return 0;

        Set<LocalDate> dates = new HashSet<>();
        for (MockTestSession s : sessions) {
            if (s.getCompletedAt() != null) {
                dates.add(s.getCompletedAt().toLocalDate());
            } else if (s.getStartedAt() != null) {
                dates.add(s.getStartedAt().toLocalDate());
            }
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        if (!dates.contains(today) && !dates.contains(yesterday)) {
            return 0;
        }

        int streak = 0;
        LocalDate current = dates.contains(today) ? today : yesterday;

        while (dates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }

        return streak;
    }
}
