package com.scms.model;

/**
 * User entity representing students, faculty, or campus administrators.
 */
public class User {
    private String id;
    private String email;
    private String password;
    private String full_name;
    private String role; // "user" or "admin"
    private String created_at;

    public User() {}

    public User(String id, String email, String password, String full_name, String role, String created_at) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.full_name = full_name;
        this.role = role;
        this.created_at = created_at;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getFull_name() {
        return full_name;
    }

    public void setFull_name(String full_name) {
        this.full_name = full_name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(this.role);
    }
}
