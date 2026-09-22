package com.scms.reports.service;

import com.scms.complaints.entity.ComplaintCategory;
import com.scms.complaints.entity.ComplaintPriority;
import com.scms.complaints.entity.ComplaintStatus;
import com.scms.complaints.repository.ComplaintRepository;
import com.scms.reports.dto.ReportSummaryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.Map;

@Service
public class ReportService {

    private final ComplaintRepository complaintRepository;

    public ReportService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @Transactional(readOnly = true)
    public ReportSummaryDto getSummaryReport() {
        long total = complaintRepository.count();
        long pending = complaintRepository.countByStatus(ComplaintStatus.PENDING);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long rejected = complaintRepository.countByStatus(ComplaintStatus.REJECTED);

        double resolutionRate = total > 0 ? ((double) resolved / total) * 100.0 : 0.0;
        resolutionRate = Math.round(resolutionRate * 10.0) / 10.0; // Round to 1 decimal place

        Map<ComplaintCategory, Long> categoryMap = new EnumMap<>(ComplaintCategory.class);
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            categoryMap.put(cat, complaintRepository.countByCategory(cat));
        }

        Map<ComplaintStatus, Long> statusMap = new EnumMap<>(ComplaintStatus.class);
        statusMap.put(ComplaintStatus.PENDING, pending);
        statusMap.put(ComplaintStatus.IN_PROGRESS, inProgress);
        statusMap.put(ComplaintStatus.RESOLVED, resolved);
        statusMap.put(ComplaintStatus.REJECTED, rejected);

        Map<ComplaintPriority, Long> priorityMap = new EnumMap<>(ComplaintPriority.class);
        for (ComplaintPriority p : ComplaintPriority.values()) {
            priorityMap.put(p, 0L);
        }
        for (Object[] row : complaintRepository.countGroupByPriority()) {
            if (row[0] instanceof ComplaintPriority cp && row[1] instanceof Long count) {
                priorityMap.put(cp, count);
            }
        }

        return new ReportSummaryDto(
                total,
                pending,
                inProgress,
                resolved,
                rejected,
                resolutionRate,
                categoryMap,
                statusMap,
                priorityMap
        );
    }
}
