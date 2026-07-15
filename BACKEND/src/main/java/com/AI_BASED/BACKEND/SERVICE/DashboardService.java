package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.DashboardResponse;
import com.AI_BASED.BACKEND.ENTITY.*;
import com.AI_BASED.BACKEND.REPOSITORY.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private MockTestSessionRepository mockTestSessionRepository;

    @Autowired
    private MockTestResultRepository mockTestResultRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats(User user) {
        // 1. Count only successfully processed practice sessions (READY)
        long totalReadySessions = practiceSessionRepository.countByUserAndStatus(user, PracticeSessionStatus.READY);

        // 2. Fetch all mock test sessions for user to calculate streak & completed statistics
        List<MockTestSession> allSessions = mockTestSessionRepository.findByUserOrderByStartedAtDesc(user);

        List<MockTestSession> completedSessions = allSessions.stream()
                .filter(s -> s.getStatus() == MockTestStatus.COMPLETED)
                .collect(Collectors.toList());

        int streak = calculateStreak(allSessions);

        if (completedSessions.isEmpty()) {
            return new DashboardResponse(totalReadySessions, 0.0, 0.0, streak);
        }

        // 3. Fetch all results for completed sessions to compute overall accuracy and solving speed
        List<MockTestResult> results = mockTestResultRepository.findByMockTestSessionIn(completedSessions);

        long totalTimeTakenSeconds = 0;
        long totalAttemptedQuestions = 0;
        long totalCorrectAnswers = 0;
        long totalAnsweredQuestions = 0; // correct + wrong

        for (MockTestResult result : results) {
            totalTimeTakenSeconds += result.getTimeTakenSeconds();
            totalAttemptedQuestions += result.getAttemptedQuestions();
            totalCorrectAnswers += result.getCorrectAnswers();
            totalAnsweredQuestions += (result.getCorrectAnswers() + result.getWrongAnswers());
        }

        double averageSolvingSpeed = totalAttemptedQuestions > 0 
                ? (double) totalTimeTakenSeconds / totalAttemptedQuestions 
                : 0.0;

        double overallTestAccuracy = totalAnsweredQuestions > 0 
                ? ((double) totalCorrectAnswers / totalAnsweredQuestions) * 100.0 
                : 0.0;

        return new DashboardResponse(
                totalReadySessions,
                averageSolvingSpeed,
                overallTestAccuracy,
                streak
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
