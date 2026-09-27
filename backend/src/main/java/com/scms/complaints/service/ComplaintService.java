package com.scms.complaints.service;

import com.scms.complaints.dto.*;
import com.scms.complaints.entity.*;
import com.scms.complaints.repository.ComplaintHistoryRepository;
import com.scms.complaints.repository.ComplaintRepository;
import com.scms.exception.BadRequestException;
import com.scms.exception.ForbiddenException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.security.UserPrincipal;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import com.scms.users.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    private final ComplaintRepository complaintRepository;
    private final ComplaintHistoryRepository complaintHistoryRepository;
    private final com.scms.complaints.repository.ComplaintVoteRepository complaintVoteRepository;
    private final UserRepository userRepository;
    private final Path uploadStorageLocation;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            ComplaintHistoryRepository complaintHistoryRepository,
            com.scms.complaints.repository.ComplaintVoteRepository complaintVoteRepository,
            UserRepository userRepository,
            @Value("${app.upload.complaints-dir:uploads/complaint-photos}") String uploadDir) {
        this.complaintRepository = complaintRepository;
        this.complaintHistoryRepository = complaintHistoryRepository;
        this.complaintVoteRepository = complaintVoteRepository;
        this.userRepository = userRepository;
        this.uploadStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadStorageLocation);
        } catch (IOException e) {
            log.error("Could not initialize complaint photo storage directory at {}", this.uploadStorageLocation, e);
        }
    }

    /**
     * Stores an uploaded defect photo for a complaint.
     * File naming pattern: complaint-${userId}-${timestamp}-${randomUuid}.${ext}
     */
    public String storeComplaintPhoto(UserPrincipal currentUser, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the 5MB limit.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BadRequestException("Invalid filename or missing extension.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only JPG, PNG, and WEBP image files are allowed.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid image MIME type. Only JPG, PNG, and WEBP images are allowed.");
        }

        String randomUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        long timestamp = Instant.now().toEpochMilli();
        String generatedFilename = String.format("complaint-%s-%d-%s%s", currentUser.getId().toString(), timestamp, randomUuid, extension);

        try {
            Files.createDirectories(this.uploadStorageLocation);
            Path targetLocation = this.uploadStorageLocation.resolve(generatedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored defect photo for user {} as {}", currentUser.getEmail(), generatedFilename);
            return generatedFilename;
        } catch (IOException ex) {
            log.error("Failed to store uploaded complaint photo file", ex);
            throw new BadRequestException("Failed to store photo on server. Please try again.");
        }
    }

    /**
     * Loads the stored complaint photo file as a Resource.
     */
    @Transactional(readOnly = true)
    public Resource getComplaintPhoto(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new ResourceNotFoundException("No photo filename specified.");
        }

        // Prevent path traversal attacks
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new BadRequestException("Invalid photo filename.");
        }

        try {
            Path filePath = this.uploadStorageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Complaint photo file not found on disk.");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Invalid file path for complaint photo.");
        }
    }

    @Transactional
    public ComplaintResponseDto createComplaint(CreateComplaintDto dto, UserPrincipal principal) {
        User submitter = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Submitting user not found"));

        String complaintNumber = generateComplaintNumber();

        Complaint complaint = new Complaint(
                complaintNumber,
                submitter,
                dto.getCategory(),
                dto.getLocation().trim(),
                dto.getDescription().trim(),
                dto.getPriority()
        );

        if (dto.getCategory() == ComplaintCategory.OTHER && dto.getCustomCategory() != null) {
            complaint.setCustomCategory(dto.getCustomCategory().trim());
        }

        if (dto.getPhotoPaths() != null && !dto.getPhotoPaths().isEmpty()) {
            List<String> cleanPaths = dto.getPhotoPaths().stream()
                    .filter(p -> p != null && !p.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toList());
            if (!cleanPaths.isEmpty()) {
                complaint.setPhotoPaths(String.join(",", cleanPaths));
            }
        }

        complaint = complaintRepository.save(complaint);

        // Record initial history entry
        ComplaintHistory initialHistory = new ComplaintHistory(
                complaint,
                null,
                ComplaintStatus.PENDING,
                "Complaint filed by student/faculty.",
                submitter
        );
        complaintHistoryRepository.save(initialHistory);
        complaint.getHistory().add(initialHistory);

        log.info("Created new complaint {} by {}", complaintNumber, submitter.getEmail());
        return new ComplaintResponseDto(complaint);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponseDto> getComplaints(
            UserPrincipal principal,
            ComplaintStatus status,
            ComplaintCategory category,
            ComplaintPriority priority,
            String search,
            Pageable pageable) {

        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Scoping: STUDENT_TEACHER can only see their own complaints
            if (principal.getRole() == Role.STUDENT_TEACHER ||
               (principal.getRole() == Role.STAFF_ADMIN && principal.getStaffAdminStatus() != StaffAdminStatus.APPROVED)) {
                predicates.add(cb.equal(root.get("submittedBy").get("id"), principal.getId()));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate numMatch = cb.like(cb.lower(root.get("complaintNumber")), searchPattern);
                Predicate locMatch = cb.like(cb.lower(root.get("location")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(numMatch, locMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return complaintRepository.findAll(spec, pageable).map(ComplaintResponseDto::new);
    }

    @Transactional(readOnly = true)
    public ComplaintResponseDto getComplaintById(UUID id, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        boolean hasUpvoted = principal != null && complaintVoteRepository.existsByComplaintIdAndUserId(complaint.getId(), principal.getId());
        return new ComplaintResponseDto(complaint, hasUpvoted);
    }

    /**
     * Public campus-wide complaint feed with upvote tracking for regular users (Students and Teachers).
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponseDto> getPublicComplaints(
            UserPrincipal principal,
            ComplaintStatus status,
            ComplaintCategory category,
            ComplaintPriority priority,
            String search,
            Boolean escalatedOnly,
            Pageable pageable) {

        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (Boolean.TRUE.equals(escalatedOnly)) {
                predicates.add(cb.gt(root.get("escalationLevel"), 0));
            }
            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate numMatch = cb.like(cb.lower(root.get("complaintNumber")), searchPattern);
                Predicate locMatch = cb.like(cb.lower(root.get("location")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(numMatch, locMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return complaintRepository.findAll(spec, pageable).map(complaint -> {
            boolean hasUpvoted = principal != null && complaintVoteRepository.existsByComplaintIdAndUserId(complaint.getId(), principal.getId());
            return new ComplaintResponseDto(complaint, hasUpvoted);
        });
    }

    /**
     * Upvotes a complaint (one vote per user).
     */
    @Transactional
    public ComplaintResponseDto upvoteComplaint(UUID complaintId, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!complaintVoteRepository.existsByComplaintIdAndUserId(complaint.getId(), user.getId())) {
            com.scms.complaints.entity.ComplaintVote vote = new com.scms.complaints.entity.ComplaintVote(complaint, user);
            complaintVoteRepository.save(vote);
            complaint.setUpvoteCount(complaint.getUpvoteCount() + 1);
            complaint = complaintRepository.save(complaint);
            log.info("User {} upvoted complaint {}", user.getEmail(), complaint.getComplaintNumber());
        }

        return new ComplaintResponseDto(complaint, true);
    }

    /**
     * Removes an upvote from a complaint.
     */
    @Transactional
    public ComplaintResponseDto removeUpvote(UUID complaintId, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (complaintVoteRepository.existsByComplaintIdAndUserId(complaint.getId(), user.getId())) {
            complaintVoteRepository.deleteByComplaintIdAndUserId(complaint.getId(), user.getId());
            complaint.setUpvoteCount(Math.max(0, complaint.getUpvoteCount() - 1));
            complaint = complaintRepository.save(complaint);
            log.info("User {} removed upvote on complaint {}", user.getEmail(), complaint.getComplaintNumber());
        }

        return new ComplaintResponseDto(complaint, false);
    }

    @Transactional
    public ComplaintResponseDto updateStatus(UUID id, UpdateStatusDto dto, UserPrincipal principal) {
        verifyStaffOrAdmin(principal);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User actingUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Acting user not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = dto.getStatus();

        complaint.setStatus(newStatus);
        if (StringUtils.hasText(dto.getNote())) {
            complaint.setResolutionNote(dto.getNote().trim());
        }

        complaint = complaintRepository.save(complaint);

        // Immutable history entry
        ComplaintHistory history = new ComplaintHistory(
                complaint,
                oldStatus,
                newStatus,
                dto.getNote() != null ? dto.getNote().trim() : "Status updated to " + newStatus,
                actingUser
        );
        complaintHistoryRepository.save(history);
        complaint.getHistory().add(history);

        log.info("Complaint {} status changed from {} to {} by {}",
                complaint.getComplaintNumber(), oldStatus, newStatus, actingUser.getEmail());

        return new ComplaintResponseDto(complaint);
    }

    @Transactional
    public ComplaintResponseDto assignStaff(UUID id, AssignStaffDto dto, UserPrincipal principal) {
        verifyStaffOrAdmin(principal);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User staffMember = userRepository.findById(dto.getAssignedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with ID: " + dto.getAssignedToUserId()));

        if (staffMember.getRole() != Role.STAFF_ADMIN && staffMember.getRole() != Role.MAIN_ADMIN) {
            throw new BadRequestException("Complaints can only be assigned to staff or administrators.");
        }

        User actingUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Acting user not found"));

        complaint.setAssignedTo(staffMember);
        if (complaint.getStatus() == ComplaintStatus.PENDING) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }
        complaint = complaintRepository.save(complaint);

        ComplaintHistory history = new ComplaintHistory(
                complaint,
                complaint.getStatus(),
                complaint.getStatus(),
                "Complaint assigned to " + staffMember.getFullName() + " (" + staffMember.getEmail() + ")",
                actingUser
        );
        complaintHistoryRepository.save(history);
        complaint.getHistory().add(history);

        log.info("Complaint {} assigned to {} by {}",
                complaint.getComplaintNumber(), staffMember.getEmail(), actingUser.getEmail());

        return new ComplaintResponseDto(complaint);
    }

    @Transactional
    public void deleteComplaint(UUID id, UserPrincipal principal) {
        if (principal.getRole() != Role.MAIN_ADMIN) {
            throw new ForbiddenException("Only Main Administrators can delete complaints.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        complaintRepository.delete(complaint);
        log.info("Complaint {} deleted by Main Admin {}", complaint.getComplaintNumber(), principal.getEmail());
    }

    private void verifyStaffOrAdmin(UserPrincipal principal) {
        if (principal.getRole() == Role.MAIN_ADMIN) {
            return;
        }
        if (principal.getRole() == Role.STAFF_ADMIN && principal.getStaffAdminStatus() == StaffAdminStatus.APPROVED) {
            return;
        }
        throw new ForbiddenException("Only approved Staff Admins and Main Admins can perform this action.");
    }

    private String generateComplaintNumber() {
        try {
            Long nextSeq = complaintRepository.getNextComplaintSequenceNumber();
            if (nextSeq != null) {
                return String.format("#GRIV-%04d", nextSeq);
            }
        } catch (Exception e) {
            log.warn("Could not fetch sequence, using fallback counter: {}", e.getMessage());
        }
        // Fallback for H2 or test environments without postgres native sequence
        long count = complaintRepository.count() + 1;
        return String.format("#GRIV-%04d", count);
    }

    /**
     * Evaluates all unresolved complaints, checks against priority SLAs,
     * and automatically escalates Level 1 (HOD) or Level 2 (Principal/Main Admin).
     */
    @Transactional
    public EscalationRunResult runEscalationCheck() {
        List<Complaint> activeComplaints = complaintRepository.findAll((root, query, cb) ->
                root.get("status").in(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS)
        );

        int l1Count = 0;
        int l2Count = 0;
        List<String> escalatedNumbers = new ArrayList<>();
        Instant now = Instant.now();

        List<User> hods = userRepository.findByStaffAdminRoleAndStaffAdminStatus(com.scms.users.entity.StaffAdminRole.HOD, StaffAdminStatus.APPROVED);
        List<User> principals = userRepository.findByStaffAdminRoleAndStaffAdminStatus(com.scms.users.entity.StaffAdminRole.PRINCIPAL, StaffAdminStatus.APPROVED);
        List<User> mainAdmins = userRepository.findByRole(Role.MAIN_ADMIN);

        for (Complaint complaint : activeComplaints) {
            long ageHours = java.time.Duration.between(complaint.getCreatedAt(), now).toHours();
            int slaHours = getSlaHours(complaint.getPriority());

            // Level 1: SLA + Grace period (12h for HIGH, 24h for MEDIUM/LOW)
            long l1GraceHours = complaint.getPriority() == ComplaintPriority.HIGH ? 12 : 24;
            long l1Threshold = slaHours + l1GraceHours;

            // Level 2: L1 threshold + 24h (or 48h for LOW)
            long l2GraceHours = complaint.getPriority() == ComplaintPriority.LOW ? 48 : 24;
            long l2Threshold = l1Threshold + l2GraceHours;

            int currentLevel = complaint.getEscalationLevel();

            if (currentLevel == 0 && ageHours >= l1Threshold) {
                // Escalate to Level 1 (HOD or Principal/Admin fallback)
                User targetOfficer = findMatchingHod(complaint, hods);
                if (targetOfficer == null) {
                    targetOfficer = !principals.isEmpty() ? principals.get(0) : (!mainAdmins.isEmpty() ? mainAdmins.get(0) : null);
                }

                complaint.setEscalationLevel(1);
                complaint.setEscalatedAt(now);
                complaint.setEscalatedTo(targetOfficer);
                complaintRepository.save(complaint);

                String officerName = targetOfficer != null ? targetOfficer.getFullName() : "Executive Office";
                String note = String.format("[System Escalation] Auto-escalated to Level 1 (%s) due to SLA breach (%dh overdue)",
                        officerName, (ageHours - slaHours));

                ComplaintHistory history = new ComplaintHistory(
                        complaint,
                        complaint.getStatus(),
                        complaint.getStatus(),
                        note,
                        targetOfficer
                );
                complaintHistoryRepository.save(history);
                complaint.getHistory().add(history);

                l1Count++;
                escalatedNumbers.add(complaint.getComplaintNumber() + " (L1)");
                log.info("Auto-escalated complaint {} to Level 1 (Officer: {})", complaint.getComplaintNumber(), officerName);

            } else if (currentLevel == 1 && ageHours >= l2Threshold) {
                // Escalate to Level 2 (Principal / Main Admin)
                User targetOfficer = !principals.isEmpty() ? principals.get(0) : (!mainAdmins.isEmpty() ? mainAdmins.get(0) : null);

                complaint.setEscalationLevel(2);
                complaint.setEscalatedAt(now);
                complaint.setEscalatedTo(targetOfficer);
                complaintRepository.save(complaint);

                String officerName = targetOfficer != null ? targetOfficer.getFullName() : "Campus Main Administrator";
                String note = String.format("[System Escalation] Auto-escalated to Level 2 (%s) due to critical SLA breach (%dh overdue)",
                        officerName, (ageHours - slaHours));

                ComplaintHistory history = new ComplaintHistory(
                        complaint,
                        complaint.getStatus(),
                        complaint.getStatus(),
                        note,
                        targetOfficer
                );
                complaintHistoryRepository.save(history);
                complaint.getHistory().add(history);

                l2Count++;
                escalatedNumbers.add(complaint.getComplaintNumber() + " (L2)");
                log.info("Auto-escalated complaint {} to Level 2 (Officer: {})", complaint.getComplaintNumber(), officerName);
            }
        }

        return new EscalationRunResult(activeComplaints.size(), l1Count, l2Count, escalatedNumbers);
    }

    private int getSlaHours(ComplaintPriority priority) {
        if (priority == null) return 48;
        switch (priority) {
            case HIGH: return 24;
            case MEDIUM: return 48;
            case LOW: return 120;
            default: return 48;
        }
    }

    private User findMatchingHod(Complaint complaint, List<User> hods) {
        if (hods.isEmpty()) return null;
        String catName = complaint.getCategory() != null ? complaint.getCategory().name().toLowerCase() : "";
        for (User hod : hods) {
            String dept = hod.getStaffAdminDepartment();
            if (dept != null && !dept.trim().isEmpty()) {
                String deptLower = dept.toLowerCase();
                if (deptLower.contains(catName) ||
                   (catName.contains("electric") && deptLower.contains("electric")) ||
                   (catName.contains("water") && (deptLower.contains("water") || deptLower.contains("plumb") || deptLower.contains("maint"))) ||
                   (catName.contains("it") && (deptLower.contains("it") || deptLower.contains("comp") || deptLower.contains("tech"))) ||
                   (catName.contains("lab") && deptLower.contains("lab")) ||
                   (catName.contains("hostel") && deptLower.contains("hostel"))) {
                    return hod;
                }
            }
        }
        return hods.get(0);
    }

    public static class EscalationRunResult {
        private final int scannedCount;
        private final int level1Count;
        private final int level2Count;
        private final List<String> escalatedComplaintNumbers;

        public EscalationRunResult(int scannedCount, int level1Count, int level2Count, List<String> escalatedComplaintNumbers) {
            this.scannedCount = scannedCount;
            this.level1Count = level1Count;
            this.level2Count = level2Count;
            this.escalatedComplaintNumbers = escalatedComplaintNumbers;
        }

        public int getScannedCount() { return scannedCount; }
        public int getLevel1Count() { return level1Count; }
        public int getLevel2Count() { return level2Count; }
        public List<String> getEscalatedComplaintNumbers() { return escalatedComplaintNumbers; }
    }
}
