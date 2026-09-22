package com.scms.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private final long capacity;
    private final long refillTokens;
    private final long refillDurationMinutes;

    public RateLimiterService(
            @Value("${app.rate-limiting.capacity:10}") long capacity,
            @Value("${app.rate-limiting.refill-tokens:10}") long refillTokens,
            @Value("${app.rate-limiting.refill-duration-minutes:1}") long refillDurationMinutes) {
        this.capacity = capacity;
        this.refillTokens = refillTokens;
        this.refillDurationMinutes = refillDurationMinutes;
    }

    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, this::newBucket);
    }

    private Bucket newBucket(String key) {
        Bandwidth limit = Bandwidth.classic(
                capacity,
                Refill.greedy(refillTokens, Duration.ofMinutes(refillDurationMinutes))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
