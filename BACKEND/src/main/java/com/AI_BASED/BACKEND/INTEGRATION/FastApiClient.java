package com.AI_BASED.BACKEND.INTEGRATION;

import com.AI_BASED.BACKEND.DTO.ExtractionResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;

@Component
public class FastApiClient {

    private final RestClient restClient;

    public FastApiClient(
            @Value("${app.fastapi.url:http://localhost:8000}") String fastApiUrl,
            @Value("${app.fastapi.connect-timeout:10s}") Duration connectTimeout,
            @Value("${app.fastapi.read-timeout:180s}") Duration readTimeout
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) connectTimeout.toMillis());
        requestFactory.setReadTimeout((int) readTimeout.toMillis());

        this.restClient = RestClient.builder()
                .baseUrl(fastApiUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public ExtractionResponseDto uploadPdf(MultipartFile file, String processingJobId) throws IOException {
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        }, MediaType.parseMediaType(file.getContentType()));


        var body = bodyBuilder.build();

        return restClient.post()
                .uri("/upload")
                .header("X-Processing-Job-Id", processingJobId)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(ExtractionResponseDto.class);
    }

    public com.AI_BASED.BACKEND.DTO.MentorChatResponseDto chatWithMentor(com.AI_BASED.BACKEND.DTO.MentorChatRequestDto request) {
        return restClient.post()
                .uri("/mentor/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(com.AI_BASED.BACKEND.DTO.MentorChatResponseDto.class);
    }

    public boolean isFastApiAvailable() {
        try {
            ResponseEntity<Void> response = restClient.get()
                    .uri("/health")
                    .retrieve()
                    .toBodilessEntity();
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}
