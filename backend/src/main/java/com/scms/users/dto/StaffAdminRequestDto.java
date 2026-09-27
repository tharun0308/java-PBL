package com.scms.users.dto;

public class StaffAdminRequestDto {

    private String documentPath;
    private String department;
    private String role; // "PRINCIPAL", "HOD", "PROFESSOR", "OTHER"
    private String roleOther;

    public StaffAdminRequestDto() {}

    public StaffAdminRequestDto(String documentPath, String department, String role, String roleOther) {
        this.documentPath = documentPath;
        this.department = department;
        this.role = role;
        this.roleOther = roleOther;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getRoleOther() {
        return roleOther;
    }

    public void setRoleOther(String roleOther) {
        this.roleOther = roleOther;
    }
}
