package com.scms.service;

import com.scms.model.Complaint;
import com.scms.model.Priority;
import com.scms.model.SlaInfo;

import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;

/**
 * Service calculating SLA deadlines, countdown timers, overdue flags, and badges.
 */
public class SlaService {

    public static int getSlaDurationHours(String priorityStr) {
        Priority priority = Priority.fromString(priorityStr);
        return priority.getSlaHours();
    }

    public static SlaInfo calculateSla(Complaint complaint) {
        if (complaint == null || complaint.getCreated_at() == null) {
            return new SlaInfo(48, "", 0, false, false, "48h SLA", "bg-slate-100 text-slate-700");
        }

        try {
            Instant createdAt = Instant.parse(complaint.getCreated_at());
            int targetHours = getSlaDurationHours(complaint.getPriority());
            Instant deadline = createdAt.plus(Duration.ofHours(targetHours));
            String deadlineStr = DateTimeFormatter.ISO_INSTANT.format(deadline);

            boolean isCompleted = "Resolved".equalsIgnoreCase(complaint.getStatus()) || "Rejected".equalsIgnoreCase(complaint.getStatus());

            if (isCompleted) {
                Instant resolvedAt = complaint.getUpdated_at() != null ? Instant.parse(complaint.getUpdated_at()) : Instant.now();
                boolean metSla = !resolvedAt.isAfter(deadline);

                String badgeText = metSla ? "Resolved in SLA" : "Resolved (Breached SLA)";
                String badgeColor = metSla
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";

                return new SlaInfo(targetHours, deadlineStr, 0, !metSla, true, badgeText, badgeColor);
            }

            Instant now = Instant.now();
            Duration remaining = Duration.between(now, deadline);
            long diffHours = remaining.toHours();

            if (remaining.isNegative()) {
                long overdueHours = Math.abs(diffHours);
                String overdueText = overdueHours > 24
                        ? (overdueHours / 24) + "d overdue"
                        : overdueHours + "h overdue";

                return new SlaInfo(
                        targetHours,
                        deadlineStr,
                        diffHours,
                        true,
                        false,
                        "🚨 " + overdueText,
                        "bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                );
            }

            String remainingText = diffHours > 24
                    ? (diffHours / 24) + "d left"
                    : diffHours + "h left";

            boolean isUrgent = diffHours < 8;
            String badgeColor = isUrgent
                    ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";

            return new SlaInfo(
                    targetHours,
                    deadlineStr,
                    diffHours,
                    false,
                    false,
                    "⏳ " + remainingText,
                    badgeColor
            );
        } catch (Exception e) {
            return new SlaInfo(48, "", 0, false, false, "48h SLA", "bg-slate-100 text-slate-700");
        }
    }
}
