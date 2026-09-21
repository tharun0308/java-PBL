package com.scms.model;

/**
 * Complaint priority levels and associated SLA target turnaround times.
 */
public enum Priority {
    LOW("Low", 120),
    MEDIUM("Medium", 48),
    HIGH("High", 24);

    private final String displayName;
    private final int slaHours;

    Priority(String displayName, int slaHours) {
        this.displayName = displayName;
        this.slaHours = slaHours;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getSlaHours() {
        return slaHours;
    }

    public static Priority fromString(String text) {
        if (text == null) return MEDIUM;
        for (Priority p : Priority.values()) {
            if (p.displayName.equalsIgnoreCase(text) || p.name().equalsIgnoreCase(text)) {
                return p;
            }
        }
        return MEDIUM;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
