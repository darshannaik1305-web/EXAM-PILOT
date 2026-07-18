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

    public java.util.Map<String, String> uploadAnswerKeyPdf(MultipartFile file, Integer expectedCount) throws IOException {
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        }, MediaType.parseMediaType(file.getContentType()));

        if (expectedCount != null) {
            bodyBuilder.part("expectedCount", expectedCount);
        }

        var body = bodyBuilder.build();

        var response = restClient.post()
                .uri("/answer-key")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(java.util.Map.class);

        if (response != null && response.get("answers") != null) {
            return (java.util.Map<String, String>) response.get("answers");
        }
        return java.util.Collections.emptyMap();
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

    /**
     * Calls the FastAPI /cleanup endpoint to remove the uploaded PDF and any
     * cropped diagram images associated with this session from the AI Service disk.
     * Errors are swallowed — cleanup is best-effort so it never blocks session deletion.
     *
     * @param originalPdfName the original filename of the uploaded PDF (e.g. "jee2025.pdf")
     */
    public void cleanupSessionFiles(String originalPdfName) {
        if (originalPdfName == null || originalPdfName.isBlank()) return;
        try {
            restClient.delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/cleanup")
                            .queryParam("original_pdf_name", originalPdfName)
                            .build())
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // Cleanup is best-effort; log but do not propagate
            System.err.println("[FastApiClient] cleanupSessionFiles failed for '" + originalPdfName + "': " + e.getMessage());
        }
    }

    public void syncActiveSessionFiles(java.util.List<String> activePdfNames) {
        try {
            restClient.post()
                    .uri("/cleanup/sync-active")
                    .contentType(MediaType.parseMediaType("application/json"))
                    .body(activePdfNames)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("[FastApiClient] syncActiveSessionFiles failed: " + e.getMessage());
        }
    }

    public String getAiServiceVersion() {
        try {
            java.util.Map<?, ?> response = restClient.get()
                    .uri("/health")
                    .retrieve()
                    .body(java.util.Map.class);
            if (response != null && response.containsKey("version")) {
                return String.valueOf(response.get("version"));
            }
            return "Unknown";
        } catch (Exception e) {
            return "Offline";
        }
    }
}

