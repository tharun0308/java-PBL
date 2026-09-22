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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;
    private final ComplaintHistoryRepository complaintHistoryRepository;
    private final UserRepository userRepository;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            ComplaintHistoryRepository complaintHistoryRepository,
            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.complaintHistoryRepository = complaintHistoryRepository;
        this.userRepository = userRepository;
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

        // Authorization check: Only approved Staff Admin, Main Admin, or the complaint owner can view
        boolean isApprovedStaffOrAdmin = principal.getRole() == Role.MAIN_ADMIN ||
                (principal.getRole() == Role.STAFF_ADMIN && principal.getStaffAdminStatus() == StaffAdminStatus.APPROVED);

        if (!isApprovedStaffOrAdmin && !complaint.getSubmittedBy().getId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to view this complaint.");
        }

        return new ComplaintResponseDto(complaint);
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
                return String.format("#SCMS-%04d", nextSeq);
            }
        } catch (Exception e) {
            log.warn("Could not fetch sequence, using fallback counter: {}", e.getMessage());
        }
        // Fallback for H2 or test environments without postgres native sequence
        long count = complaintRepository.count() + 1;
        return String.format("#SCMS-%04d", count);
    }
}
