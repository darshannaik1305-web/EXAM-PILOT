package com.AI_BASED.BACKEND;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MockTesterApplication {

	public static void main(String[] args) {
		// Load .env file from BACKEND or project root if present
		try {
			java.nio.file.Path envPath = java.nio.file.Paths.get(".env");
			if (!java.nio.file.Files.exists(envPath)) {
				envPath = java.nio.file.Paths.get("../.env");
			}
			if (java.nio.file.Files.exists(envPath)) {
				java.util.List<String> lines = java.nio.file.Files.readAllLines(envPath);
				for (String line : lines) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIdx = line.indexOf('=');
					if (eqIdx > 0) {
						String key = line.substring(0, eqIdx).trim();
						String value = line.substring(eqIdx + 1).trim();
						if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						}
						// Set property if not already defined in system OS environment
						if (System.getenv(key) == null && System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					}
				}
			}
		} catch (Exception e) {
			System.err.println("Warning: Failed to load local .env file: " + e.getMessage());
		}

		SpringApplication.run(MockTesterApplication.class, args);
	}

}

