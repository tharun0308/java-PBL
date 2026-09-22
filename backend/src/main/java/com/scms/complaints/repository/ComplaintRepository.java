package com.scms.complaints.repository;

import com.scms.complaints.entity.Complaint;
import com.scms.complaints.entity.ComplaintCategory;
import com.scms.complaints.entity.ComplaintPriority;
import com.scms.complaints.entity.ComplaintStatus;
import com.scms.users.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID>, JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByComplaintNumber(String complaintNumber);

    Page<Complaint> findBySubmittedBy(User user, Pageable pageable);

    @Query(value = "SELECT nextval('complaint_seq')", nativeQuery = true)
    Long getNextComplaintSequenceNumber();

    long countByStatus(ComplaintStatus status);

    long countByCategory(ComplaintCategory category);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countGroupByCategory();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countGroupByPriority();
}
