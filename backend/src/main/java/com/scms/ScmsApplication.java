package com.scms;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class ScmsApplication {

    private static final Logger log = LoggerFactory.getLogger(ScmsApplication.class);

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(ScmsApplication.class, args);
    }

    private static void loadDotenv() {
        try {
            String directory = ".";
            if (!new File(".env").exists() && new File("backend/.env").exists()) {
                directory = "backend";
            }
            Dotenv dotenv = Dotenv.configure()
                    .directory(directory)
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                if (key.startsWith("export ")) {
                    key = key.substring(7).trim();
                }
                if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                    value = value.substring(1, value.length() - 1);
                } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                    value = value.substring(1, value.length() - 1);
                }
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            });
            log.info("Loaded environment configuration from .env in directory: {}", directory);
        } catch (Exception e) {
            log.warn("Could not load .env file: {}", e.getMessage());
        }
    }
}
