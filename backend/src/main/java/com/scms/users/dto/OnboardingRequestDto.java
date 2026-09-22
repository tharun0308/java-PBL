package com.scms.users.dto;

import jakarta.validation.constraints.NotBlank;

public class OnboardingRequestDto {

    @NotBlank(message = "userTitle is required ('Student' or 'Teacher')")
    private String userTitle;

    private Integer academicYear; // 1 to 4 for Student

    private String teacherIntent; // "REGULAR" or "MANAGER" for Teacher

    public OnboardingRequestDto() {}

    public OnboardingRequestDto(String userTitle, Integer academicYear, String teacherIntent) {
        this.userTitle = userTitle;
        this.academicYear = academicYear;
        this.teacherIntent = teacherIntent;
    }

    public String getUserTitle() {
        return userTitle;
    }

    public void setUserTitle(String userTitle) {
        this.userTitle = userTitle;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public String getTeacherIntent() {
        return teacherIntent;
    }

    public void setTeacherIntent(String teacherIntent) {
        this.teacherIntent = teacherIntent;
    }
}
