package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.*;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.INTEGRATION.FastApiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MentorService {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private FastApiClient fastApiClient;

    public MentorChatResponseDto chatWithMentor(List<MentorChatRequestDto.ChatMessageDto> clientMessages, User user) {
        // 1. Load active student statistics
        AnalyticsResponse stats = analyticsService.getStudentAnalytics(user);

        // 2. Prepare payload DTO
        MentorChatRequestDto requestDto = new MentorChatRequestDto();
        requestDto.setMessages(clientMessages);
        requestDto.setTotalTestsTaken(stats.getTotalTestsTaken());
        requestDto.setAverageScore(stats.getAverageScore());
        requestDto.setAverageAccuracy(stats.getAverageAccuracy());
        requestDto.setStudyStreak(stats.getStudyStreak());
        requestDto.setWeakSubjects(stats.getWeakSubjects());
        requestDto.setStrongSubjects(stats.getStrongSubjects());

        // Compute diagnostics
        double latestScore = stats.getHistory().isEmpty() ? 0.0 : stats.getHistory().get(0).getScore();
        double latestAccuracy = stats.getHistory().isEmpty() ? 0.0 : stats.getHistory().get(0).getAccuracy();
        double bestScore = stats.getHistory().stream().mapToDouble(com.AI_BASED.BACKEND.DTO.AnalyticsResponse.HistoryItem::getScore).max().orElse(0.0);
        double bestAccuracy = stats.getHistory().stream().mapToDouble(com.AI_BASED.BACKEND.DTO.AnalyticsResponse.HistoryItem::getAccuracy).max().orElse(0.0);
        int totalAttempts = stats.getHistory().size();
        int totalQuestionsAttempted = stats.getHistory().stream().mapToInt(h -> h.getCorrectAnswers() + h.getWrongAnswers()).sum();

        requestDto.setLatestScore(latestScore);
        requestDto.setLatestAccuracy(latestAccuracy);
        requestDto.setBestScore(bestScore);
        requestDto.setBestAccuracy(bestAccuracy);
        requestDto.setTotalAttempts(totalAttempts);
        requestDto.setTotalQuestionsAttempted(totalQuestionsAttempted);

        List<MentorChatRequestDto.SubjectStatsDto> subjectBreakdown = stats.getSubjectBreakdown() != null
                ? stats.getSubjectBreakdown().stream().map(sb -> new MentorChatRequestDto.SubjectStatsDto(
                        sb.getSubject(),
                        sb.getCorrectAnswers(),
                        sb.getWrongAnswers(),
                        sb.getSkippedQuestions(),
                        sb.getAverageScore(),
                        sb.getAccuracy()
                )).collect(java.util.stream.Collectors.toList())
                : new ArrayList<>();
        requestDto.setSubjectBreakdown(subjectBreakdown);

        // 3. Delegate to Google Gemini API via FastAPI
        return fastApiClient.chatWithMentor(requestDto);
    }
}
