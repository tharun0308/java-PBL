package com.scms.model;

/**
 * Lifecycle status of a complaint in SCMS.
 */
public enum Status {
    PENDING("Pending"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    REJECTED("Rejected");

    private final String displayName;

    Status(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Status fromString(String text) {
        if (text == null) return PENDING;
        for (Status s : Status.values()) {
            if (s.displayName.equalsIgnoreCase(text) || s.name().equalsIgnoreCase(text.replace(' ', '_'))) {
                return s;
            }
        }
        return PENDING;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
