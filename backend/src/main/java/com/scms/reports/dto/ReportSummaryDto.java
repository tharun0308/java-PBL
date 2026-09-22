package com.scms.reports.dto;

import com.scms.complaints.entity.ComplaintCategory;
import com.scms.complaints.entity.ComplaintPriority;
import com.scms.complaints.entity.ComplaintStatus;

import java.util.Map;

public class ReportSummaryDto {

    private long totalComplaints;
    private long pendingComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long rejectedComplaints;
    private double resolutionRatePercentage;
    private Map<ComplaintCategory, Long> categoryBreakdown;
    private Map<ComplaintStatus, Long> statusBreakdown;
    private Map<ComplaintPriority, Long> priorityBreakdown;

    public ReportSummaryDto() {}

    public ReportSummaryDto(long totalComplaints, long pendingComplaints, long inProgressComplaints,
                            long resolvedComplaints, long rejectedComplaints, double resolutionRatePercentage,
                            Map<ComplaintCategory, Long> categoryBreakdown, Map<ComplaintStatus, Long> statusBreakdown,
                            Map<ComplaintPriority, Long> priorityBreakdown) {
        this.totalComplaints = totalComplaints;
        this.pendingComplaints = pendingComplaints;
        this.inProgressComplaints = inProgressComplaints;
        this.resolvedComplaints = resolvedComplaints;
        this.rejectedComplaints = rejectedComplaints;
        this.resolutionRatePercentage = resolutionRatePercentage;
        this.categoryBreakdown = categoryBreakdown;
        this.statusBreakdown = statusBreakdown;
        this.priorityBreakdown = priorityBreakdown;
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public long getPendingComplaints() {
        return pendingComplaints;
    }

    public void setPendingComplaints(long pendingComplaints) {
        this.pendingComplaints = pendingComplaints;
    }

    public long getInProgressComplaints() {
        return inProgressComplaints;
    }

    public void setInProgressComplaints(long inProgressComplaints) {
        this.inProgressComplaints = inProgressComplaints;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public long getRejectedComplaints() {
        return rejectedComplaints;
    }

    public void setRejectedComplaints(long rejectedComplaints) {
        this.rejectedComplaints = rejectedComplaints;
    }

    public double getResolutionRatePercentage() {
        return resolutionRatePercentage;
    }

    public void setResolutionRatePercentage(double resolutionRatePercentage) {
        this.resolutionRatePercentage = resolutionRatePercentage;
    }

    public Map<ComplaintCategory, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<ComplaintCategory, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<ComplaintStatus, Long> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(Map<ComplaintStatus, Long> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }

    public Map<ComplaintPriority, Long> getPriorityBreakdown() {
        return priorityBreakdown;
    }

    public void setPriorityBreakdown(Map<ComplaintPriority, Long> priorityBreakdown) {
        this.priorityBreakdown = priorityBreakdown;
    }
}
