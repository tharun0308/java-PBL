package com.scms.reports.controller;

import com.scms.common.ApiResponse;
import com.scms.reports.dto.ReportSummaryDto;
import com.scms.reports.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'MAIN_ADMIN')")
@Tag(name = "Reports & Analytics", description = "Endpoints for aggregate counts, triage statistics, and dashboard summaries")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get complaint analytics summary", description = "Returns total complaints, status breakdown, category distribution, and resolution rate")
    public ResponseEntity<ApiResponse<ReportSummaryDto>> getSummaryReport() {
        ReportSummaryDto summary = reportService.getSummaryReport();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
