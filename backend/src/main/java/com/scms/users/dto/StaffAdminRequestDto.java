package com.scms.users.dto;

public class StaffAdminRequestDto {

    private String documentPath;
    private String department;

    public StaffAdminRequestDto() {}

    public StaffAdminRequestDto(String documentPath, String department) {
        this.documentPath = documentPath;
        this.department = department;
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
}
