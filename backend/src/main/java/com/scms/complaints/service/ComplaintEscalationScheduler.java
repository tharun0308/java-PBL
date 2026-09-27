package com.scms.complaints.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ComplaintEscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ComplaintEscalationScheduler.class);
    private final ComplaintService complaintService;

    public ComplaintEscalationScheduler(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * Runs hourly check for SLA-breached unresolved complaints and escalates them automatically.
     */
    @Scheduled(cron = "${app.escalation.cron:0 0 * * * *}")
    public void runHourlyEscalationJob() {
        log.info("Starting scheduled hourly complaint escalation evaluation...");
        try {
            ComplaintService.EscalationRunResult result = complaintService.runEscalationCheck();
            log.info("Scheduled escalation evaluation completed: scanned {}, Level 1 escalated {}, Level 2 escalated {}",
                    result.getScannedCount(), result.getLevel1Count(), result.getLevel2Count());
        } catch (Exception e) {
            log.error("Error during scheduled escalation evaluation", e);
        }
    }
}
