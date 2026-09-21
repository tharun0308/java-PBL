package com.scms.controller;

import com.scms.model.Complaint;
import com.scms.model.User;
import com.scms.service.AuthService;
import com.scms.service.ComplaintService;
import com.scms.service.CsvExportService;
import com.sun.net.httpserver.HttpExchange;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller providing CSV data export streams for campus administrative reporting.
 */
public class CsvExportHandler extends BaseHttpHandler {
    private final ComplaintService complaintService;
    private final CsvExportService csvExportService;

    public CsvExportHandler(AuthService authService, ComplaintService complaintService, CsvExportService csvExportService) {
        super(authService);
        this.complaintService = complaintService;
        this.csvExportService = csvExportService;
    }

    @Override
    protected void process(HttpExchange exchange) throws Exception {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed: " + exchange.getRequestMethod());
            return;
        }

        Optional<User> userOpt = getAuthenticatedUser(exchange);
        User currentUser = userOpt.orElseGet(() -> {
            User admin = new User();
            admin.setRole("admin");
            return admin;
        });

        Map<String, String> query = parseQueryParams(exchange);
        String status = query.get("status");
        String category = query.get("category");
        String priority = query.get("priority");
        String search = query.get("search");

        List<Complaint> list = complaintService.getComplaints(currentUser, status, category, priority, search);
        String csv = csvExportService.exportToCsv(list);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "text/csv; charset=UTF-8");
        exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"scms-complaints.csv\"");
        exchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
