package com.scms.repository;

import com.scms.model.Complaint;
import com.scms.model.ComplaintHistory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Repository for managing Complaint entities and their associated Audit Histories.
 */
public class ComplaintRepository {
    private final DataStore dataStore;

    public ComplaintRepository() {
        this.dataStore = DataStore.getInstance();
    }

    public ComplaintRepository(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<Complaint> findAll() {
        return dataStore.getComplaints();
    }

    public Optional<Complaint> findById(String id) {
        if (id == null) return Optional.empty();
        return dataStore.getComplaints().stream()
                .filter(c -> id.equals(c.getId()))
                .findFirst();
    }

    public int getMaxComplaintNumber() {
        return dataStore.getComplaints().stream()
                .mapToInt(Complaint::getComplaint_number)
                .max()
                .orElse(0);
    }

    public Complaint save(Complaint complaint) {
        dataStore.addComplaint(complaint);
        return complaint;
    }

    public void update(Complaint complaint) {
        dataStore.updateComplaint(complaint);
    }

    public List<ComplaintHistory> findHistoryByComplaintId(String complaintId) {
        if (complaintId == null) return List.of();
        return dataStore.getHistory().stream()
                .filter(h -> complaintId.equals(h.getComplaint_id()))
                .collect(Collectors.toList());
    }

    public void saveHistory(ComplaintHistory history) {
        dataStore.addHistory(history);
    }
}
