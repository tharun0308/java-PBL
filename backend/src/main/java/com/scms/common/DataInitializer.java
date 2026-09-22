package com.scms.common;

import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import com.scms.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.security.oauth2.client.registration.ClientRegistrationRepository clientRegistrationRepository;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, org.springframework.security.oauth2.client.registration.ClientRegistrationRepository clientRegistrationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Override
    public void run(String... args) {
        org.springframework.security.oauth2.client.registration.ClientRegistration googleReg = clientRegistrationRepository.findByRegistrationId("google");
        if (googleReg != null) {
            log.info("RESOLVED_OAUTH_CLIENT_ID: [{}]", googleReg.getClientId());
        }
        seedMainAdmin();
    }

    private void seedMainAdmin() {
        String adminEmail = "admin@gmail.com";
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setFullName("Campus Main Administrator");
            admin.setPasswordHash(passwordEncoder.encode("Aswinabi1*"));
            admin.setRole(Role.MAIN_ADMIN);
            admin.setAuthProvider(AuthProvider.LOCAL);
            admin.setStaffAdminStatus(StaffAdminStatus.APPROVED);
            admin.setOnboardingCompleted(true);
            admin.setActive(true);

            userRepository.save(admin);
            log.info("Initialized default Main Admin account: {}", adminEmail);
        } else {
            userRepository.findByEmailIgnoreCase(adminEmail).ifPresent(admin -> {
                if (!admin.isOnboardingCompleted() || admin.getStaffAdminStatus() != StaffAdminStatus.APPROVED) {
                    admin.setOnboardingCompleted(true);
                    admin.setStaffAdminStatus(StaffAdminStatus.APPROVED);
                    userRepository.save(admin);
                    log.info("Updated Main Admin onboarding status: {}", adminEmail);
                }
            });
            log.debug("Main Admin account already exists: {}", adminEmail);
        }
    }
}
