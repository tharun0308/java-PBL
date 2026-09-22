package com.scms.service;

import com.scms.auth.dto.AuthResponse;
import com.scms.auth.dto.LoginRequest;
import com.scms.auth.dto.RegisterRequest;
import com.scms.auth.dto.TokenRefreshRequest;
import com.scms.auth.service.AuthService;
import com.scms.exception.BadRequestException;
import com.scms.exception.UnauthorizedException;
import com.scms.security.JwtTokenProvider;
import com.scms.security.UserPrincipal;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.RefreshToken;
import com.scms.users.entity.Role;
import com.scms.users.entity.User;
import com.scms.users.repository.RefreshTokenRepository;
import com.scms.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private com.scms.security.oauth2.OAuthExchangeService oAuthExchangeService;

    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                oAuthExchangeService,
                604800000L
        );

        sampleUser = new User("student@college.edu", "encodedPassword", "Alex Johnson", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        sampleUser.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should successfully register a new user with STUDENT_TEACHER role")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("newstudent@college.edu", "Password123!", "New Student");

        when(userRepository.existsByEmailIgnoreCase(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-jwt-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("student@college.edu", response.getUser().getEmail());
        assertEquals(Role.STUDENT_TEACHER, response.getUser().getRole());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when registering with duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("existing@college.edu", "Password123!", "Existing User");

        when(userRepository.existsByEmailIgnoreCase(request.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login user and return JWT tokens")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("student@college.edu", "Password123!");
        UserPrincipal userPrincipal = UserPrincipal.create(sampleUser);
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authToken);
        when(userRepository.findById(sampleUser.getId())).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateAccessToken(userPrincipal)).thenReturn("login-jwt-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login-jwt-token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login credentials")
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("student@college.edu", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should refresh tokens successfully and rotate refresh token")
    void testRefreshTokenSuccess() {
        String oldTokenStr = "valid-old-refresh-token";
        RefreshToken storedToken = new RefreshToken(sampleUser, oldTokenStr, Instant.now().plusSeconds(3600));

        when(refreshTokenRepository.findByToken(oldTokenStr)).thenReturn(Optional.of(storedToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("refreshed-jwt-token");

        AuthResponse response = authService.refreshToken(new TokenRefreshRequest(oldTokenStr));

        assertNotNull(response);
        assertEquals("refreshed-jwt-token", response.getAccessToken());
        assertNotEquals(oldTokenStr, response.getRefreshToken());
        verify(refreshTokenRepository, times(1)).delete(storedToken);
    }

    @Test
    @DisplayName("Should reject expired refresh token")
    void testRefreshTokenExpired() {
        String expiredTokenStr = "expired-refresh-token";
        RefreshToken expiredToken = new RefreshToken(sampleUser, expiredTokenStr, Instant.now().minusSeconds(3600));

        when(refreshTokenRepository.findByToken(expiredTokenStr)).thenReturn(Optional.of(expiredToken));

        assertThrows(UnauthorizedException.class, () -> authService.refreshToken(new TokenRefreshRequest(expiredTokenStr)));
        verify(refreshTokenRepository, times(1)).delete(expiredToken);
    }
}
