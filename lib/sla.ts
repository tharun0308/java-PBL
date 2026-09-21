import { Complaint } from './types';
import { Priority } from './constants';

export interface SlaInfo {
  isOverdue: boolean;
  isCompleted: boolean;
  label: string;
  deadline: Date;
  badgeClass: string;
}

export function getSlaDurationHours(priority: Priority): number {
  switch (priority) {
    case 'High':
      return 24; // 24 hours
    case 'Medium':
      return 48; // 48 hours
    case 'Low':
      return 120; // 5 days (120 hours)
    default:
      return 48;
  }
}

export function getComplaintSla(complaint: Pick<Complaint, 'priority' | 'status' | 'created_at' | 'updated_at'>): SlaInfo {
  const created = new Date(complaint.created_at).getTime();
  const durationMs = getSlaDurationHours(complaint.priority) * 3600 * 1000;
  const deadlineMs = created + durationMs;
  const deadline = new Date(deadlineMs);

  const isCompleted = complaint.status === 'Resolved' || complaint.status === 'Rejected';

  if (isCompleted) {
    const resolvedAt = new Date(complaint.updated_at).getTime();
    const metSla = resolvedAt <= deadlineMs;
    return {
      isOverdue: !metSla,
      isCompleted: true,
      label: metSla ? 'Resolved in SLA' : 'Resolved (Breached SLA)',
      deadline,
      badgeClass: metSla
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
        : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
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
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
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
      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  };
}
