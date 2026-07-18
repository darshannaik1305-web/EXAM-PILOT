package com.AI_BASED.BACKEND.CONFIG;

import com.AI_BASED.BACKEND.ENTITY.PracticeSession;
import com.AI_BASED.BACKEND.INTEGRATION.FastApiClient;
import com.AI_BASED.BACKEND.REPOSITORY.PracticeSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StartupAssetSync implements CommandLineRunner {

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private FastApiClient fastApiClient;

    @Override
    public void run(String... args) {
        // Run sync-active session cleanup asynchronously so it doesn't block server start
        new Thread(() -> {
            try {
                // Wait briefly for FastApi server to boot up
                Thread.sleep(5000);
                
                System.out.println("[StartupAssetSync] Synchronizing active session assets...");
                List<String> activePdfNames = practiceSessionRepository.findAll()
                        .stream()
                        .map(PracticeSession::getOriginalPdfName)
                        .filter(name -> name != null && !name.isBlank())
                        .collect(Collectors.toList());
                
                fastApiClient.syncActiveSessionFiles(activePdfNames);
                System.out.println("[StartupAssetSync] Session assets synchronized successfully.");
            } catch (Exception e) {
                System.err.println("[StartupAssetSync] Failed to synchronize assets: " + e.getMessage());
            }
        }).start();
    }
}
