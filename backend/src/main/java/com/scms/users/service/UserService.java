package com.scms.users.service;

import com.scms.auth.dto.AuthResponse;
import com.scms.auth.dto.UserSummaryDto;
import com.scms.exception.BadRequestException;
import com.scms.exception.ForbiddenException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.security.JwtTokenProvider;
import com.scms.security.UserPrincipal;
import com.scms.users.dto.OnboardingRequestDto;
import com.scms.users.dto.UserResponseDto;
import com.scms.users.dto.UserStatusUpdateDto;
import com.scms.users.entity.RefreshToken;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import com.scms.users.repository.RefreshTokenRepository;
import com.scms.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final long refreshTokenExpirationMs;

    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider tokenProvider) {
        this(userRepository, refreshTokenRepository, tokenProvider, 604800000L);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public UserService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider tokenProvider,
            @Value("${app.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenProvider = tokenProvider;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    @Transactional
    public AuthResponse completeOnboarding(UserPrincipal currentUser, OnboardingRequestDto request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isOnboardingCompleted()) {
            throw new BadRequestException("Onboarding has already been completed for this account.");
        }

        String userTitle = request.getUserTitle() != null ? request.getUserTitle().trim() : "";

        if ("Student".equalsIgnoreCase(userTitle)) {
            if (request.getAcademicYear() == null || request.getAcademicYear() < 1 || request.getAcademicYear() > 4) {
                throw new BadRequestException("Academic year is required for students and must be between 1 and 4.");
            }
            user.setUserTitle("Student");
            user.setAcademicYear(request.getAcademicYear());
            user.setOnboardingCompleted(true);
            log.info("Student {} ({}) completed onboarding for year {}", user.getFullName(), user.getEmail(), user.getAcademicYear());
        } else if ("Teacher".equalsIgnoreCase(userTitle)) {
            String intent = request.getTeacherIntent() != null ? request.getTeacherIntent().trim().toUpperCase() : "";
            if (!"REGULAR".equals(intent) && !"MANAGER".equals(intent)) {
                throw new BadRequestException("Teacher intent must be either 'REGULAR' or 'MANAGER'.");
            }
            user.setUserTitle("Teacher");
            user.setAcademicYear(null);
            user.setOnboardingCompleted(true);

            if ("MANAGER".equals(intent)) {
                if (user.getRole() != Role.MAIN_ADMIN && user.getRole() != Role.STAFF_ADMIN) {
                    user.setStaffAdminStatus(StaffAdminStatus.PENDING);
                    user.setStaffAdminAppealCount(1);
                    log.info("Teacher {} ({}) completed onboarding with MANAGER intent (appeal attempt 1/3)",
                            user.getFullName(), user.getEmail());
                }
            } else {
                log.info("Teacher {} ({}) completed onboarding with REGULAR intent", user.getFullName(), user.getEmail());
            }
        } else {
            throw new BadRequestException("Invalid userTitle. Must be 'Student' or 'Teacher'.");
        }

        user = userRepository.save(user);

        // Generate fresh JWT tokens with updated claims
        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(principal);

        String tokenStr = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken(
                user,
                tokenStr,
                Instant.now().plusMillis(refreshTokenExpirationMs)
        );
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(newAccessToken, refreshToken.getToken(), new UserSummaryDto(user));
    }

    @Transactional
    public UserResponseDto requestStaffAdminAccess(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.MAIN_ADMIN || user.getRole() == Role.STAFF_ADMIN) {
            throw new BadRequestException("You already have administrative privileges.");
        }

        // Only teachers can request/appeal for staff admin privileges (Students get 403 Forbidden)
        if (!"Teacher".equalsIgnoreCase(user.getUserTitle())) {
            throw new ForbiddenException("Only teachers and faculty members can request or appeal for Staff Admin privileges.");
        }

        if (user.getStaffAdminStatus() == StaffAdminStatus.PENDING) {
            throw new BadRequestException("Your request for Staff Admin access is already pending review.");
        }

        if (user.getStaffAdminAppealCount() >= 3) {
            throw new BadRequestException("Maximum appeal attempts (3) reached. Further requests cannot be submitted.");
        }

        user.setStaffAdminAppealCount(user.getStaffAdminAppealCount() + 1);
        user.setStaffAdminStatus(StaffAdminStatus.PENDING);
        user = userRepository.save(user);

        log.info("Teacher {} ({}) requested Staff Admin access (appeal attempt {}/3)",
                user.getFullName(), user.getEmail(), user.getStaffAdminAppealCount());
        return new UserResponseDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getPendingStaffAdminRequests() {
        return userRepository.findByStaffAdminStatus(StaffAdminStatus.PENDING).stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDto approveStaffAdminRequest(UUID targetUserId, UserPrincipal actingAdmin) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + targetUserId));

        if (user.getStaffAdminStatus() != StaffAdminStatus.PENDING) {
            throw new BadRequestException("User does not have a pending Staff Admin request.");
        }

        user.setRole(Role.STAFF_ADMIN);
        user.setStaffAdminStatus(StaffAdminStatus.APPROVED);
        user = userRepository.save(user);

        log.info("Main Admin {} approved Staff Admin request for user {} ({})",
                actingAdmin.getEmail(), user.getFullName(), user.getEmail());
        return new UserResponseDto(user);
    }

    @Transactional
    public UserResponseDto rejectStaffAdminRequest(UUID targetUserId, UserPrincipal actingAdmin) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + targetUserId));

        if (user.getStaffAdminStatus() != StaffAdminStatus.PENDING) {
            throw new BadRequestException("User does not have a pending Staff Admin request.");
        }

        user.setStaffAdminStatus(StaffAdminStatus.REJECTED);
        user = userRepository.save(user);

        log.info("Main Admin {} rejected Staff Admin request for user {} ({})",
                actingAdmin.getEmail(), user.getFullName(), user.getEmail());
        return new UserResponseDto(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDto> getAllUsers(Role roleFilter, Pageable pageable) {
        if (roleFilter != null) {
            return userRepository.findByRole(roleFilter, pageable).map(UserResponseDto::new);
        }
        return userRepository.findAll(pageable).map(UserResponseDto::new);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAssignableStaff() {
        return userRepository.findByRoleIn(List.of(Role.STAFF_ADMIN, Role.MAIN_ADMIN)).stream()
                .filter(User::isActive)
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDto updateUserStatus(UUID targetUserId, UserStatusUpdateDto updateDto, UserPrincipal actingAdmin) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + targetUserId));

        if (user.getRole() == Role.MAIN_ADMIN) {
            throw new BadRequestException("Cannot deactivate a Main Administrator.");
        }

        user.setActive(updateDto.getActive());
        user = userRepository.save(user);

        log.info("Main Admin {} changed active status of user {} to {}",
                actingAdmin.getEmail(), user.getEmail(), updateDto.getActive());
        return new UserResponseDto(user);
    }
}
