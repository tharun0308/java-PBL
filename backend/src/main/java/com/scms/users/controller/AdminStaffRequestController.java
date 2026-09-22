package com.scms.users.controller;

import com.scms.common.ApiResponse;
import com.scms.security.UserPrincipal;
import com.scms.users.dto.UserResponseDto;
import com.scms.users.dto.UserStatusUpdateDto;
import com.scms.users.entity.Role;
import com.scms.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('MAIN_ADMIN')")
@Tag(name = "Main Admin Operations", description = "Privileged endpoints for staff approval workflow and user account management")
public class AdminStaffRequestController {

    private final UserService userService;

    public AdminStaffRequestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/staff-requests")
    @Operation(summary = "List pending staff admin requests", description = "Retrieves all users currently awaiting staff admin approval")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getPendingStaffRequests() {
        List<UserResponseDto> requests = userService.getPendingStaffAdminRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/staff-requests/{id}/approve")
    @Operation(summary = "Approve staff admin request", description = "Promotes the user to STAFF_ADMIN with APPROVED status")
    public ResponseEntity<ApiResponse<UserResponseDto>> approveStaffRequest(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal actingAdmin) {
        UserResponseDto updated = userService.approveStaffAdminRequest(id, actingAdmin);
        return ResponseEntity.ok(ApiResponse.success("Staff Admin access approved successfully", updated));
    }

    @PostMapping("/staff-requests/{id}/reject")
    @Operation(summary = "Reject staff admin request", description = "Marks the request as REJECTED; user remains in their current role")
    public ResponseEntity<ApiResponse<UserResponseDto>> rejectStaffRequest(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal actingAdmin) {
        UserResponseDto updated = userService.rejectStaffAdminRequest(id, actingAdmin);
        return ResponseEntity.ok(ApiResponse.success("Staff Admin request rejected", updated));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users with pagination", description = "Paginated list of all system users with optional role filtering")
    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserResponseDto> users = userService.getAllUsers(role, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Update user active status", description = "Enables or disables a user account")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusUpdateDto updateDto,
            @AuthenticationPrincipal UserPrincipal actingAdmin) {
        UserResponseDto updated = userService.updateUserStatus(id, updateDto, actingAdmin);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }
}
