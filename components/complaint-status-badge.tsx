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
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  const renderIcon = () => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />;
      case 'In Progress':
        return <Loader2 className="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />;
      case 'Resolved':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />;
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
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

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
