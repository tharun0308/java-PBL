package com.scms.users.entity;

public enum StaffAdminRole {
    PRINCIPAL(3, "Principal"),
    HOD(2, "Head of Department"),
    PROFESSOR(1, "Professor"),
    OTHER(0, "Other");

    private final int rank;
    private final String displayName;

    StaffAdminRole(int rank, String displayName) {
        this.rank = rank;
        this.displayName = displayName;
    }

    public int getRank() {
        return rank;
    }

    public String getDisplayName() {
        return displayName;
    }
}
