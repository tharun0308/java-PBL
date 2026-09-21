'use client';

import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { ComplaintPriorityBadge } from './complaint-status-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { getComplaintSla } from '@/lib/sla';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Camera,
  Star,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface ComplaintTrackerCardProps {
  complaint: Complaint;
  onOpenPhoto?: (url: string, title: string) => void;
}

export function ComplaintTrackerCard({ complaint, onOpenPhoto }: ComplaintTrackerCardProps) {
  const formattedId = `#SCMS-${String(complaint.complaint_number).padStart(4, '0')}`;
  const sla = getComplaintSla(complaint);

  // Determine stage (1: Submitted, 2: Assigned, 3: In Progress, 4: Resolved, -1: Rejected)
  let stage = 1;
  if (complaint.status === 'Rejected') {
    stage = -1;
  } else if (complaint.status === 'Resolved') {
    stage = 4;
  } else if (complaint.status === 'In Progress') {
    stage = 3;
  } else if (complaint.assigned_to) {
    stage = 2;
  }

  const steps = [
    { number: 1, name: 'Submitted', desc: formatRelativeTime(complaint.created_at) },
    { number: 2, name: 'Assigned', desc: complaint.assigned_to ? complaint.assigned_to : 'Pending team' },
    { number: 3, name: 'In Progress', desc: stage >= 3 ? 'Active repair' : 'Waiting dispatch' },
    { number: 4, name: 'Resolved', desc: stage === 4 ? 'Verified complete' : 'Resolution pending' },
  ];

  return (
    <Card className="hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Top Header: ID, Category, SLA badge, Priority */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
              {formattedId}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              {complaint.category}
            </span>
            <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sla.badgeClass}`}>
              {sla.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ComplaintPriorityBadge priority={complaint.priority} />
          </div>
        </div>

        {/* Location & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{complaint.location}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* 4-Stage Visual Progress Tracker */}
        <div className="pt-2">
          {stage === -1 ? (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                  Complaint Rejected
                </p>
                <p className="text-xs text-rose-800 dark:text-rose-300/90 mt-0.5">
                  {complaint.resolution_note || 'This issue cannot be serviced under campus maintenance bylaws.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Live Resolution Progress Tracker
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Stage {stage} of 4: {steps[stage - 1]?.name}
                </span>
              </div>

              {/* Stepper Bar */}
              <div className="relative flex items-center justify-between">
                {/* Connecting background progress line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0" />
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 dark:bg-indigo-500 -z-0 transition-all duration-500"
                  style={{ width: `${((stage - 1) / 3) * 100}%` }}
                />

                {steps.map((step) => {
                  const isDone = stage > step.number;
                  const isCurrent = stage === step.number;

                  return (
                    <div key={step.number} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/60 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                      </div>
                      <p
                        className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                          isCurrent
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isDone
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[80px] text-center truncate">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Photos & Ratings Row */}
        {(complaint.image_url || complaint.resolution_image_url || complaint.rating || (complaint.status === 'Resolved' && !complaint.rating)) && (
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            {/* Attached Photos Preview */}
            <div className="flex items-center gap-2">
              {complaint.image_url && (
                <button
                  type="button"
                  onClick={() => onOpenPhoto?.(complaint.image_url!, `Student Defect Photo (${formattedId})`)}
                  className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors cursor-pointer group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={complaint.image_url}
                    alt="Defect"
                    className="w-7 h-7 rounded object-cover"
                  />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-indigo-500" />
                    Defect Photo
                  </span>
                </button>
              )}

              {complaint.resolution_image_url && (
                <button
                  type="button"
                  onClick={() => onOpenPhoto?.(complaint.resolution_image_url!, `Resolution Proof Photo (${formattedId})`)}
                  className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 transition-colors cursor-pointer group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={complaint.resolution_image_url}
                    alt="Resolution Proof"
                    className="w-7 h-7 rounded object-cover"
                  />
                  <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Repair Proof
                  </span>
                </button>
              )}
            </div>

            {/* Rating Section */}
            {complaint.rating ? (
              <div className="flex items-center gap-1.5 text-amber-500 font-bold ml-auto">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= (complaint.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-700 dark:text-slate-300">
                  {complaint.rating}/5 Rated
                </span>
              </div>
            ) : complaint.status === 'Resolved' ? (
              <Link href={`/complaints/${complaint.id}`} className="ml-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 font-semibold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Rate this Resolution
                </span>
              </Link>
            ) : null}
          </div>
        )}

        {/* Footer Meta & Track Link */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(complaint.created_at)}
            </span>
            {complaint.assigned_to && (
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                {complaint.assigned_to}
              </span>
            )}
          </div>

          <Link
            href={`/complaints/${complaint.id}`}
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors ml-auto group"
          >
            <span>View Full Details & Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
