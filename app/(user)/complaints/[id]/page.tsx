'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Complaint, ComplaintHistory } from '@/lib/types';
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/lib/constants';
import { ComplaintStatusBadge, ComplaintPriorityBadge } from '@/components/complaint-status-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  Layers,
  History,
  Check,
  XCircle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: complaint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Complaint>({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const res = await fetch(`/api/complaints/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load complaint details');
      }
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-white border-border p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="bg-white border-border p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <Card className="bg-pale-danger border-[#FECDD3] p-8">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <h2 className="text-xl font-bold text-charcoal">Complaint Not Found or Access Denied</h2>
          <p className="text-xs text-danger mt-1.5 mb-6 max-w-md mx-auto leading-relaxed">
            {error instanceof Error ? error.message : 'You do not have permission to view this ticket.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="glow" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const ticketNumber = complaint.complaintNumber || `#SCMS-${complaint.complaint_number || ''}`;
  const categoryLabel = CATEGORY_LABELS[complaint.category] || complaint.category;
  const historyList: ComplaintHistory[] = complaint.history || [];
  const resolutionNote = complaint.resolutionNote || complaint.resolution_note;
  const assignedTo = complaint.assignedToName || complaint.assigned_to;
  const createdDate = complaint.createdAt || complaint.created_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate hover:text-lavender transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-pale-lavender text-lavender-strong border border-lavender/30">
          {ticketNumber}
        </span>
      </div>

      {/* Main Complaint Overview Card */}
      <Card className="shadow-md border-border bg-white">
        <CardHeader className="space-y-3 pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg sm:text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-lavender" />
                {categoryLabel}
              </span>
              <ComplaintPriorityBadge priority={complaint.priority} />
            </div>

            <div className="flex items-center gap-2">
              <ComplaintStatusBadge status={complaint.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-charcoal pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lavender shrink-0" />
              <span className="font-semibold text-charcoal">{complaint.location}</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Calendar className="w-4 h-4 text-slate shrink-0" />
              <span className="text-slate">Filed: {createdDate ? formatDate(createdDate) : 'Recently'}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-lavender" />
              <span>Full Issue Description</span>
            </h3>
            <div className="p-4 rounded-xl bg-surface-muted border border-border text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Assignment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-muted border border-border text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate" />
              <span className="text-slate">Filed by:</span>
              <span className="font-semibold text-charcoal">{complaint.submittedByName || 'Campus Member'}</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <ShieldCheck className="w-4 h-4 text-lavender" />
              <span className="text-slate">Assigned Team:</span>
              <span className="font-semibold text-charcoal">{assignedTo || 'Pending Staff Assignment'}</span>
            </div>
          </div>

          {/* Resolution Note Banner (If Resolved / Note exists) */}
          {resolutionNote && (
            <div className="p-4 rounded-xl bg-pale-mint border border-mint/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-mint-strong">
                <CheckCircle2 className="w-4 h-4" />
                <span>Facility Resolution Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-mint-strong leading-relaxed pl-6 whitespace-pre-wrap">
                {resolutionNote}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immutable Audit Trail Timeline */}
      <Card className="shadow-md border-border bg-white">
        <CardHeader className="space-y-1 pb-4 border-b border-border">
          <CardTitle className="text-lg font-bold text-charcoal flex items-center gap-2">
            <History className="w-4 h-4 text-lavender" />
            <span>Resolution Timeline & Audit Trail</span>
          </CardTitle>
          <CardDescription className="text-slate text-xs">
            Immutable log of state transitions and staff notes recorded on this ticket.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {historyList.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate">
              No state transitions recorded yet. Initial status: Pending.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {historyList.map((entry, idx) => {
                const isLatest = idx === historyList.length - 1;
                const newStatus = entry.newStatus || entry.new_status;
                const oldStatus = entry.oldStatus || entry.old_status;
                const eventDate = entry.updatedAt || entry.updated_at;

                return (
                  <div key={entry.id || idx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isLatest
                          ? 'bg-lavender ring-4 ring-lavender/20'
                          : 'bg-slate'
                      }`}
                    />

                    {/* Event Content Box */}
                    <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {oldStatus && (
                            <>
                              <ComplaintStatusBadge status={oldStatus} showIcon={false} className="text-[10px] py-0 px-2" />
                              <ChevronRight className="w-3 h-3 text-slate" />
                            </>
                          )}
                          <ComplaintStatusBadge status={newStatus} showIcon={false} className="text-[10px] py-0 px-2" />
                        </div>
                        <span className="text-[11px] text-slate font-mono">
                          {eventDate ? formatDate(eventDate) : ''}
                        </span>
                      </div>

                      {entry.note && (
                        <p className="text-xs text-charcoal leading-relaxed pl-0.5">
                          {entry.note}
                        </p>
                      )}

                      <div className="text-[11px] text-slate flex items-center gap-1.5 pt-1 border-t border-border">
                        <User className="w-3 h-3 text-slate" />
                        <span>Action by: <strong className="text-charcoal">{entry.updatedByName || 'System Auto-Logger'}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
