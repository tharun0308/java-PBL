import { Complaint } from './types';
import { Priority, Status } from './constants';

export interface SlaInfo {
  isOverdue: boolean;
  isCompleted: boolean;
  label: string;
  deadline: Date;
  badgeClass: string;
}

export function getSlaDurationHours(priority: Priority): number {
  switch (priority) {
    case 'HIGH':
      return 24; // 24 hours
    case 'MEDIUM':
      return 48; // 48 hours
    case 'LOW':
      return 120; // 5 days (120 hours)
    default:
      return 48;
  }
}

export function getComplaintSla(complaint: Partial<Complaint> & { priority: Priority; status: Status }): SlaInfo {
  const createdDateStr = complaint.createdAt || complaint.created_at || new Date().toISOString();
  const created = new Date(createdDateStr).getTime();
  const durationMs = getSlaDurationHours(complaint.priority) * 3600 * 1000;
  const deadlineMs = created + durationMs;
  const deadline = new Date(deadlineMs);

  const isCompleted = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED';

  if (isCompleted) {
    const resolvedDateStr = complaint.updatedAt || complaint.updated_at || new Date().toISOString();
    const resolvedAt = new Date(resolvedDateStr).getTime();
    const metSla = resolvedAt <= deadlineMs;
    return {
      isOverdue: !metSla,
      isCompleted: true,
      label: metSla ? 'Resolved in SLA' : 'Resolved (Breached SLA)',
      deadline,
      badgeClass: metSla
        ? 'bg-mint-soft text-mint-strong border-[#BBF7D0]'
        : 'bg-warning-soft text-warning border-[#FDE68A]',
    };
  }

  const now = Date.now();
  const diffMs = deadlineMs - now;

  if (diffMs <= 0) {
    const overdueHours = Math.floor(Math.abs(diffMs) / 3600000);
    const overdueText = overdueHours > 24
      ? `${Math.floor(overdueHours / 24)}d overdue`
      : `${overdueHours}h overdue`;

    return {
      isOverdue: true,
      isCompleted: false,
      label: `🚨 ${overdueText}`,
      deadline,
      badgeClass: 'bg-danger-soft text-danger border-[#FECDD3] animate-pulse font-semibold',
    };
  }

  const remainingHours = Math.floor(diffMs / 3600000);
  const remainingText = remainingHours > 24
    ? `${Math.floor(remainingHours / 24)}d left`
    : `${remainingHours}h left`;

  const isUrgent = remainingHours < 8;

  return {
    isOverdue: false,
    isCompleted: false,
    label: `⏳ ${remainingText}`,
    deadline,
    badgeClass: isUrgent
      ? 'bg-warning-soft text-warning border-[#FDE68A]'
      : 'bg-surface-muted text-slate border-border',
  };
}
