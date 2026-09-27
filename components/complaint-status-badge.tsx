import React from 'react';
import { STATUS_CONFIG, PRIORITY_CONFIG, Status, Priority } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Clock, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ComplaintStatusBadgeProps {
  status: Status;
  className?: string;
  showIcon?: boolean;
}

export function ComplaintStatusBadge({
  status,
  className,
  showIcon = true,
}: ComplaintStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const renderIcon = () => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />;
      case 'IN_PROGRESS':
        return <Loader2 className="w-3.5 h-3.5 mr-1 text-blue-500 animate-spin" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.badgeClass,
        className
      )}
    >
      {showIcon && renderIcon()}
      {config.label}
    </span>
  );
}

interface ComplaintPriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function ComplaintPriorityBadge({
  priority,
  className,
}: ComplaintPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        config.badgeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface ComplaintEscalationBadgeProps {
  escalationLevel?: number;
  escalatedTo?: string | null;
  className?: string;
}

export function ComplaintEscalationBadge({
  escalationLevel = 0,
  escalatedTo,
  className,
}: ComplaintEscalationBadgeProps) {
  if (!escalationLevel || escalationLevel <= 0) return null;

  const isL2 = escalationLevel >= 2;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border animate-pulse',
        isL2
          ? 'bg-rose-100 text-rose-800 border-rose-300'
          : 'bg-amber-100 text-amber-800 border-amber-300',
        className
      )}
      title={escalatedTo ? `Escalated to: ${escalatedTo}` : `Level ${escalationLevel} Escalation`}
    >
      <span>🚨</span>
      <span>{isL2 ? 'Escalated L2 (Principal)' : 'Escalated L1 (HOD)'}</span>
    </span>
  );
}
