package com.scms.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Summary analytics and performance metrics for admin reporting.
 */
public class ReportSummary {
    private int total;
    private int pending;
    private int inProgress;
    private int resolved;
    private int rejected;
    private int overdue;
    private Double averageRating;
    private int totalRatings;
    private List<CategoryMetric> byCategory = new ArrayList<>();
    private List<PriorityMetric> byPriority = new ArrayList<>();

    public static class CategoryMetric {
        private String category;
        private int count;

        public CategoryMetric() {}
        public CategoryMetric(String category, int count) {
            this.category = category;
            this.count = count;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public static class PriorityMetric {
        private String priority;
        private int count;

        public PriorityMetric() {}
        public PriorityMetric(String priority, int count) {
            this.priority = priority;
            this.count = count;
        }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public ReportSummary() {}

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getPending() { return pending; }
    public void setPending(int pending) { this.pending = pending; }

    public int getInProgress() { return inProgress; }
    public void setInProgress(int inProgress) { this.inProgress = inProgress; }

    public int getResolved() { return resolved; }
    public void setResolved(int resolved) { this.resolved = resolved; }

    public int getRejected() { return rejected; }
    public void setRejected(int rejected) { this.rejected = rejected; }

    public int getOverdue() { return overdue; }
    public void setOverdue(int overdue) { this.overdue = overdue; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public int getTotalRatings() { return totalRatings; }
    public void setTotalRatings(int totalRatings) { this.totalRatings = totalRatings; }

    public List<CategoryMetric> getByCategory() { return byCategory; }
    public void setByCategory(List<CategoryMetric> byCategory) { this.byCategory = byCategory; }

    public List<PriorityMetric> getByPriority() { return byPriority; }
    public void setByPriority(List<PriorityMetric> byPriority) { this.byPriority = byPriority; }
}
