package com.scms.complaints.dto;

import com.scms.complaints.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateStatusDto {

    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    @Size(max = 2000, message = "Note cannot exceed 2000 characters")
    private String note;

    public UpdateStatusDto() {}

    public UpdateStatusDto(ComplaintStatus status, String note) {
        this.status = status;
        this.note = note;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
