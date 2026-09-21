package com.scms.model;

/**
 * User roles supported in SCMS.
 * - USER: Students/staff who file and track complaints.
 * - ADMIN: Campus administrators who manage and resolve complaints (cannot file complaints).
 */
public enum Role {
    USER("user"),
    ADMIN("admin");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromString(String text) {
        if (text == null) return USER;
        for (Role r : Role.values()) {
            if (r.value.equalsIgnoreCase(text) || r.name().equalsIgnoreCase(text)) {
                return r;
            }
        }
        return USER;
    }

    @Override
    public String toString() {
        return value;
    }
}
