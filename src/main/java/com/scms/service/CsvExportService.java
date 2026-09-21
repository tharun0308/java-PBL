package com.scms.service;

import com.scms.model.Complaint;

import java.util.List;

/**
 * Service exporting complaints data into RFC-4180 compliant CSV format for campus reports.
 */
public class CsvExportService {

    public String exportToCsv(List<Complaint> complaints) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ticket ID,Complaint Number,Category,Location,Priority,Status,Assigned To,Resolution Note,Rating,Feedback Note,Created At,Updated At\n");

        if (complaints != null) {
            for (Complaint c : complaints) {
                String ticketId = String.format("SCMS-%04d", c.getComplaint_number());
                sb.append(escapeCsv(ticketId)).append(",");
                sb.append(c.getComplaint_number()).append(",");
                sb.append(escapeCsv(c.getCategory())).append(",");
                sb.append(escapeCsv(c.getLocation())).append(",");
                sb.append(escapeCsv(c.getPriority())).append(",");
                sb.append(escapeCsv(c.getStatus())).append(",");
                sb.append(escapeCsv(c.getAssigned_to())).append(",");
                sb.append(escapeCsv(c.getResolution_note())).append(",");
                sb.append(c.getRating() != null ? c.getRating() : "").append(",");
                sb.append(escapeCsv(c.getFeedback_note())).append(",");
                sb.append(escapeCsv(c.getCreated_at())).append(",");
                sb.append(escapeCsv(c.getUpdated_at())).append("\n");
            }
        }

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
