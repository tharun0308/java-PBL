package com.scms.controller;

import com.scms.model.User;
import com.scms.service.AuthService;
import com.scms.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;

import java.util.*;

/**
 * Controller handling user login, registration, logout, and current session resolution.
 */
public class AuthHandler extends BaseHttpHandler {

    public AuthHandler(AuthService authService) {
        super(authService);
    }

    @Override
    protected void process(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (path.endsWith("/login") && "POST".equalsIgnoreCase(method)) {
            handleLogin(exchange);
        } else if (path.endsWith("/register") && "POST".equalsIgnoreCase(method)) {
            handleRegister(exchange);
        } else if (path.endsWith("/logout") && "POST".equalsIgnoreCase(method)) {
            handleLogout(exchange);
        } else if (path.endsWith("/me") && "GET".equalsIgnoreCase(method)) {
            handleMe(exchange);
        } else {
            sendError(exchange, 404, "Endpoint not found: " + path);
        }
    }

    private void handleLogin(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        Map<String, Object> req = JsonUtil.parseObject(body);
        String email = (String) req.get("email");
        String password = (String) req.get("password");

        if (email == null || password == null) {
            sendError(exchange, 400, "Email and password are required.");
            return;
        }

        Optional<User> userOpt = authService.authenticate(email, password);
        if (userOpt.isEmpty()) {
            sendError(exchange, 401, "Invalid email or password.");
            return;
        }

        User user = userOpt.get();
        String token = authService.createSessionToken(user);
        setSessionCookie(exchange, token);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("token", token);
        resp.put("user", sanitizeUser(user));
        sendJson(exchange, 200, resp);
    }

    private void handleRegister(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        Map<String, Object> req = JsonUtil.parseObject(body);
        String email = (String) req.get("email");
        String password = (String) req.get("password");
        String fullName = (String) req.get("full_name");

        if (email == null || password == null || fullName == null) {
            sendError(exchange, 400, "Email, password, and full name are required.");
            return;
        }

        try {
            User newUser = authService.register(email, password, fullName);
            String token = authService.createSessionToken(newUser);
            setSessionCookie(exchange, token);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("success", true);
            resp.put("token", token);
            resp.put("user", sanitizeUser(newUser));
            sendJson(exchange, 201, resp);
        } catch (IllegalArgumentException e) {
            sendError(exchange, 400, e.getMessage());
        }
    }

    private void handleLogout(HttpExchange exchange) throws Exception {
        clearSessionCookie(exchange);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        sendJson(exchange, 200, resp);
    }

    private void handleMe(HttpExchange exchange) throws Exception {
        Optional<User> userOpt = getAuthenticatedUser(exchange);
        if (userOpt.isEmpty()) {
            sendError(exchange, 401, "Not authenticated.");
            return;
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("user", sanitizeUser(userOpt.get()));
        sendJson(exchange, 200, resp);
    }

    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> safe = new LinkedHashMap<>();
        safe.put("id", user.getId());
        safe.put("email", user.getEmail());
        safe.put("full_name", user.getFull_name());
        safe.put("role", user.getRole());
        safe.put("created_at", user.getCreated_at());
        return safe;
    }
}
