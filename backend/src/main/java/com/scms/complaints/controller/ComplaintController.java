package com.scms.complaints.controller;

import com.scms.common.ApiResponse;
import com.scms.complaints.dto.*;
import com.scms.complaints.entity.ComplaintCategory;
import com.scms.complaints.entity.ComplaintPriority;
import com.scms.complaints.entity.ComplaintStatus;
import com.scms.complaints.service.ComplaintService;
import com.scms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
@Tag(name = "Complaints", description = "Endpoints for creating, querying, assigning, and triaging complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @Operation(summary = "Submit a new complaint", description = "Creates a complaint with an auto-generated sequential number (#SCMS-XXXX) and initial Pending status")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> createComplaint(
            @Valid @RequestBody CreateComplaintDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto response = complaintService.createComplaint(dto, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "List complaints", description = "Returns complaints. Students/Teachers see only their own; Staff Admins and Main Admins see all complaints across campus with multi-parameter filtering.")
    public ResponseEntity<ApiResponse<Page<ComplaintResponseDto>>> getComplaints(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) ComplaintPriority priority,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ComplaintResponseDto> complaints = complaintService.getComplaints(
                principal, status, category, priority, search, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint by ID", description = "Retrieves complete complaint details including the immutable timeline audit trail")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> getComplaintById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto complaint = complaintService.getComplaintById(id, principal);
        return ResponseEntity.ok(ApiResponse.success(complaint));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'MAIN_ADMIN')")
    @Operation(summary = "Update complaint status", description = "Transitions complaint status (Pending -> In Progress -> Resolved/Rejected) and appends an immutable history row")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto updated = complaintService.updateStatus(id, dto, principal);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated successfully", updated));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('STAFF_ADMIN', 'MAIN_ADMIN')")
    @Operation(summary = "Assign complaint to staff member", description = "Assigns complaint to a Staff Admin or Main Admin and transitions status to In Progress if Pending")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> assignStaff(
            @PathVariable UUID id,
            @Valid @RequestBody AssignStaffDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto updated = complaintService.assignStaff(id, dto, principal);
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    @Operation(summary = "Delete complaint", description = "Permanently deletes a complaint and all associated history. Main Admin only.")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        complaintService.deleteComplaint(id, principal);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully", null));
    }
}
