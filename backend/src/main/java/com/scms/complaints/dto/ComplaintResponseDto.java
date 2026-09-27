package com.scms.complaints.dto;

import com.scms.complaints.entity.Complaint;
import com.scms.complaints.entity.ComplaintCategory;
import com.scms.complaints.entity.ComplaintPriority;
import com.scms.complaints.entity.ComplaintStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ComplaintResponseDto {

    private UUID id;
    private String complaintNumber;
    private UUID submittedById;
    private String submittedByName;
    private String submittedByEmail;
    private ComplaintCategory category;
    private String customCategory;
    private List<String> photoPaths = new ArrayList<>();
    private String location;
    private String description;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private UUID assignedToId;
    private String assignedToName;
    private String resolutionNote;
    private int escalationLevel;
    private Instant escalatedAt;
    private UUID escalatedToId;
    private String escalatedToName;
    private int upvoteCount;
    private boolean hasUpvoted;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ComplaintHistoryDto> history = new ArrayList<>();

    public ComplaintResponseDto() {}

    public ComplaintResponseDto(Complaint complaint) {
        this(complaint, false);
    }

    public ComplaintResponseDto(Complaint complaint, boolean hasUpvoted) {
        this.id = complaint.getId();
        this.complaintNumber = complaint.getComplaintNumber();
        if (complaint.getSubmittedBy() != null) {
            this.submittedById = complaint.getSubmittedBy().getId();
            this.submittedByName = complaint.getSubmittedBy().getFullName();
            this.submittedByEmail = complaint.getSubmittedBy().getEmail();
        }
        this.category = complaint.getCategory();
        this.customCategory = complaint.getCustomCategory();
        if (complaint.getPhotoPaths() != null && !complaint.getPhotoPaths().trim().isEmpty()) {
            this.photoPaths = java.util.Arrays.stream(complaint.getPhotoPaths().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        } else {
            this.photoPaths = new ArrayList<>();
        }
        this.location = complaint.getLocation();
        this.description = complaint.getDescription();
        this.priority = complaint.getPriority();
        this.status = complaint.getStatus();
        if (complaint.getAssignedTo() != null) {
            this.assignedToId = complaint.getAssignedTo().getId();
            this.assignedToName = complaint.getAssignedTo().getFullName();
        }
        this.resolutionNote = complaint.getResolutionNote();
        this.escalationLevel = complaint.getEscalationLevel();
        this.escalatedAt = complaint.getEscalatedAt();
        if (complaint.getEscalatedTo() != null) {
            this.escalatedToId = complaint.getEscalatedTo().getId();
            this.escalatedToName = complaint.getEscalatedTo().getFullName();
        }
        this.upvoteCount = complaint.getUpvoteCount();
        this.hasUpvoted = hasUpvoted;
        this.createdAt = complaint.getCreatedAt();
        this.updatedAt = complaint.getUpdatedAt();
        if (complaint.getHistory() != null) {
            this.history = complaint.getHistory().stream()
                    .map(ComplaintHistoryDto::new)
                    .collect(Collectors.toList());
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getComplaintNumber() {
        return complaintNumber;
    }

    public void setComplaintNumber(String complaintNumber) {
        this.complaintNumber = complaintNumber;
    }

    public UUID getSubmittedById() {
        return submittedById;
    }

    public void setSubmittedById(UUID submittedById) {
        this.submittedById = submittedById;
    }

    public String getSubmittedByName() {
        return submittedByName;
    }

    public void setSubmittedByName(String submittedByName) {
        this.submittedByName = submittedByName;
    }

    public String getSubmittedByEmail() {
        return submittedByEmail;
    }

    public void setSubmittedByEmail(String submittedByEmail) {
        this.submittedByEmail = submittedByEmail;
    }

    public ComplaintCategory getCategory() {
        return category;
    }

    public void setCategory(ComplaintCategory category) {
        this.category = category;
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

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public UUID getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(UUID assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ComplaintHistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<ComplaintHistoryDto> history) {
        this.history = history;
    }

    public String getCustomCategory() {
        return customCategory;
    }

    public void setCustomCategory(String customCategory) {
        this.customCategory = customCategory;
    }

    public List<String> getPhotoPaths() {
        return photoPaths;
    }

    public void setPhotoPaths(List<String> photoPaths) {
        this.photoPaths = photoPaths;
    }

    public int getEscalationLevel() {
        return escalationLevel;
    }

    public void setEscalationLevel(int escalationLevel) {
        this.escalationLevel = escalationLevel;
    }

    public Instant getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(Instant escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public UUID getEscalatedToId() {
        return escalatedToId;
    }

    public void setEscalatedToId(UUID escalatedToId) {
        this.escalatedToId = escalatedToId;
    }

    public String getEscalatedToName() {
        return escalatedToName;
    }

    public void setEscalatedToName(String escalatedToName) {
        this.escalatedToName = escalatedToName;
    }

    public int getUpvoteCount() {
        return upvoteCount;
    }

    public void setUpvoteCount(int upvoteCount) {
        this.upvoteCount = upvoteCount;
    }

    public boolean isHasUpvoted() {
        return hasUpvoted;
    }

    public void setHasUpvoted(boolean hasUpvoted) {
        this.hasUpvoted = hasUpvoted;
    }
}
