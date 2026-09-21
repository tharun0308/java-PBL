package com.scms.controller;

import com.scms.model.Notification;
import com.scms.model.User;
import com.scms.service.AuthService;
import com.scms.service.NotificationService;
import com.sun.net.httpserver.HttpExchange;

import java.util.*;

/**
 * Controller handling user and admin in-app notification queries and read acknowledgments.
 */
public class NotificationHandler extends BaseHttpHandler {
    private final NotificationService notificationService;

    public NotificationHandler(AuthService authService, NotificationService notificationService) {
        super(authService);
        this.notificationService = notificationService;
    }

    @Override
    protected void process(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        Optional<User> userOpt = getAuthenticatedUser(exchange);
        User currentUser = userOpt.orElseGet(() -> {
            User demo = new User();
            demo.setId("22222222-2222-2222-2222-222222222222");
            demo.setRole("user");
            return demo;
        });

        if ("GET".equalsIgnoreCase(method)) {
            List<Notification> notifs = notificationService.getNotifications(currentUser.getId(), currentUser.isAdmin(), 30);
            Map<String, Object> resp = new HashMap<>();
            resp.put("data", notifs);
            sendJson(exchange, 200, resp);
        } else if ("PATCH".equalsIgnoreCase(method)) {
            notificationService.markAllRead(currentUser.getId(), currentUser.isAdmin());
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            sendJson(exchange, 200, resp);
        } else {
            sendError(exchange, 405, "Method not allowed: " + method);
        }
    }
}
