package com.scms.users.dto;

import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;

import java.time.Instant;
import java.util.UUID;

public class UserResponseDto {

    private UUID id;
    private String email;
    private String fullName;
    private Role role;
    private AuthProvider authProvider;
    private StaffAdminStatus staffAdminStatus;
    private String userTitle;
    private boolean onboardingCompleted;
    private Integer academicYear;
    private int staffAdminAppealCount;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public UserResponseDto() {}

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.authProvider = user.getAuthProvider();
        this.staffAdminStatus = user.getStaffAdminStatus();
        this.userTitle = user.getUserTitle();
        this.onboardingCompleted = user.isOnboardingCompleted();
        this.academicYear = user.getAcademicYear();
        this.staffAdminAppealCount = user.getStaffAdminAppealCount();
        this.active = user.isActive();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public AuthProvider getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }

    public StaffAdminStatus getStaffAdminStatus() {
        return staffAdminStatus;
    }

    public void setStaffAdminStatus(StaffAdminStatus staffAdminStatus) {
        this.staffAdminStatus = staffAdminStatus;
    }

    public String getUserTitle() {
        return userTitle;
    }

    public void setUserTitle(String userTitle) {
        this.userTitle = userTitle;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public int getStaffAdminAppealCount() {
        return staffAdminAppealCount;
    }

    public void setStaffAdminAppealCount(int staffAdminAppealCount) {
        this.staffAdminAppealCount = staffAdminAppealCount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
}
