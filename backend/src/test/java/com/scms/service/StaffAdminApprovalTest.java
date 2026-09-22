package com.scms.service;

import com.scms.exception.BadRequestException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.security.UserPrincipal;
import com.scms.users.dto.UserResponseDto;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import com.scms.security.JwtTokenProvider;
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
class StaffAdminApprovalTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    private UserService userService;

    private User studentUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, refreshTokenRepository, tokenProvider);
        studentUser = new User("student@college.edu", "hash", "Student One", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        studentUser.setId(UUID.randomUUID());
        studentUser.setUserTitle("Teacher");
        studentUser.setStaffAdminStatus(StaffAdminStatus.NONE);

        adminUser = new User("admin@college.edu", "hash", "Main Admin", Role.MAIN_ADMIN, AuthProvider.LOCAL);
        adminUser.setId(UUID.randomUUID());
        adminUser.setStaffAdminStatus(StaffAdminStatus.APPROVED);
    }

    @Test
    @DisplayName("User should be able to request staff admin access, setting status to PENDING")
    void testRequestStaffAdminAccessSuccess() {
        UserPrincipal studentPrincipal = UserPrincipal.create(studentUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDto response = userService.requestStaffAdminAccess(studentPrincipal);

        assertNotNull(response);
        assertEquals(StaffAdminStatus.PENDING, response.getStaffAdminStatus());
        assertEquals(Role.STUDENT_TEACHER, response.getRole());
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("Should reject request if already PENDING")
    void testRequestStaffAdminAccessAlreadyPending() {
        studentUser.setStaffAdminStatus(StaffAdminStatus.PENDING);
        UserPrincipal studentPrincipal = UserPrincipal.create(studentUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));

        assertThrows(BadRequestException.class, () -> userService.requestStaffAdminAccess(studentPrincipal));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Main Admin should approve pending request -> role upgraded to STAFF_ADMIN and status APPROVED")
    void testApproveStaffAdminRequest() {
        studentUser.setStaffAdminStatus(StaffAdminStatus.PENDING);
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDto response = userService.approveStaffAdminRequest(studentUser.getId(), adminPrincipal);

        assertNotNull(response);
        assertEquals(Role.STAFF_ADMIN, response.getRole());
        assertEquals(StaffAdminStatus.APPROVED, response.getStaffAdminStatus());
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("Main Admin should reject pending request -> status set to REJECTED and role remains STUDENT_TEACHER")
    void testRejectStaffAdminRequest() {
        studentUser.setStaffAdminStatus(StaffAdminStatus.PENDING);
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDto response = userService.rejectStaffAdminRequest(studentUser.getId(), adminPrincipal);

        assertNotNull(response);
        assertEquals(Role.STUDENT_TEACHER, response.getRole());
        assertEquals(StaffAdminStatus.REJECTED, response.getStaffAdminStatus());
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("Approve non-pending request should throw BadRequestException")
    void testApproveNonPendingRequestThrowsException() {
        studentUser.setStaffAdminStatus(StaffAdminStatus.NONE);
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));

        assertThrows(BadRequestException.class, () -> userService.approveStaffAdminRequest(studentUser.getId(), adminPrincipal));
    }

    @Test
    @DisplayName("Reject non-pending request should throw BadRequestException")
    void testRejectNonPendingRequestThrowsException() {
        studentUser.setStaffAdminStatus(StaffAdminStatus.NONE);
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));

        assertThrows(BadRequestException.class, () -> userService.rejectStaffAdminRequest(studentUser.getId(), adminPrincipal));
    }

    @Test
    @DisplayName("List pending staff admin requests")
    void testGetPendingStaffAdminRequests() {
        studentUser.setStaffAdminStatus(StaffAdminStatus.PENDING);
        when(userRepository.findByStaffAdminStatus(StaffAdminStatus.PENDING)).thenReturn(java.util.List.of(studentUser));

        java.util.List<UserResponseDto> requests = userService.getPendingStaffAdminRequests();

        assertNotNull(requests);
        assertEquals(1, requests.size());
        assertEquals(studentUser.getEmail(), requests.get(0).getEmail());
        assertEquals(StaffAdminStatus.PENDING, requests.get(0).getStaffAdminStatus());
    }
}
