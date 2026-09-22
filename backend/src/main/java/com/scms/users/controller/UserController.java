package com.scms.users.controller;

import com.scms.auth.dto.AuthResponse;
import com.scms.common.ApiResponse;
import com.scms.security.UserPrincipal;
import com.scms.users.dto.OnboardingRequestDto;
import com.scms.users.dto.UserResponseDto;
import com.scms.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile actions, onboarding, and staff listings")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PatchMapping("/onboarding")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Complete user onboarding", description = "Sets userTitle, academicYear (for students), or triggers staff admin request with appeal count (for teachers)")
    public ResponseEntity<ApiResponse<AuthResponse>> completeOnboarding(
            @Valid @RequestBody OnboardingRequestDto request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AuthResponse authResponse = userService.completeOnboarding(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Onboarding completed successfully.", authResponse));
    }

    @PostMapping("/request-staff-admin")
    @PreAuthorize("hasRole('STUDENT_TEACHER')")
    @Operation(summary = "Request Staff Admin access", description = "Sets user's staff_admin_status to PENDING for Main Admin review (Teachers only, max 3 attempts)")
    public ResponseEntity<ApiResponse<UserResponseDto>> requestStaffAdminAccess(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponseDto updated = userService.requestStaffAdminAccess(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Staff Admin access requested successfully. Awaiting administrator approval.", updated));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'MAIN_ADMIN')")
    @Operation(summary = "List assignable staff members", description = "Returns active Staff Admins and Main Admins available for complaint assignments")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAssignableStaff() {
        List<UserResponseDto> staff = userService.getAssignableStaff();
        return ResponseEntity.ok(ApiResponse.success(staff));
    }
}
