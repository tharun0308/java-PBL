package com.scms.controller;

import com.scms.model.User;
import com.scms.service.AuthService;
import com.scms.util.JsonUtil;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Base HTTP Handler providing CORS, standard JSON responses, query parsing,
 * request body extraction, and cookie session resolution.
 */
public abstract class BaseHttpHandler implements HttpHandler {
    protected final AuthService authService;

    public BaseHttpHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        addCorsHeaders(exchange);

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        try {
            process(exchange);
        } catch (SecurityException e) {
            sendError(exchange, 403, e.getMessage());
        } catch (IllegalArgumentException e) {
            sendError(exchange, 400, e.getMessage());
        } catch (NoSuchElementException e) {
            sendError(exchange, 404, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, e.getMessage() != null ? e.getMessage() : "Internal Server Error");
        } finally {
            exchange.close();
        }
    }

    protected abstract void process(HttpExchange exchange) throws Exception;

    protected void addCorsHeaders(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
        headers.set("Access-Control-Allow-Credentials", "true");
    }

    protected void sendJson(HttpExchange exchange, int statusCode, Object data) throws IOException {
        String json = JsonUtil.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(statusCode, bytes.length);
            return;
        }
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    protected void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        Map<String, Object> err = new HashMap<>();
        err.put("error", message);
        sendJson(exchange, statusCode, err);
    }

    protected String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int n;
            while ((n = is.read(buf)) != -1) {
                baos.write(buf, 0, n);
            }
            return baos.toString(StandardCharsets.UTF_8);
        }
    }

    protected Map<String, String> parseQueryParams(HttpExchange exchange) {
        Map<String, String> params = new HashMap<>();
        String query = exchange.getRequestURI().getRawQuery();
        if (query == null || query.isEmpty()) return params;

        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                params.put(key, val);
            } else if (idx < 0 && !pair.isEmpty()) {
                params.put(URLDecoder.decode(pair, StandardCharsets.UTF_8), "");
            }
        }
        return params;
    }

    protected Optional<User> getAuthenticatedUser(HttpExchange exchange) {
        // 1. Check Cookie header
        Headers headers = exchange.getRequestHeaders();
        List<String> cookieHeaders = headers.get("Cookie");
        if (cookieHeaders != null) {
            for (String ch : cookieHeaders) {
                String[] cookies = ch.split(";");
                for (String c : cookies) {
                    String[] parts = c.trim().split("=", 2);
                    if (parts.length == 2 && AuthService.SESSION_COOKIE_NAME.equals(parts[0])) {
                        Optional<User> u = authService.verifySessionToken(parts[1]);
                        if (u.isPresent()) return u;
                    }
                }
            }
        }

        // 2. Check Authorization Bearer header
        String authHeader = headers.getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authService.verifySessionToken(token);
        }

        return Optional.empty();
    }

    protected void setSessionCookie(HttpExchange exchange, String token) {
        String cookieVal = String.format("%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
                AuthService.SESSION_COOKIE_NAME, token, 7 * 24 * 3600);
        exchange.getResponseHeaders().add("Set-Cookie", cookieVal);
    }

    protected void clearSessionCookie(HttpExchange exchange) {
        String cookieVal = String.format("%s=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
                AuthService.SESSION_COOKIE_NAME);
        exchange.getResponseHeaders().add("Set-Cookie", cookieVal);
    }
}
