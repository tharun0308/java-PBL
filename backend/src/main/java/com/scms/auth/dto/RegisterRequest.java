package com.scms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    private String userTitle = "Student";

    public RegisterRequest() {}

    public RegisterRequest(String email, String password, String fullName) {
        this(email, password, fullName, "Student");
    }

    public RegisterRequest(String email, String password, String fullName, String userTitle) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.userTitle = userTitle != null ? userTitle : "Student";
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUserTitle() {
        return userTitle != null ? userTitle : "Student";
    }

    public void setUserTitle(String userTitle) {
        this.userTitle = userTitle;
    }
}
