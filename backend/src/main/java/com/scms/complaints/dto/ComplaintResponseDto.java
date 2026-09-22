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
    private String location;
    private String description;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private UUID assignedToId;
    private String assignedToName;
    private String resolutionNote;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ComplaintHistoryDto> history = new ArrayList<>();

    public ComplaintResponseDto() {}

    public ComplaintResponseDto(Complaint complaint) {
        this.id = complaint.getId();
        this.complaintNumber = complaint.getComplaintNumber();
        if (complaint.getSubmittedBy() != null) {
            this.submittedById = complaint.getSubmittedBy().getId();
            this.submittedByName = complaint.getSubmittedBy().getFullName();
            this.submittedByEmail = complaint.getSubmittedBy().getEmail();
        }
        this.category = complaint.getCategory();
        this.location = complaint.getLocation();
        this.description = complaint.getDescription();
        this.priority = complaint.getPriority();
        this.status = complaint.getStatus();
        if (complaint.getAssignedTo() != null) {
            this.assignedToId = complaint.getAssignedTo().getId();
            this.assignedToName = complaint.getAssignedTo().getFullName();
        }
        this.resolutionNote = complaint.getResolutionNote();
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
}
