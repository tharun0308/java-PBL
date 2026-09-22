package com.scms.complaints.dto;

import com.scms.complaints.entity.ComplaintHistory;
import com.scms.complaints.entity.ComplaintStatus;

import java.time.Instant;
import java.util.UUID;

public class ComplaintHistoryDto {

    private UUID id;
    private ComplaintStatus oldStatus;
    private ComplaintStatus newStatus;
    private String note;
    private UUID updatedById;
    private String updatedByName;
    private Instant updatedAt;

    public ComplaintHistoryDto() {}

    public ComplaintHistoryDto(ComplaintHistory history) {
        this.id = history.getId();
        this.oldStatus = history.getOldStatus();
        this.newStatus = history.getNewStatus();
        this.note = history.getNote();
        if (history.getUpdatedBy() != null) {
            this.updatedById = history.getUpdatedBy().getId();
            this.updatedByName = history.getUpdatedBy().getFullName();
        }
        this.updatedAt = history.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ComplaintStatus getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(ComplaintStatus oldStatus) {
        this.oldStatus = oldStatus;
    }

    public ComplaintStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ComplaintStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public UUID getUpdatedById() {
        return updatedById;
    }

    public void setUpdatedById(UUID updatedById) {
        this.updatedById = updatedById;
    }

    public String getUpdatedByName() {
        return updatedByName;
    }

    public void setUpdatedByName(String updatedByName) {
        this.updatedByName = updatedByName;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
