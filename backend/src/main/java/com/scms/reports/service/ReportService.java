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
        // 1. Single aggregate query for all statuses
        Map<ComplaintStatus, Long> statusMap = new EnumMap<>(ComplaintStatus.class);
        for (ComplaintStatus s : ComplaintStatus.values()) {
            statusMap.put(s, 0L);
        }
        long total = 0;
        for (Object[] row : complaintRepository.countGroupByStatus()) {
            if (row[0] instanceof ComplaintStatus cs && row[1] instanceof Long count) {
                statusMap.put(cs, count);
                total += count;
            }
        }

        long pending = statusMap.getOrDefault(ComplaintStatus.PENDING, 0L);
        long inProgress = statusMap.getOrDefault(ComplaintStatus.IN_PROGRESS, 0L);
        long resolved = statusMap.getOrDefault(ComplaintStatus.RESOLVED, 0L);
        long rejected = statusMap.getOrDefault(ComplaintStatus.REJECTED, 0L);

        double resolutionRate = total > 0 ? ((double) resolved / total) * 100.0 : 0.0;
        resolutionRate = Math.round(resolutionRate * 10.0) / 10.0; // Round to 1 decimal place

        // 2. Single aggregate query for all categories
        Map<ComplaintCategory, Long> categoryMap = new EnumMap<>(ComplaintCategory.class);
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            categoryMap.put(cat, 0L);
        }
        for (Object[] row : complaintRepository.countGroupByCategory()) {
            if (row[0] instanceof ComplaintCategory cc && row[1] instanceof Long count) {
                categoryMap.put(cc, count);
            }
        }

        // 3. Single aggregate query for all priorities
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
