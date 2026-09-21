package com.scms.service;

import com.scms.model.User;
import com.scms.repository.UserRepository;
import com.scms.util.JsonUtil;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

/**
 * Service managing user authentication, sessions, registration, and role verification.
 */
public class AuthService {
    public static final String SESSION_COOKIE_NAME = "scms_session";

    private final UserRepository userRepository;

    public AuthService() {
        this.userRepository = new UserRepository();
    }

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> authenticate(String email, String password) {
        if (email == null || password == null) return Optional.empty();
        Optional<User> opt = userRepository.findByEmail(email.trim());
        if (opt.isPresent() && password.equals(opt.get().getPassword())) {
            return opt;
        }
        return Optional.empty();
    }

    public User register(String email, String password, String fullName) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(email.trim().toLowerCase());
        newUser.setPassword(password);
        newUser.setFull_name(fullName.trim());
        newUser.setRole("user"); // default role is student/staff
        newUser.setCreated_at(Instant.now().toString());

        return userRepository.save(newUser);
    }

    public String createSessionToken(User user) {
        Map<String, Object> session = new LinkedHashMap<>();
        session.put("id", user.getId());
        session.put("email", user.getEmail());
        session.put("full_name", user.getFull_name());
        session.put("role", user.getRole());

        String json = JsonUtil.toJson(session);
        return Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    public Optional<User> verifySessionToken(String token) {
        if (token == null || token.isEmpty()) return Optional.empty();
        try {
            byte[] decoded = Base64.getDecoder().decode(token.trim());
            String json = new String(decoded, StandardCharsets.UTF_8);
            Map<String, Object> session = JsonUtil.parseObject(json);
            String id = (String) session.get("id");
            if (id == null) return Optional.empty();

            // Look up up-to-date user
            Optional<User> stored = userRepository.findById(id);
            if (stored.isPresent()) {
                return stored;
            }

            // Fallback to session info
            User u = new User();
            u.setId(id);
            u.setEmail((String) session.get("email"));
            u.setFull_name((String) session.get("full_name"));
            u.setRole((String) session.get("role"));
            return Optional.of(u);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
