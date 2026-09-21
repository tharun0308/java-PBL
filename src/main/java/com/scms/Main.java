package com.scms;

import com.scms.controller.*;
import com.scms.repository.*;
import com.scms.service.*;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * Main application entrypoint for Smart Complaint Management System (SCMS).
 * Spins up an embedded pure Java HTTP server on port 8080 (or PORT environment variable)
 * serving all REST endpoints and rich web client interface.
 */
public class Main {
    private static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        String portEnv = System.getenv("PORT");
        if (portEnv != null) {
            try {
                port = Integer.parseInt(portEnv.trim());
            } catch (NumberFormatException ignored) {}
        }

        try {
            // 1. Initialize Persistence Layer
            String dataDir = System.getProperty("user.dir") + File.separator + "data";
            String dataPath = dataDir + File.separator + "scms_data.json";
            DataStore.init(dataPath);

            // 2. Initialize Service Layer
            UserRepository userRepository = new UserRepository();
            ComplaintRepository complaintRepository = new ComplaintRepository();
            NotificationRepository notificationRepository = new NotificationRepository();

            AuthService authService = new AuthService(userRepository);
            NotificationService notificationService = new NotificationService(notificationRepository);
            ComplaintService complaintService = new ComplaintService(complaintRepository, userRepository, notificationService);
            AiTriageService aiTriageService = new AiTriageService();
            ReportService reportService = new ReportService(complaintRepository);
            CsvExportService csvExportService = new CsvExportService();

            // 3. Create HTTP Server
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
            server.setExecutor(Executors.newFixedThreadPool(16));

            // 4. Register HTTP Handlers
            server.createContext("/api/auth", new AuthHandler(authService));
            server.createContext("/api/complaints", new ComplaintHandler(authService, complaintService, aiTriageService));
            server.createContext("/api/notifications", new NotificationHandler(authService, notificationService));
            server.createContext("/api/reports", new ReportHandler(authService, reportService));
            server.createContext("/api/export", new CsvExportHandler(authService, complaintService, csvExportService));
            server.createContext("/", new WebUiHandler(authService));

            // 5. Start Server
            server.start();

            System.out.println("===============================================================");
            System.out.println("  ⚡ SCMS - Smart Complaint Management System (Java Backend)");
            System.out.println("===============================================================");
            System.out.println("  ✓ Embedded Java HTTP Server running on: http://localhost:" + port);
            System.out.println("  ✓ REST API Endpoints active at:        http://localhost:" + port + "/api/");
            System.out.println("  ✓ Web UI Client available at:          http://localhost:" + port + "/");
            System.out.println("  ✓ Data file persisted at:              " + dataPath);
            System.out.println("  ✓ Admin complaints role barrier:       Strictly Enforced");
            System.out.println("  ✓ Press Ctrl+C to stop.");
            System.out.println("===============================================================");

        } catch (IOException e) {
            System.err.println("Fatal error starting SCMS server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
