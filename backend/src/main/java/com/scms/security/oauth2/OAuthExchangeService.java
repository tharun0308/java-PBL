package com.scms.security.oauth2;

import com.scms.auth.dto.AuthResponse;
import com.scms.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthExchangeService {

    private static class ExchangeEntry {
        final AuthResponse authResponse;
        final Instant expiresAt;

        ExchangeEntry(AuthResponse authResponse, Instant expiresAt) {
            this.authResponse = authResponse;
            this.expiresAt = expiresAt;
        }
    }

    // Thread-safe map for one-time exchange codes
    private final Map<String, ExchangeEntry> codeCache = new ConcurrentHashMap<>();

    /**
     * Stores an AuthResponse under a one-time random exchange code with a 60-second TTL.
     */
    public String createExchangeCode(AuthResponse response) {
        // Clean up expired codes
        Instant now = Instant.now();
        codeCache.entrySet().removeIf(entry -> entry.getValue().expiresAt.isBefore(now));

        String code = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        codeCache.put(code, new ExchangeEntry(response, now.plusSeconds(60)));
        return code;
    }

    /**
     * Consumes and invalidates the one-time code immediately, returning the AuthResponse.
     */
    public AuthResponse consumeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Exchange code is required.");
        }

        ExchangeEntry entry = codeCache.remove(code);
        if (entry == null || entry.expiresAt.isBefore(Instant.now())) {
            throw new BadRequestException("Exchange code is invalid, has expired, or has already been used.");
        }

        return entry.authResponse;
    }
}
