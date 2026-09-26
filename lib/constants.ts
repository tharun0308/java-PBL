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
    color: '#B45309',
    badgeClass: 'bg-warning-soft text-warning border-[#FDE68A] hover:bg-warning-soft/80',
    borderClass: 'border-[#FDE68A]',
    bgClass: 'bg-warning-soft',
    textClass: 'text-warning',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#6D28D9',
    badgeClass: 'bg-lavender-soft text-lavender-strong border-[#DDD6FE] hover:bg-lavender-soft/80',
    borderClass: 'border-[#DDD6FE]',
    bgClass: 'bg-lavender-soft',
    textClass: 'text-lavender-strong',
  },
  RESOLVED: {
    label: 'Resolved',
    color: '#15803D',
    badgeClass: 'bg-mint-soft text-mint-strong border-[#BBF7D0] hover:bg-mint-soft/80',
    borderClass: 'border-[#BBF7D0]',
    bgClass: 'bg-mint-soft',
    textClass: 'text-mint-strong',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#E11D48',
    badgeClass: 'bg-danger-soft text-danger border-[#FECDD3] hover:bg-danger-soft/80',
    borderClass: 'border-[#FECDD3]',
    bgClass: 'bg-danger-soft',
    textClass: 'text-danger',
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string }
> = {
  LOW: {
    label: 'Low Priority',
    badgeClass: 'bg-surface-muted text-slate border-border',
  },
  MEDIUM: {
    label: 'Medium Priority',
    badgeClass: 'bg-warning-soft text-warning border-[#FDE68A]',
  },
  HIGH: {
    label: 'High Priority',
    badgeClass: 'bg-danger-soft text-danger border-[#FECDD3]',
  },
};
