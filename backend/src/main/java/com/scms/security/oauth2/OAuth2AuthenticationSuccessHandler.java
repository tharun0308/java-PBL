package com.scms.security.oauth2;

import com.scms.auth.dto.AuthResponse;
import com.scms.auth.dto.UserSummaryDto;
import com.scms.security.JwtTokenProvider;
import com.scms.security.UserPrincipal;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.RefreshToken;
import com.scms.users.entity.Role;
import com.scms.users.entity.User;
import com.scms.users.repository.RefreshTokenRepository;
import com.scms.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final OAuthExchangeService exchangeService;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;
    private final String redirectUri;
    private final long refreshTokenExpirationMs;

    public OAuth2AuthenticationSuccessHandler(
            JwtTokenProvider tokenProvider,
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            OAuthExchangeService exchangeService,
            HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository,
            @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/auth/oauth-callback}") String redirectUri,
            @Value("${app.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs) {
        this.tokenProvider = tokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.exchangeService = exchangeService;
        this.httpCookieOAuth2AuthorizationRequestRepository = httpCookieOAuth2AuthorizationRequestRepository;
        this.redirectUri = redirectUri;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        UserPrincipal userPrincipal;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserPrincipal up) {
            userPrincipal = up;
        } else if (principal instanceof OAuth2User oAuth2User) {
            Map<String, Object> attributes = oAuth2User.getAttributes();
            String email = (String) attributes.get("email");
            String name = (String) attributes.getOrDefault("name", "Google User");

            if (email == null) {
                throw new IllegalStateException("Email attribute not found in OAuth2 principal");
            }

            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseGet(() -> {
                        User newUser = new User(email, null, name, Role.STUDENT_TEACHER, AuthProvider.GOOGLE);
                        return userRepository.save(newUser);
                    });

            userPrincipal = UserPrincipal.create(user, attributes);
        } else {
            throw new IllegalStateException("Unsupported authentication principal type: " + principal.getClass().getName());
        }

        String accessToken = tokenProvider.generateAccessToken(userPrincipal);

        // Issue refresh token in DB
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user entity not found"));

        String rawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken(
                user,
                rawRefreshToken,
                Instant.now().plusMillis(refreshTokenExpirationMs)
        );
        refreshTokenRepository.save(refreshToken);

        log.info("Google OAuth2/OIDC login successful for user: {}", userPrincipal.getEmail());

        // Clear OAuth2 state cookie
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        clearAuthenticationAttributes(request);

        AuthResponse authResponse = new AuthResponse(
                accessToken,
                rawRefreshToken,
                new UserSummaryDto(user)
        );

        // Generate one-time short-lived code (60s TTL)
        String exchangeCode = exchangeService.createExchangeCode(authResponse);

        // Redirect with only the exchange code
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("code", exchangeCode)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
