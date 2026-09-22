package com.scms.security.oauth2;

import com.scms.security.UserPrincipal;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.Role;
import com.scms.users.entity.User;
import com.scms.users.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.getOrDefault("name", "Google User");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from Google OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update name or provider if needed
            user.setFullName(name);
            user = userRepository.save(user);
        } else {
            // New user registration via Google OAuth2 -> defaults to STUDENT_TEACHER
            user = new User(email, null, name, Role.STUDENT_TEACHER, AuthProvider.GOOGLE);
            user = userRepository.save(user);
        }

        return UserPrincipal.create(user, attributes);
    }
}
