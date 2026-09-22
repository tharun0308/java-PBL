package com.scms.service;

import com.scms.auth.dto.AuthResponse;
import com.scms.exception.BadRequestException;
import com.scms.exception.ForbiddenException;
import com.scms.security.JwtTokenProvider;
import com.scms.security.UserPrincipal;
import com.scms.users.dto.OnboardingRequestDto;
import com.scms.users.dto.UserResponseDto;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.RefreshToken;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import com.scms.users.repository.RefreshTokenRepository;
import com.scms.users.repository.UserRepository;
import com.scms.users.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OnboardingAndAppealsTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    private UserService userService;

    private User newUser;
    private User teacherUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, refreshTokenRepository, tokenProvider);
        newUser = new User("newuser@college.edu", "hash", "New Member", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        newUser.setId(UUID.randomUUID());
        newUser.setOnboardingCompleted(false);

        teacherUser = new User("prof@college.edu", "hash", "Prof Smith", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setUserTitle("Teacher");
        teacherUser.setOnboardingCompleted(true);
        teacherUser.setStaffAdminStatus(StaffAdminStatus.NONE);
        teacherUser.setStaffAdminAppealCount(0);

        studentUser = new User("student@college.edu", "hash", "Alex Student", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        studentUser.setId(UUID.randomUUID());
        studentUser.setUserTitle("Student");
        studentUser.setAcademicYear(2);
        studentUser.setOnboardingCompleted(true);
        studentUser.setStaffAdminStatus(StaffAdminStatus.NONE);
    }

    @Test
    @DisplayName("Student onboarding success: sets academicYear and completes onboarding")
    void testStudentOnboardingSuccess() {
        UserPrincipal principal = UserPrincipal.create(newUser);
        OnboardingRequestDto request = new OnboardingRequestDto("Student", 3, null);

        when(userRepository.findById(newUser.getId())).thenReturn(Optional.of(newUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.completeOnboarding(principal, request);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertNotNull(response.getUser());
        assertTrue(response.getUser().isOnboardingCompleted());
        assertEquals("Student", response.getUser().getUserTitle());
        assertEquals(3, response.getUser().getAcademicYear());
        assertEquals(StaffAdminStatus.NONE, response.getUser().getStaffAdminStatus());
        assertEquals(0, response.getUser().getStaffAdminAppealCount());
        verify(userRepository, times(1)).save(newUser);
    }

    @Test
    @DisplayName("Student onboarding fails if academicYear is missing or invalid")
    void testStudentOnboardingInvalidYear() {
        UserPrincipal principal = UserPrincipal.create(newUser);
        when(userRepository.findById(newUser.getId())).thenReturn(Optional.of(newUser));

        // Missing year
        OnboardingRequestDto reqMissing = new OnboardingRequestDto("Student", null, null);
        assertThrows(BadRequestException.class, () -> userService.completeOnboarding(principal, reqMissing));

        // Invalid year (5)
        OnboardingRequestDto reqInvalid = new OnboardingRequestDto("Student", 5, null);
        assertThrows(BadRequestException.class, () -> userService.completeOnboarding(principal, reqInvalid));
    }

    @Test
    @DisplayName("Teacher regular onboarding success: completes onboarding without staff admin request")
    void testTeacherRegularOnboardingSuccess() {
        UserPrincipal principal = UserPrincipal.create(newUser);
        OnboardingRequestDto request = new OnboardingRequestDto("Teacher", null, "REGULAR");

        when(userRepository.findById(newUser.getId())).thenReturn(Optional.of(newUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.completeOnboarding(principal, request);

        assertNotNull(response);
        assertTrue(response.getUser().isOnboardingCompleted());
        assertEquals("Teacher", response.getUser().getUserTitle());
        assertNull(response.getUser().getAcademicYear());
        assertEquals(StaffAdminStatus.NONE, response.getUser().getStaffAdminStatus());
        assertEquals(0, response.getUser().getStaffAdminAppealCount());
        verify(userRepository, times(1)).save(newUser);
    }

    @Test
    @DisplayName("Teacher manager onboarding success: completes onboarding, sets status PENDING and appealCount=1")
    void testTeacherManagerOnboardingSuccess() {
        UserPrincipal principal = UserPrincipal.create(newUser);
        OnboardingRequestDto request = new OnboardingRequestDto("Teacher", null, "MANAGER");

        when(userRepository.findById(newUser.getId())).thenReturn(Optional.of(newUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.completeOnboarding(principal, request);

        assertNotNull(response);
        assertTrue(response.getUser().isOnboardingCompleted());
        assertEquals("Teacher", response.getUser().getUserTitle());
        assertNull(response.getUser().getAcademicYear());
        assertEquals(StaffAdminStatus.PENDING, response.getUser().getStaffAdminStatus());
        assertEquals(1, response.getUser().getStaffAdminAppealCount()); // First attempt counted at onboarding
        verify(userRepository, times(1)).save(newUser);
    }

    @Test
    @DisplayName("Re-completing onboarding when already completed throws BadRequestException")
    void testOnboardingAlreadyCompleted() {
        newUser.setOnboardingCompleted(true);
        UserPrincipal principal = UserPrincipal.create(newUser);
        OnboardingRequestDto request = new OnboardingRequestDto("Student", 2, null);

        when(userRepository.findById(newUser.getId())).thenReturn(Optional.of(newUser));

        assertThrows(BadRequestException.class, () -> userService.completeOnboarding(principal, request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Student calling requestStaffAdminAccess is blocked with 403 Forbidden")
    void testStudentCannotRequestStaffAdmin() {
        UserPrincipal studentPrincipal = UserPrincipal.create(studentUser);
        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));

        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> userService.requestStaffAdminAccess(studentPrincipal));
        assertEquals("Only teachers and faculty members can request or appeal for Staff Admin privileges.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Teacher regular appealing later: increments appealCount from 0 to 1 and sets status PENDING")
    void testTeacherAppealFirstAttempt() {
        teacherUser.setStaffAdminAppealCount(0);
        teacherUser.setStaffAdminStatus(StaffAdminStatus.NONE);
        UserPrincipal teacherPrincipal = UserPrincipal.create(teacherUser);

        when(userRepository.findById(teacherUser.getId())).thenReturn(Optional.of(teacherUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDto response = userService.requestStaffAdminAccess(teacherPrincipal);

        assertNotNull(response);
        assertEquals(StaffAdminStatus.PENDING, response.getStaffAdminStatus());
        assertEquals(1, response.getStaffAdminAppealCount());
        verify(userRepository, times(1)).save(teacherUser);
    }

    @Test
    @DisplayName("Teacher after rejection appealing for second and third time increments count up to 3")
    void testTeacherAppealSubsequentAttempts() {
        // Attempt 2 after rejection
        teacherUser.setStaffAdminAppealCount(1);
        teacherUser.setStaffAdminStatus(StaffAdminStatus.REJECTED);
        UserPrincipal teacherPrincipal = UserPrincipal.create(teacherUser);

        when(userRepository.findById(teacherUser.getId())).thenReturn(Optional.of(teacherUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDto response2 = userService.requestStaffAdminAccess(teacherPrincipal);
        assertEquals(2, response2.getStaffAdminAppealCount());
        assertEquals(StaffAdminStatus.PENDING, response2.getStaffAdminStatus());

        // Attempt 3 after another rejection
        teacherUser.setStaffAdminStatus(StaffAdminStatus.REJECTED);
        UserResponseDto response3 = userService.requestStaffAdminAccess(teacherPrincipal);
        assertEquals(3, response3.getStaffAdminAppealCount());
        assertEquals(StaffAdminStatus.PENDING, response3.getStaffAdminStatus());
    }

    @Test
    @DisplayName("Teacher on 4th appeal attempt (appealCount >= 3) is rejected with BadRequestException")
    void testTeacherFourthAppealRejected() {
        teacherUser.setStaffAdminAppealCount(3);
        teacherUser.setStaffAdminStatus(StaffAdminStatus.REJECTED);
        UserPrincipal teacherPrincipal = UserPrincipal.create(teacherUser);

        when(userRepository.findById(teacherUser.getId())).thenReturn(Optional.of(teacherUser));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> userService.requestStaffAdminAccess(teacherPrincipal));
        assertEquals("Maximum appeal attempts (3) reached. Further requests cannot be submitted.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
