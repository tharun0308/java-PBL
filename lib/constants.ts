export const ROLES = ['STUDENT_TEACHER', 'STAFF_ADMIN', 'MAIN_ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ADMIN_STATUSES = ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] as const;
export type StaffAdminStatus = (typeof STAFF_ADMIN_STATUSES)[number];

export const CATEGORIES = [
  'ELECTRICAL',
  'WATER_SUPPLY',
  'CLEANLINESS',
  'HOSTEL_MAINTENANCE',
  'INTERNET_IT',
  'LABORATORY_EQUIPMENT',
  'INFRASTRUCTURE',
  'OTHER',
] as const;
export type Category = (typeof CATEGORIES)[number];
export const DEPARTMENTS = CATEGORIES;
export type Department = Category;

export const CATEGORY_LABELS: Record<Category, string> = {
  ELECTRICAL: 'Electrical',
  WATER_SUPPLY: 'Water Supply',
  CLEANLINESS: 'Cleanliness',
  HOSTEL_MAINTENANCE: 'Hostel Maintenance',
  INTERNET_IT: 'Internet/IT',
  LABORATORY_EQUIPMENT: 'Laboratory Equipment',
  INFRASTRUCTURE: 'Infrastructure',
  OTHER: 'Other',
};

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; badgeClass: string; borderClass: string; bgClass: string; textClass: string }
> = {
  PENDING: {
    label: 'Pending',
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/5',
    textClass: 'text-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#3b82f6',
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
    borderClass: 'border-blue-500/30',
    bgClass: 'bg-blue-500/5',
    textClass: 'text-blue-500',
  },
  RESOLVED: {
    label: 'Resolved',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/5',
    textClass: 'text-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#ef4444',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20',
    borderClass: 'border-rose-500/30',
    bgClass: 'bg-rose-500/5',
    textClass: 'text-rose-500',
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string }
> = {
  LOW: {
    label: 'Low Priority',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  MEDIUM: {
    label: 'Medium Priority',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  HIGH: {
    label: 'High Priority',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
};
