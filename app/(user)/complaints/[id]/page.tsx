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
        <Card className="bg-slate-900/60 border-white/10 p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="bg-slate-900/60 border-white/10 p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <Card className="bg-rose-500/10 border-rose-500/30 p-8">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Complaint Not Found or Access Denied</h2>
          <p className="text-xs text-rose-300 mt-1.5 mb-6 max-w-md mx-auto leading-relaxed">
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          {ticketNumber}
        </span>
      </div>

      {/* Main Complaint Overview Card */}
      <Card className="shadow-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-6 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                {categoryLabel}
              </span>
              <ComplaintPriorityBadge priority={complaint.priority} />
            </div>

            <div className="flex items-center gap-2">
              <ComplaintStatusBadge status={complaint.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-semibold text-white">{complaint.location}</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Filed: {createdDate ? formatDate(createdDate) : 'Recently'}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Issue Description</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Assignment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/40 border border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Filed by:</span>
              <span className="font-semibold text-white">{complaint.submittedByName || 'Campus Member'}</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Assigned Team:</span>
              <span className="font-semibold text-white">{assignedTo || 'Pending Staff Assignment'}</span>
            </div>
          </div>

          {/* Resolution Note Banner (If Resolved / Note exists) */}
          {resolutionNote && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Facility Resolution Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed pl-6 whitespace-pre-wrap">
                {resolutionNote}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immutable Audit Trail Timeline */}
      <Card className="shadow-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-4 border-b border-white/[0.08]">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Resolution Timeline & Audit Trail</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Immutable log of state transitions and staff notes recorded on this ticket.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {historyList.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No state transitions recorded yet. Initial status: Pending.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              {historyList.map((entry, idx) => {
                const isLatest = idx === historyList.length - 1;
                const newStatus = entry.newStatus || entry.new_status;
                const oldStatus = entry.oldStatus || entry.old_status;
                const eventDate = entry.updatedAt || entry.updated_at;

                return (
                  <div key={entry.id || idx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isLatest
                          ? 'bg-indigo-500 ring-4 ring-indigo-500/20'
                          : 'bg-slate-700'
                      }`}
                    />

                    {/* Event Content Box */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.08] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {oldStatus && (
                            <>
                              <ComplaintStatusBadge status={oldStatus} showIcon={false} className="text-[10px] py-0 px-2" />
                              <ChevronRight className="w-3 h-3 text-slate-500" />
                            </>
                          )}
                          <ComplaintStatusBadge status={newStatus} showIcon={false} className="text-[10px] py-0 px-2" />
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {eventDate ? formatDate(eventDate) : ''}
                        </span>
                      </div>

                      {entry.note && (
                        <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
                          {entry.note}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Action by: <strong className="text-slate-300">{entry.updatedByName || 'System Auto-Logger'}</strong></span>
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
