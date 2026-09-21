export const CATEGORIES = [
  'Electrical',
  'Water Supply',
  'Cleanliness',
  'Hostel Maintenance',
  'Internet/IT',
  'Laboratory Equipment',
  'Infrastructure',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'] as const;
export type Status = (typeof STATUSES)[number];

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; badgeClass: string; borderClass: string; bgClass: string; textClass: string }
> = {
  Pending: {
    label: 'Pending',
    color: '#eab308',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100/80',
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
  },
  'In Progress': {
    label: 'In Progress',
    color: '#3b82f6',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80',
    borderClass: 'border-blue-400',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
  },
  Resolved: {
    label: 'Resolved',
    color: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80',
    borderClass: 'border-emerald-400',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
  },
  Rejected: {
    label: 'Rejected',
    color: '#ef4444',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100/80',
    borderClass: 'border-rose-400',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string }
> = {
  Low: {
    label: 'Low Priority',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  Medium: {
    label: 'Medium Priority',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  High: {
    label: 'High Priority',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const DEPARTMENTS = [
  'Maintenance - Electrical Team',
  'Plumbing Dept',
  'Housekeeping Supervisor',
  'Carpentry Unit',
  'Campus IT Network Cell',
  'Lab Safety & Instrumentation',
  'Estate Office - Civil Wing',
  'Security & Transport',
  'General Administration',
] as const;
