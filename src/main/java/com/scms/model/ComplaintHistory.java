package com.scms.model;

/**
 * Audit history log tracking every transition and action on a complaint.
 */
public class ComplaintHistory {
    private String id;
    private String complaint_id;
    private String old_status;
    private String new_status;
    private String note;
    private String updated_by;
    private String updated_at;
    private User updater;

    public ComplaintHistory() {}

    public ComplaintHistory(String id, String complaint_id, String old_status, String new_status, String note, String updated_by, String updated_at) {
        this.id = id;
        this.complaint_id = complaint_id;
        this.old_status = old_status;
        this.new_status = new_status;
        this.note = note;
        this.updated_by = updated_by;
        this.updated_at = updated_at;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getComplaint_id() {
        return complaint_id;
    }

    public void setComplaint_id(String complaint_id) {
        this.complaint_id = complaint_id;
    }

    public String getOld_status() {
        return old_status;
    }

    public void setOld_status(String old_status) {
        this.old_status = old_status;
    }

    public String getNew_status() {
        return new_status;
    }

    public void setNew_status(String new_status) {
        this.new_status = new_status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getUpdated_by() {
        return updated_by;
    }

    public void setUpdated_by(String updated_by) {
        this.updated_by = updated_by;
    }

    public String getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(String updated_at) {
        this.updated_at = updated_at;
    }

    public User getUpdater() {
        return updater;
    }

    public void setUpdater(User updater) {
        this.updater = updater;
    }
}
