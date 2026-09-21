import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { ComplaintStatusBadge, ComplaintPriorityBadge } from './complaint-status-badge';
import { formatRelativeTime } from '@/lib/utils';
import { getComplaintSla } from '@/lib/sla';
import { Card, CardContent } from './ui/card';
import { MapPin, Calendar, ArrowRight, User, Image as ImageIcon, Star } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  isAdmin?: boolean;
}

export function ComplaintCard({ complaint, isAdmin = false }: ComplaintCardProps) {
  const targetHref = isAdmin
    ? `/admin/complaints/${complaint.id}`
    : `/complaints/${complaint.id}`;

  const formattedId = `#SCMS-${String(complaint.complaint_number).padStart(4, '0')}`;
  const sla = getComplaintSla(complaint);

  return (
    <Card className="hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
              {formattedId}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {complaint.category}
            </span>
            {/* SLA Badge */}
            <span
              className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sla.badgeClass}`}
            >
              {sla.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ComplaintPriorityBadge priority={complaint.priority} />
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
          {complaint.image_url && (
            <div className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photo</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[180px]">{complaint.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatRelativeTime(complaint.created_at)}</span>
            </div>
            {isAdmin && complaint.user && (
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{complaint.user.full_name}</span>
              </div>
            )}
            {complaint.rating && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{complaint.rating}/5</span>
              </div>
            )}
          </div>

          <Link
            href={targetHref}
            className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors ml-auto group"
          >
            <span>{isAdmin ? 'Manage' : 'View Details'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
