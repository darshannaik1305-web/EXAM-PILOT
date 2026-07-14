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

        // 3. Delegate to Google Gemini API via FastAPI
        return fastApiClient.chatWithMentor(requestDto);
    }
}
