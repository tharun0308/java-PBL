package com.scms.complaints.dto;

import com.scms.complaints.entity.ComplaintCategory;
import com.scms.complaints.entity.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateComplaintDto {

    @NotNull(message = "Category is required")
    private ComplaintCategory category;

    @Size(max = 100, message = "Custom category cannot exceed 100 characters")
    private String customCategory;

    private java.util.List<String> photoPaths;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;

    private ComplaintPriority priority = ComplaintPriority.MEDIUM;

    public CreateComplaintDto() {}

    public CreateComplaintDto(ComplaintCategory category, String location, String description, ComplaintPriority priority) {
        this.category = category;
        this.location = location;
        this.description = description;
        this.priority = priority != null ? priority : ComplaintPriority.MEDIUM;
    }

    public ComplaintCategory getCategory() {
        return category;
    }

    public void setCategory(ComplaintCategory category) {
        this.category = category;
    }

    public String getCustomCategory() {
        return customCategory;
    }

    public void setCustomCategory(String customCategory) {
        this.customCategory = customCategory;
    }

    public java.util.List<String> getPhotoPaths() {
        return photoPaths;
    }

    public void setPhotoPaths(java.util.List<String> photoPaths) {
        this.photoPaths = photoPaths;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintPriority getPriority() {
        return priority;
    }

    public void setPriority(ComplaintPriority priority) {
        this.priority = priority;
    }
}
