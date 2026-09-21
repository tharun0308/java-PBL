package com.scms.service;

import com.scms.model.*;
import com.scms.repository.ComplaintRepository;
import com.scms.repository.UserRepository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core business service handling complaint management, lifecycle transitions,
 * audit history logging, and role permission enforcement.
 */
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ComplaintService() {
        this.complaintRepository = new ComplaintRepository();
        this.userRepository = new UserRepository();
        this.notificationService = new NotificationService();
    }

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository, NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * File a new complaint.
     * Enforces the architectural rule: Administrators manage campus complaints and cannot file complaints.
     */
    public Complaint createComplaint(User currentUser, String category, String location, String description, String priority, String imageUrl) {
        if (currentUser != null && currentUser.isAdmin()) {
            throw new SecurityException("Administrators manage campus complaints and cannot file new complaints.");
        }

        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required.");
        }
        if (location == null || location.trim().length() < 3) {
            throw new IllegalArgumentException("Location must be at least 3 characters.");
        }
        if (description == null || description.trim().length() < 10) {
            throw new IllegalArgumentException("Description must be at least 10 characters.");
        }

        String userId = currentUser != null ? currentUser.getId() : "22222222-2222-2222-2222-222222222222";
        int newComplaintNumber = complaintRepository.getMaxComplaintNumber() + 1;
        String now = Instant.now().toString();

        Complaint complaint = new Complaint();
        complaint.setId(UUID.randomUUID().toString());
        complaint.setComplaint_number(newComplaintNumber);
        complaint.setUser_id(userId);
        complaint.setCategory(category.trim());
        complaint.setLocation(location.trim());
        complaint.setDescription(description.trim());
        complaint.setPriority(priority != null ? priority.trim() : "Medium");
        complaint.setStatus("Pending");
        complaint.setAssigned_to(null);
        complaint.setResolution_note(null);
        complaint.setImage_url(imageUrl != null && !imageUrl.trim().isEmpty() ? imageUrl.trim() : null);
        complaint.setResolution_image_url(null);
        complaint.setRating(null);
        complaint.setFeedback_note(null);
        complaint.setRated_at(null);
        complaint.setCreated_at(now);
        complaint.setUpdated_at(now);

        complaintRepository.save(complaint);

        // Record Initial Audit History Entry
        ComplaintHistory history = new ComplaintHistory();
        history.setId(UUID.randomUUID().toString());
        history.setComplaint_id(complaint.getId());
        history.setOld_status(null);
        history.setNew_status("Pending");
        history.setNote("Complaint registered by student");
        history.setUpdated_by(userId);
        history.setUpdated_at(now);
        complaintRepository.saveHistory(history);

        // Notify Administration
        notificationService.notifyAdminComplaintFiled(complaint);

        return enrichComplaint(complaint);
    }

    public List<Complaint> getComplaints(User currentUser, String status, String category, String priority, String search) {
        boolean isAdmin = currentUser != null && currentUser.isAdmin();
        String currentUserId = currentUser != null ? currentUser.getId() : null;

        List<Complaint> list = complaintRepository.findAll();

        return list.stream()
                .filter(c -> {
                    // Role boundary: students only see their own complaints
                    if (!isAdmin && currentUserId != null && !currentUserId.equals(c.getUser_id())) {
                        return false;
                    }
                    if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status) && !status.equalsIgnoreCase(c.getStatus())) {
                        return false;
                    }
                    if (category != null && !category.isEmpty() && !"all".equalsIgnoreCase(category) && !category.equalsIgnoreCase(c.getCategory())) {
                        return false;
                    }
                    if (priority != null && !priority.isEmpty() && !"all".equalsIgnoreCase(priority) && !priority.equalsIgnoreCase(c.getPriority())) {
                        return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        String digits = q.replaceAll("[^0-9]", "");
                        if (!digits.isEmpty()) {
                            try {
                                int searchNum = Integer.parseInt(digits);
                                if (c.getComplaint_number() == searchNum) return true;
                            } catch (NumberFormatException ignored) {}
                        }
                        boolean locMatch = c.getLocation() != null && c.getLocation().toLowerCase().contains(q);
                        boolean descMatch = c.getDescription() != null && c.getDescription().toLowerCase().contains(q);
                        boolean catMatch = c.getCategory() != null && c.getCategory().toLowerCase().contains(q);
                        return locMatch || descMatch || catMatch;
                    }
                    return true;
                })
                .map(this::enrichComplaint)
                .sorted((a, b) -> {
                    try {
                        return Instant.parse(b.getCreated_at()).compareTo(Instant.parse(a.getCreated_at()));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .collect(Collectors.toList());
    }

    public Optional<Complaint> getComplaintById(String id) {
        Optional<Complaint> opt = complaintRepository.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Complaint complaint = enrichComplaint(opt.get());

        // Load audit history
        List<ComplaintHistory> history = complaintRepository.findHistoryByComplaintId(id).stream()
                .peek(h -> {
                    if (h.getUpdated_by() != null) {
                        userRepository.findById(h.getUpdated_by()).ifPresent(u -> {
                            User safeUser = new User();
                            safeUser.setId(u.getId());
                            safeUser.setFull_name(u.getFull_name());
                            safeUser.setEmail(u.getEmail());
                            safeUser.setRole(u.getRole());
                            h.setUpdater(safeUser);
                        });
                    }
                })
                .sorted((a, b) -> {
                    try {
                        return Instant.parse(b.getUpdated_at()).compareTo(Instant.parse(a.getUpdated_at()));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .collect(Collectors.toList());

        complaint.setHistory(history);
        return Optional.of(complaint);
    }

    public Complaint updateComplaintStatus(String id, String newStatus, String assignedTo, String resolutionNote, String resolutionImageUrl, String note, User adminUser) {
        Optional<Complaint> opt = complaintRepository.findById(id);
        if (opt.isEmpty()) {
            throw new NoSuchElementException("Complaint not found with ID: " + id);
        }

        Complaint complaint = opt.get();
        String oldStatus = complaint.getStatus();
        String now = Instant.now().toString();

        if (newStatus != null && !newStatus.trim().isEmpty()) {
            complaint.setStatus(newStatus.trim());
        }
        if (assignedTo != null) {
            complaint.setAssigned_to(assignedTo.trim());
        }
        if (resolutionNote != null) {
            complaint.setResolution_note(resolutionNote.trim());
        }
        if (resolutionImageUrl != null) {
            complaint.setResolution_image_url(resolutionImageUrl.trim());
        }
        complaint.setUpdated_at(now);

        complaintRepository.update(complaint);

        // Record Audit History
        String adminId = adminUser != null ? adminUser.getId() : "11111111-1111-1111-1111-111111111111";
        ComplaintHistory history = new ComplaintHistory();
        history.setId(UUID.randomUUID().toString());
        history.setComplaint_id(id);
        history.setOld_status(oldStatus);
        history.setNew_status(complaint.getStatus());
        String historyNote = (note != null && !note.trim().isEmpty())
                ? note.trim()
                : (!oldStatus.equalsIgnoreCase(complaint.getStatus()) ? "Status updated to " + complaint.getStatus() : "Complaint details updated");
        history.setNote(historyNote);
        history.setUpdated_by(adminId);
        history.setUpdated_at(now);
        complaintRepository.saveHistory(history);

        // Notify Student
        notificationService.notifyStudentStatusUpdated(complaint, complaint.getStatus(), complaint.getResolution_note());

        return enrichComplaint(complaint);
    }

    public Complaint addFeedback(String complaintId, int rating, String feedbackNote, User studentUser) {
        Optional<Complaint> opt = complaintRepository.findById(complaintId);
        if (opt.isEmpty()) {
            throw new NoSuchElementException("Complaint not found with ID: " + complaintId);
        }

        Complaint complaint = opt.get();
        if (studentUser != null && !studentUser.getId().equals(complaint.getUser_id())) {
            throw new SecurityException("Students can only submit ratings for their own complaints.");
        }

        String now = Instant.now().toString();
        complaint.setRating(rating);
        complaint.setFeedback_note(feedbackNote != null ? feedbackNote.trim() : null);
        complaint.setRated_at(now);

        complaintRepository.update(complaint);

        // Notify Administration of Feedback
        notificationService.notifyAdminFeedbackReceived(complaint, rating, feedbackNote);

        return enrichComplaint(complaint);
    }

    private Complaint enrichComplaint(Complaint complaint) {
        // Attach user info
        if (complaint.getUser_id() != null) {
            userRepository.findById(complaint.getUser_id()).ifPresent(u -> {
                User safeUser = new User();
                safeUser.setId(u.getId());
                safeUser.setFull_name(u.getFull_name());
                safeUser.setEmail(u.getEmail());
                safeUser.setRole(u.getRole());
                complaint.setUser(safeUser);
            });
        }
        // Calculate SLA
        complaint.setSla(SlaService.calculateSla(complaint));
        return complaint;
    }
}
