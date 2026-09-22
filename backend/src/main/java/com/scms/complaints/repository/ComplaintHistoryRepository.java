package com.scms.complaints.repository;

import com.scms.complaints.entity.Complaint;
import com.scms.complaints.entity.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, UUID> {
    List<ComplaintHistory> findByComplaintOrderByUpdatedAtAsc(Complaint complaint);
}
