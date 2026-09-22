package com.scms.complaints.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AssignStaffDto {

    @NotNull(message = "Assigned user ID is required")
    private UUID assignedToUserId;

    public AssignStaffDto() {}

    public AssignStaffDto(UUID assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public UUID getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(UUID assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }
}
