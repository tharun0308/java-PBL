package com.scms.users.dto;

import jakarta.validation.constraints.NotNull;

public class UserStatusUpdateDto {

    @NotNull(message = "Active flag is required")
    private Boolean active;

    public UserStatusUpdateDto() {}

    public UserStatusUpdateDto(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
