package com.scms.controller;

import com.scms.model.AiClassificationResult;
import com.scms.model.Complaint;
import com.scms.model.User;
import com.scms.service.AiTriageService;
import com.scms.service.AuthService;
import com.scms.service.ComplaintService;
import com.scms.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;

import java.util.*;

/**
 * Controller handling all complaint REST endpoints, role restrictions, AI classification,
 * duplicate warnings, and audit updates.
 */
public class ComplaintHandler extends BaseHttpHandler {
    private final ComplaintService complaintService;
    private final AiTriageService aiTriageService;

    public ComplaintHandler(AuthService authService, ComplaintService complaintService, AiTriageService aiTriageService) {
        super(authService);
        this.complaintService = complaintService;
        this.aiTriageService = aiTriageService;
    }

    @Override
    protected void process(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Optional<User> currentUserOpt = getAuthenticatedUser(exchange);
        // Default to student if not logged in (for testing / demo simplicity)
        User currentUser = currentUserOpt.orElseGet(() -> {
            User demo = new User();
            demo.setId("22222222-2222-2222-2222-222222222222");
            demo.setEmail("student@college.edu");
            demo.setFull_name("Alex Johnson");
            demo.setRole("user");
            return demo;
        });

        // 1. /api/complaints/check-duplicate
        if (path.contains("/check-duplicate")) {
            handleCheckDuplicate(exchange);
            return;
        }

        // 2. /api/complaints/ai-classify
        if (path.contains("/ai-classify") && "POST".equalsIgnoreCase(method)) {
            handleAiClassify(exchange);
            return;
        }

        // 3. /api/complaints/{id}/status
        if (path.matches(".*/api/complaints/[^/]+/status/?") && "PATCH".equalsIgnoreCase(method)) {
            String id = extractId(path, "/status");
            handleUpdateStatus(exchange, id, currentUser);
            return;
        }

        // 4. /api/complaints/{id}/feedback
        if (path.matches(".*/api/complaints/[^/]+/feedback/?") && "POST".equalsIgnoreCase(method)) {
            String id = extractId(path, "/feedback");
            handleFeedback(exchange, id, currentUser);
            return;
        }

        // 5. /api/complaints/{id}
        if (path.matches(".*/api/complaints/[a-zA-Z0-9\\-]+/?$") && !path.endsWith("/complaints") && !path.endsWith("/complaints/")) {
            String id = path.replaceAll(".*/api/complaints/", "").replaceAll("/.*", "");
            if ("GET".equalsIgnoreCase(method)) {
                handleGetById(exchange, id);
                return;
            }
        }

        // 6. /api/complaints (collection)
        if (path.endsWith("/complaints") || path.endsWith("/complaints/")) {
            if ("GET".equalsIgnoreCase(method)) {
                handleList(exchange, currentUser);
            } else if ("POST".equalsIgnoreCase(method)) {
                handleCreate(exchange, currentUser);
            } else {
                sendError(exchange, 405, "Method not allowed: " + method);
            }
            return;
        }

        sendError(exchange, 404, "Endpoint not found: " + path);
    }

    private void handleList(HttpExchange exchange, User currentUser) throws Exception {
        Map<String, String> query = parseQueryParams(exchange);
        String status = query.get("status");
        String category = query.get("category");
        String priority = query.get("priority");
        String search = query.get("search");

        List<Complaint> complaints = complaintService.getComplaints(currentUser, status, category, priority, search);
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", complaints);
        sendJson(exchange, 200, resp);
    }

    private void handleCreate(HttpExchange exchange, User currentUser) throws Exception {
        // Enforce role rule: Admins cannot file complaints
        if (currentUser != null && currentUser.isAdmin()) {
            sendError(exchange, 403, "Administrators manage campus complaints and cannot file new complaints.");
            return;
        }

        String body = readRequestBody(exchange);
        Map<String, Object> req = JsonUtil.parseObject(body);

        String category = (String) req.get("category");
        String location = (String) req.get("location");
        String description = (String) req.get("description");
        String priority = (String) req.get("priority");
        String imageUrl = (String) req.get("image_url");

        try {
            Complaint created = complaintService.createComplaint(currentUser, category, location, description, priority, imageUrl);
            Map<String, Object> resp = new HashMap<>();
            resp.put("data", created);
            sendJson(exchange, 201, resp);
        } catch (SecurityException e) {
            sendError(exchange, 403, e.getMessage());
        } catch (IllegalArgumentException e) {
            sendError(exchange, 400, e.getMessage());
        }
    }

    private void handleGetById(HttpExchange exchange, String id) throws Exception {
        Optional<Complaint> opt = complaintService.getComplaintById(id);
        if (opt.isEmpty()) {
            sendError(exchange, 404, "Complaint not found with ID: " + id);
            return;
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", opt.get());
        sendJson(exchange, 200, resp);
    }

    private void handleUpdateStatus(HttpExchange exchange, String id, User currentUser) throws Exception {
        String body = readRequestBody(exchange);
        Map<String, Object> req = JsonUtil.parseObject(body);

        String status = (String) req.get("status");
        String assignedTo = (String) req.get("assigned_to");
        String resolutionNote = (String) req.get("resolution_note");
        String resolutionImageUrl = (String) req.get("resolution_image_url");
        String note = (String) req.get("note");

        try {
            Complaint updated = complaintService.updateComplaintStatus(id, status, assignedTo, resolutionNote, resolutionImageUrl, note, currentUser);
            Map<String, Object> resp = new HashMap<>();
            resp.put("data", updated);
            sendJson(exchange, 200, resp);
        } catch (NoSuchElementException e) {
            sendError(exchange, 404, e.getMessage());
        }
    }

    private void handleFeedback(HttpExchange exchange, String id, User currentUser) throws Exception {
        String body = readRequestBody(exchange);
        Map<String, Object> req = JsonUtil.parseObject(body);

        Object ratingObj = req.get("rating");
        int rating = ratingObj instanceof Number ? ((Number) ratingObj).intValue() : 5;
        String feedbackNote = (String) req.get("feedback_note");

        try {
            Complaint updated = complaintService.addFeedback(id, rating, feedbackNote, currentUser);
            Map<String, Object> resp = new HashMap<>();
            resp.put("data", updated);
            sendJson(exchange, 200, resp);
        } catch (NoSuchElementException e) {
            sendError(exchange, 404, e.getMessage());
        } catch (SecurityException e) {
            sendError(exchange, 403, e.getMessage());
        }
    }

    private void handleCheckDuplicate(HttpExchange exchange) throws Exception {
        String category = null;
        String location = null;

        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            String body = readRequestBody(exchange);
            Map<String, Object> req = JsonUtil.parseObject(body);
            category = (String) req.get("category");
            location = (String) req.get("location");
        } else {
            Map<String, String> query = parseQueryParams(exchange);
            category = query.get("category");
            location = query.get("location");
        }

        if (category == null || location == null || location.trim().length() < 3) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("data", Collections.emptyList());
            sendJson(exchange, 200, resp);
            return;
        }

        // Search among all complaints as admin
        User adminView = new User();
        adminView.setRole("admin");
        List<Complaint> allComplaints = complaintService.getComplaints(adminView, null, null, null, null);
        List<Complaint> duplicates = aiTriageService.findPotentialDuplicates(allComplaints, category, location);

        List<Map<String, Object>> summaryList = new ArrayList<>();
        for (int i = 0; i < Math.min(3, duplicates.size()); i++) {
            Complaint d = duplicates.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", d.getId());
            item.put("complaint_number", d.getComplaint_number());
            item.put("location", d.getLocation());
            item.put("category", d.getCategory());
            item.put("status", d.getStatus());
            item.put("created_at", d.getCreated_at());
            summaryList.add(item);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", summaryList);
        sendJson(exchange, 200, resp);
    }

    private void handleAiClassify(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        Map<String, Object> req = JsonUtil.parseObject(body);
        String description = (String) req.get("description");
        String location = (String) req.get("location");

        AiClassificationResult result = aiTriageService.classify(description, location);
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result);
        sendJson(exchange, 200, resp);
    }

    private String extractId(String path, String suffix) {
        String prefix = "/api/complaints/";
        int start = path.indexOf(prefix);
        if (start < 0) return "";
        int end = path.indexOf(suffix, start + prefix.length());
        if (end < 0) end = path.length();
        return path.substring(start + prefix.length(), end).replaceAll("/", "");
    }
}
