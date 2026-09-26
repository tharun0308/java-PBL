package com.scms.users.controller;

import com.scms.auth.dto.AuthResponse;
import com.scms.common.ApiResponse;
import com.scms.security.UserPrincipal;
import com.scms.users.dto.OnboardingRequestDto;
import com.scms.users.dto.StaffAdminRequestDto;
import com.scms.users.dto.UserResponseDto;
import com.scms.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile actions, onboarding, and staff listings")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/staff-admin-request/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload Employee ID proof document", description = "Uploads a scan or photo of the faculty member's Employee ID card (JPG, PNG, PDF up to 5MB)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadStaffIdDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String documentPath = userService.storeStaffIdDocument(currentUser, file);
        return ResponseEntity.ok(ApiResponse.success("Employee ID proof uploaded successfully.", Map.of("documentPath", documentPath)));
    }

    @PatchMapping("/onboarding")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Complete user onboarding", description = "Sets userTitle, academicYear (for students), or triggers staff admin request with appeal count and document (for teachers)")
    public ResponseEntity<ApiResponse<AuthResponse>> completeOnboarding(
            @Valid @RequestBody OnboardingRequestDto request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AuthResponse authResponse = userService.completeOnboarding(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Onboarding completed successfully.", authResponse));
    }

    @PostMapping("/request-staff-admin")
    @PreAuthorize("hasRole('STUDENT_TEACHER')")
    @Operation(summary = "Request Staff Admin access", description = "Sets user's staff_admin_status to PENDING for Main Admin review (Teachers only, max 3 attempts)")
    public ResponseEntity<ApiResponse<AuthResponse>> requestStaffAdminAccess(
            @RequestBody(required = false) StaffAdminRequestDto request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AuthResponse authResponse = userService.requestStaffAdminAccess(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Staff Admin access requested successfully. Awaiting administrator approval.", authResponse));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'MAIN_ADMIN')")
    @Operation(summary = "List assignable staff members", description = "Returns active Staff Admins and Main Admins available for complaint assignments")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAssignableStaff() {
        List<UserResponseDto> staff = userService.getAssignableStaff();
        return ResponseEntity.ok(ApiResponse.success(staff));
    }
}
