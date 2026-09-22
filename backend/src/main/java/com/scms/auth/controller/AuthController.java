package com.scms.auth.controller;

import com.scms.auth.dto.*;
import com.scms.auth.service.AuthService;
import com.scms.common.ApiResponse;
import com.scms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, and identity verification")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new account", description = "Registers a new student/teacher account with LOCAL provider and default STUDENT_TEACHER role")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Authenticates credentials and returns short-lived JWT access token plus refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Rotates refresh token and issues a new JWT access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/oauth/exchange")
    @Operation(summary = "Exchange OAuth one-time code for JWT tokens", description = "Validates and consumes a short-lived one-time code to retrieve access/refresh tokens securely")
    public ResponseEntity<ApiResponse<AuthResponse>> exchangeOAuthCode(@Valid @RequestBody OAuthExchangeRequest request) {
        AuthResponse response = authService.exchangeOAuthCode(request);
        return ResponseEntity.ok(ApiResponse.success("OAuth authentication exchange successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns metadata and active role of the caller")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserSummaryDto summary = authService.getCurrentUserSummary(principal);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Revokes the provided refresh token in the database")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) TokenRefreshRequest request) {
        if (request != null) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
