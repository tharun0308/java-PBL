package com.scms.service;

import com.scms.complaints.dto.AssignStaffDto;
import com.scms.complaints.dto.ComplaintResponseDto;
import com.scms.complaints.dto.CreateComplaintDto;
import com.scms.complaints.dto.UpdateStatusDto;
import com.scms.complaints.entity.*;
import com.scms.complaints.repository.ComplaintHistoryRepository;
import com.scms.complaints.repository.ComplaintRepository;
import com.scms.complaints.service.ComplaintService;
import com.scms.exception.ForbiddenException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.security.UserPrincipal;
import com.scms.users.entity.AuthProvider;
import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import com.scms.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private ComplaintHistoryRepository complaintHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ComplaintService complaintService;

    private User studentUser;
    private User staffUser;
    private User adminUser;
    private Complaint sampleComplaint;

    @BeforeEach
    void setUp() {
        studentUser = new User("student@college.edu", "hash", "Student Alex", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        studentUser.setId(UUID.randomUUID());

        staffUser = new User("staff@college.edu", "hash", "Staff Dave", Role.STAFF_ADMIN, AuthProvider.LOCAL);
        staffUser.setId(UUID.randomUUID());
        staffUser.setStaffAdminStatus(StaffAdminStatus.APPROVED);

        adminUser = new User("admin@college.edu", "hash", "Admin Sarah", Role.MAIN_ADMIN, AuthProvider.LOCAL);
        adminUser.setId(UUID.randomUUID());
        adminUser.setStaffAdminStatus(StaffAdminStatus.APPROVED);

        sampleComplaint = new Complaint(
                "#SCMS-0001",
                studentUser,
                ComplaintCategory.ELECTRICAL,
                "Block A, Room 204",
                "Ceiling fan is not functioning properly and making noise.",
                ComplaintPriority.HIGH
        );
        sampleComplaint.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should create complaint with sequential number and initial history entry")
    void testCreateComplaintSuccess() {
        CreateComplaintDto dto = new CreateComplaintDto(
                ComplaintCategory.ELECTRICAL,
                "Block A, Room 204",
                "Ceiling fan is not functioning properly and making noise.",
                ComplaintPriority.HIGH
        );
        UserPrincipal principal = UserPrincipal.create(studentUser);

        when(userRepository.findById(studentUser.getId())).thenReturn(Optional.of(studentUser));
        when(complaintRepository.getNextComplaintSequenceNumber()).thenReturn(1L);
        when(complaintRepository.save(any(Complaint.class))).thenReturn(sampleComplaint);
        when(complaintHistoryRepository.save(any(ComplaintHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintResponseDto response = complaintService.createComplaint(dto, principal);

        assertNotNull(response);
        assertEquals("#SCMS-0001", response.getComplaintNumber());
        assertEquals(ComplaintStatus.PENDING, response.getStatus());
        assertEquals(ComplaintCategory.ELECTRICAL, response.getCategory());

        verify(complaintRepository, times(1)).save(any(Complaint.class));
        verify(complaintHistoryRepository, times(1)).save(any(ComplaintHistory.class));
    }

    @Test
    @DisplayName("Staff Admin should update complaint status and create history entry")
    void testUpdateStatusSuccess() {
        UpdateStatusDto dto = new UpdateStatusDto(ComplaintStatus.IN_PROGRESS, "Technician dispatched to inspection.");
        UserPrincipal staffPrincipal = UserPrincipal.create(staffUser);

        when(complaintRepository.findById(sampleComplaint.getId())).thenReturn(Optional.of(sampleComplaint));
        when(userRepository.findById(staffUser.getId())).thenReturn(Optional.of(staffUser));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(complaintHistoryRepository.save(any(ComplaintHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintResponseDto response = complaintService.updateStatus(sampleComplaint.getId(), dto, staffPrincipal);

        assertNotNull(response);
        assertEquals(ComplaintStatus.IN_PROGRESS, response.getStatus());
        assertEquals("Technician dispatched to inspection.", response.getResolutionNote());

        verify(complaintHistoryRepository, times(1)).save(any(ComplaintHistory.class));
    }

    @Test
    @DisplayName("Student should not be able to update complaint status")
    void testStudentCannotUpdateStatus() {
        UpdateStatusDto dto = new UpdateStatusDto(ComplaintStatus.RESOLVED, "Resolved by student");
        UserPrincipal studentPrincipal = UserPrincipal.create(studentUser);

        assertThrows(ForbiddenException.class, () ->
                complaintService.updateStatus(sampleComplaint.getId(), dto, studentPrincipal));

        verify(complaintRepository, never()).save(any(Complaint.class));
    }

    @Test
    @DisplayName("Pending Staff Admin should not be able to update complaint status")
    void testPendingStaffCannotUpdateStatus() {
        User pendingStaff = new User("pending@college.edu", "hash", "Pending Staff", Role.STAFF_ADMIN, AuthProvider.LOCAL);
        pendingStaff.setId(UUID.randomUUID());
        pendingStaff.setStaffAdminStatus(StaffAdminStatus.PENDING);
        UserPrincipal pendingPrincipal = UserPrincipal.create(pendingStaff);

        UpdateStatusDto dto = new UpdateStatusDto(ComplaintStatus.RESOLVED, "Resolved by pending staff");

        assertThrows(ForbiddenException.class, () ->
                complaintService.updateStatus(sampleComplaint.getId(), dto, pendingPrincipal));

        verify(complaintRepository, never()).save(any(Complaint.class));
    }

    @Test
    @DisplayName("Student should not be able to view another student's complaint")
    void testStudentCannotViewOtherStudentComplaint() {
        User otherStudent = new User("other@college.edu", "hash", "Other Student", Role.STUDENT_TEACHER, AuthProvider.LOCAL);
        otherStudent.setId(UUID.randomUUID());
        UserPrincipal otherPrincipal = UserPrincipal.create(otherStudent);

        when(complaintRepository.findById(sampleComplaint.getId())).thenReturn(Optional.of(sampleComplaint));

        assertThrows(ForbiddenException.class, () ->
                complaintService.getComplaintById(sampleComplaint.getId(), otherPrincipal));
    }

    @Test
    @DisplayName("Pending Staff Admin should not be able to view another user's complaint")
    void testPendingStaffCannotViewOtherComplaint() {
        User pendingStaff = new User("pending@college.edu", "hash", "Pending Staff", Role.STAFF_ADMIN, AuthProvider.LOCAL);
        pendingStaff.setId(UUID.randomUUID());
        pendingStaff.setStaffAdminStatus(StaffAdminStatus.PENDING);
        UserPrincipal pendingPrincipal = UserPrincipal.create(pendingStaff);

        when(complaintRepository.findById(sampleComplaint.getId())).thenReturn(Optional.of(sampleComplaint));

        assertThrows(ForbiddenException.class, () ->
                complaintService.getComplaintById(sampleComplaint.getId(), pendingPrincipal));
    }

    @Test
    @DisplayName("Admin can assign complaint to a staff member")
    void testAssignComplaint() {
        AssignStaffDto dto = new AssignStaffDto(staffUser.getId());
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);

        when(complaintRepository.findById(sampleComplaint.getId())).thenReturn(Optional.of(sampleComplaint));
        when(userRepository.findById(staffUser.getId())).thenReturn(Optional.of(staffUser));
        when(userRepository.findById(adminUser.getId())).thenReturn(Optional.of(adminUser));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(complaintHistoryRepository.save(any(ComplaintHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintResponseDto response = complaintService.assignStaff(sampleComplaint.getId(), dto, adminPrincipal);

        assertNotNull(response);
        assertEquals(staffUser.getId(), response.getAssignedToId());
        assertEquals(ComplaintStatus.IN_PROGRESS, response.getStatus());
    }
}
