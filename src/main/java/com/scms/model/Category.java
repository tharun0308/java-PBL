package com.scms.model;

/**
 * Campus facility complaint categories.
 */
public enum Category {
    ELECTRICAL("Electrical"),
    WATER_SUPPLY("Water Supply"),
    CLEANLINESS("Cleanliness"),
    INTERNET_IT("Internet/IT"),
    HOSTEL_MAINTENANCE("Hostel Maintenance"),
    LABORATORY_EQUIPMENT("Laboratory Equipment"),
    INFRASTRUCTURE("Infrastructure"),
    OTHER("Other");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Category fromString(String text) {
        if (text == null) return OTHER;
        for (Category c : Category.values()) {
            if (c.displayName.equalsIgnoreCase(text) || c.name().equalsIgnoreCase(text.replace('/', '_').replace(' ', '_'))) {
                return c;
            }
        }
        return OTHER;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
