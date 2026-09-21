package com.scms.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Core Complaint entity representing an issue submitted by a campus user.
 */
public class Complaint {
    private String id;
    private int complaint_number;
    private String user_id;
    private String category;
    private String location;
    private String description;
    private String priority;
    private String status;
    private String assigned_to;
    private String resolution_note;
    private String image_url;
    private String resolution_image_url;
    private Integer rating;
    private String feedback_note;
    private String rated_at;
    private String created_at;
    private String updated_at;

    // Enriched relations (included in detail/query views)
    private User user;
    private List<ComplaintHistory> history = new ArrayList<>();
    private SlaInfo sla;

    public Complaint() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getComplaint_number() { return complaint_number; }
    public void setComplaint_number(int complaint_number) { this.complaint_number = complaint_number; }

    public String getUser_id() { return user_id; }
    public void setUser_id(String user_id) { this.user_id = user_id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssigned_to() { return assigned_to; }
    public void setAssigned_to(String assigned_to) { this.assigned_to = assigned_to; }

    public String getResolution_note() { return resolution_note; }
    public void setResolution_note(String resolution_note) { this.resolution_note = resolution_note; }

    public String getImage_url() { return image_url; }
    public void setImage_url(String image_url) { this.image_url = image_url; }

    public String getResolution_image_url() { return resolution_image_url; }
    public void setResolution_image_url(String resolution_image_url) { this.resolution_image_url = resolution_image_url; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback_note() { return feedback_note; }
    public void setFeedback_note(String feedback_note) { this.feedback_note = feedback_note; }

    public String getRated_at() { return rated_at; }
    public void setRated_at(String rated_at) { this.rated_at = rated_at; }

    public String getCreated_at() { return created_at; }
    public void setCreated_at(String created_at) { this.created_at = created_at; }

    public String getUpdated_at() { return updated_at; }
    public void setUpdated_at(String updated_at) { this.updated_at = updated_at; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<ComplaintHistory> getHistory() { return history; }
    public void setHistory(List<ComplaintHistory> history) { this.history = history; }

    public SlaInfo getSla() { return sla; }
    public void setSla(SlaInfo sla) { this.sla = sla; }
}
