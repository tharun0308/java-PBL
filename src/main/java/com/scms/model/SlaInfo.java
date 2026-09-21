package com.scms.model;

/**
 * Encapsulates SLA timer metrics, deadlines, remaining hours, and status badges.
 */
public class SlaInfo {
    private int targetHours;
    private String deadline;
    private long hoursRemaining;
    private boolean isOverdue;
    private boolean isCompleted;
    private String badgeText;
    private String badgeColor;

    public SlaInfo() {}

    public SlaInfo(int targetHours, String deadline, long hoursRemaining, boolean isOverdue, boolean isCompleted, String badgeText, String badgeColor) {
        this.targetHours = targetHours;
        this.deadline = deadline;
        this.hoursRemaining = hoursRemaining;
        this.isOverdue = isOverdue;
        this.isCompleted = isCompleted;
        this.badgeText = badgeText;
        this.badgeColor = badgeColor;
    }

    public int getTargetHours() {
        return targetHours;
    }

    public void setTargetHours(int targetHours) {
        this.targetHours = targetHours;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public long getHoursRemaining() {
        return hoursRemaining;
    }

    public void setHoursRemaining(long hoursRemaining) {
        this.hoursRemaining = hoursRemaining;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public String getBadgeText() {
        return badgeText;
    }

    public void setBadgeText(String badgeText) {
        this.badgeText = badgeText;
    }

    public String getBadgeColor() {
        return badgeColor;
    }

    public void setBadgeColor(String badgeColor) {
        this.badgeColor = badgeColor;
    }
}
