package com.scms.model;

/**
 * System notification entity for real-time in-app alerts.
 */
public class Notification {
    private String id;
    private String user_id; // UUID or "admin"
    private String title;
    private String message;
    private String link;
    private boolean read;
    private String created_at;

    public Notification() {}

    public Notification(String id, String user_id, String title, String message, String link, boolean read, String created_at) {
        this.id = id;
        this.user_id = user_id;
        this.title = title;
        this.message = message;
        this.link = link;
        this.read = read;
        this.created_at = created_at;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }
}
