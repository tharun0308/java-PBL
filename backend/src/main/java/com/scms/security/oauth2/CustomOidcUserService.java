package com.scms.security.oauth2;

import com.scms.security.UserPrincipal;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.Role;
import com.scms.users.entity.User;
import com.scms.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOidcUserService extends OidcUserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOidcUserService.class);

    private final UserRepository userRepository;

    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        Map<String, Object> attributes = oidcUser.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.getOrDefault("name", "Google User");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email attribute not provided by Google OIDC provider");
        }

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (name != null && !name.isBlank()) {
                user.setFullName(name);
                user = userRepository.save(user);
            }
            log.info("Existing user authenticated via Google OIDC: {}", email);
        } else {
            // New user registration via Google OIDC -> defaults to STUDENT_TEACHER
            user = new User(email, null, name, Role.STUDENT_TEACHER, AuthProvider.GOOGLE);
            user = userRepository.save(user);
            log.info("Registered new user via Google OIDC: {} with role: {}", email, user.getRole());
        }

        return UserPrincipal.create(user, attributes, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}
