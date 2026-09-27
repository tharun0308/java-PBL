package com.scms.complaints.repository;

import com.scms.complaints.entity.Complaint;
import com.scms.complaints.entity.ComplaintVote;
import com.scms.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintVoteRepository extends JpaRepository<ComplaintVote, UUID> {
    Optional<ComplaintVote> findByComplaintAndUser(Complaint complaint, User user);
    Optional<ComplaintVote> findByComplaintIdAndUserId(UUID complaintId, UUID userId);
    boolean existsByComplaintIdAndUserId(UUID complaintId, UUID userId);
    long countByComplaintId(UUID complaintId);
    void deleteByComplaintAndUser(Complaint complaint, User user);
    void deleteByComplaintIdAndUserId(UUID complaintId, UUID userId);
}
