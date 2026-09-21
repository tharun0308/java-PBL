package com.scms.service;

import com.scms.model.Complaint;
import com.scms.model.Notification;
import com.scms.repository.NotificationRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service managing real-time notifications for students and administrators.
 */
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService() {
        this.notificationRepository = new NotificationRepository();
    }

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotifications(String userId, boolean isAdmin, int limit) {
        return notificationRepository.findByRecipient(userId, isAdmin, limit);
    }

    public void markAllRead(String userId, boolean isAdmin) {
        notificationRepository.markAllRead(userId, isAdmin);
    }

    public void notifyAdminComplaintFiled(Complaint complaint) {
        String num = String.format("%04d", complaint.getComplaint_number());
        Notification notif = new Notification(
                UUID.randomUUID().toString(),
                "admin",
                "New Complaint Filed",
                "Complaint #SCMS-" + num + " (" + complaint.getCategory() + ") reported at " + complaint.getLocation() + ".",
                "/admin/complaints/" + complaint.getId(),
                false,
                Instant.now().toString()
        );
        notificationRepository.save(notif);
    }

    public void notifyAdminFeedbackReceived(Complaint complaint, int rating, String feedbackNote) {
        String num = String.format("%04d", complaint.getComplaint_number());
        String msg = "Student submitted a " + rating + "-star rating: \"" +
                (feedbackNote != null && !feedbackNote.isEmpty() ? feedbackNote : "No comment") + "\"";
        Notification notif = new Notification(
                UUID.randomUUID().toString(),
                "admin",
                "Feedback Received for #SCMS-" + num,
                msg,
                "/admin/complaints/" + complaint.getId(),
                false,
                Instant.now().toString()
        );
        notificationRepository.save(notif);
    }

    public void notifyStudentStatusUpdated(Complaint complaint, String newStatus, String resolutionNote) {
        String num = String.format("%04d", complaint.getComplaint_number());
        String msg = "Status changed to \"" + newStatus + "\"." +
                (resolutionNote != null && !resolutionNote.isEmpty() ? " Note: " + resolutionNote : "");

        Notification notif = new Notification(
                UUID.randomUUID().toString(),
                complaint.getUser_id(),
                "Complaint #SCMS-" + num + " Updated",
                msg,
                "/complaints/" + complaint.getId(),
                false,
                Instant.now().toString()
        );
        notificationRepository.save(notif);
    }
}
