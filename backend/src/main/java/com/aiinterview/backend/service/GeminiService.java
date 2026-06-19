package com.aiinterview.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // try these models in order if one fails
    private final List<String> modelUrls = List.of(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"
    );

    public GeminiService(WebClient.Builder webClientBuilder,
                         ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generate(String prompt) {
        Exception lastException = null;

        // try each model — if one fails move to next
        for (String url : modelUrls) {
            try {
                System.out.println("Trying model: " + url);
                String result = callGemini(url, prompt);
                System.out.println("Success with: " + url);
                return result;
            } catch (Exception e) {
                System.out.println("Failed with " + url + ": " + e.getMessage());
                lastException = e;

                // wait 1 second before trying next model
                try { Thread.sleep(1000); } catch (InterruptedException ie) {}
            }
        }

        throw new RuntimeException("All Gemini models failed: "
            + lastException.getMessage());
    }

    private String callGemini(String url, String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            ),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 8192
            )
        );

        String response = webClient.post()
                .uri(url + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractTextFromResponse(response);
    }

    private String extractTextFromResponse(String response) {
        try {
            var root = objectMapper.readTree(response);
            return root
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: "
                + response);
        }
    }
}