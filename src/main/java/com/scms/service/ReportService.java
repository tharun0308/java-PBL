package com.scms.service;

import com.scms.model.Category;
import com.scms.model.Complaint;
import com.scms.model.Priority;
import com.scms.model.ReportSummary;
import com.scms.model.SlaInfo;
import com.scms.repository.ComplaintRepository;

import java.util.List;

/**
 * Service aggregating complaint statistics, SLA compliance ratios, and satisfaction scores.
 */
public class ReportService {
    private final ComplaintRepository complaintRepository;

    public ReportService() {
        this.complaintRepository = new ComplaintRepository();
    }

    public ReportService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public ReportSummary getSummary() {
        List<Complaint> complaints = complaintRepository.findAll();

        int total = complaints.size();
        int pending = 0;
        int inProgress = 0;
        int resolved = 0;
        int rejected = 0;
        int overdue = 0;

        int totalRatings = 0;
        int ratingSum = 0;

        for (Complaint c : complaints) {
            String status = c.getStatus() != null ? c.getStatus() : "";
            if ("Pending".equalsIgnoreCase(status)) pending++;
            else if ("In Progress".equalsIgnoreCase(status)) inProgress++;
            else if ("Resolved".equalsIgnoreCase(status)) resolved++;
            else if ("Rejected".equalsIgnoreCase(status)) rejected++;

            SlaInfo sla = SlaService.calculateSla(c);
            if (sla.isOverdue() && !sla.isCompleted()) {
                overdue++;
            }

            if (c.getRating() != null && c.getRating() > 0) {
                totalRatings++;
                ratingSum += c.getRating();
            }
        }

        Double avgRating = totalRatings > 0
                ? Math.round(((double) ratingSum / totalRatings) * 10.0) / 10.0
                : null;

        ReportSummary summary = new ReportSummary();
        summary.setTotal(total);
        summary.setPending(pending);
        summary.setInProgress(inProgress);
        summary.setResolved(resolved);
        summary.setRejected(rejected);
        summary.setOverdue(overdue);
        summary.setTotalRatings(totalRatings);
        summary.setAverageRating(avgRating);

        for (Category cat : Category.values()) {
            int count = (int) complaints.stream().filter(c -> cat.getDisplayName().equalsIgnoreCase(c.getCategory())).count();
            summary.getByCategory().add(new ReportSummary.CategoryMetric(cat.getDisplayName(), count));
        }

        for (Priority p : Priority.values()) {
            int count = (int) complaints.stream().filter(c -> p.getDisplayName().equalsIgnoreCase(c.getPriority())).count();
            summary.getByPriority().add(new ReportSummary.PriorityMetric(p.getDisplayName(), count));
        }

        return summary;
    }
}
