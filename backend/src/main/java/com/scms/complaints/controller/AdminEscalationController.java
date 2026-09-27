package com.scms.complaints.controller;

import com.scms.common.ApiResponse;
import com.scms.complaints.service.ComplaintService;
import com.scms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/escalation")
@Tag(name = "Admin Escalation", description = "Endpoints for manual and on-demand grievance escalation execution")
public class AdminEscalationController {

    private final ComplaintService complaintService;

    public AdminEscalationController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping("/run-now")
    @PreAuthorize("hasRole('MAIN_ADMIN')")
    @Operation(summary = "Run escalation evaluation immediately", description = "Triggers the automatic SLA escalation check on demand across all unresolved complaints. Main Admin only.")
    public ResponseEntity<ApiResponse<ComplaintService.EscalationRunResult>> runEscalationNow(
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintService.EscalationRunResult result = complaintService.runEscalationCheck();
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Escalation check completed: %d scanned, %d Level 1 escalated, %d Level 2 escalated",
                        result.getScannedCount(), result.getLevel1Count(), result.getLevel2Count()),
                result
        ));
    }
}
