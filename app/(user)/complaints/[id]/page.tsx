'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComplaintWithHistory } from '@/lib/types';
import { ComplaintStatusBadge, ComplaintPriorityBadge } from '@/components/complaint-status-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { getComplaintSla } from '@/lib/sla';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
  Camera,
  Star,
  Loader2,
  Check,
} from 'lucide-react';

export default function UserComplaintDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [ratingValue, setRatingValue] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const {
    data: complaint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ComplaintWithHistory>({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const res = await fetch(`/api/complaints/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load complaint');
      }
      const json = await res.json();
      return json.data;
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/complaints/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingValue,
          feedback_note: feedbackNote,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit feedback');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Thank you for rating!', {
        description: 'Your feedback helps facilities teams improve their services.',
      });
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
    },
    onError: (err: unknown) => {
      toast.error('Feedback submission failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-20 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-36 mb-4" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {error instanceof Error ? error.message : 'The requested complaint could not be loaded.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/dashboard">
            <Button>Back to My Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedId = `#SCMS-${String(complaint.complaint_number).padStart(4, '0')}`;
  const sla = getComplaintSla(complaint);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to My Complaints
        </Link>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: {formatRelativeTime(complaint.updated_at)}
        </span>
      </div>

      {/* Main Complaint Overview Card */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                  {formattedId}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {complaint.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sla.badgeClass}`}>
                  {sla.label}
                </span>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white pt-2">
                Facility Issue at {complaint.location}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <ComplaintPriorityBadge priority={complaint.priority} />
              <ComplaintStatusBadge status={complaint.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Location</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{complaint.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Submitted On</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(complaint.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Assigned Department</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {complaint.assigned_to || 'Pending Assignment'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Issue Description
            </h4>
            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Photo Gallery (Defect & Resolution Proof) */}
          {(complaint.image_url || complaint.resolution_image_url) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-500" />
                Photo Documentation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaint.image_url && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span>Reported Defect Photo</span>
                      <span className="text-[10px] text-slate-400">By Student</span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={complaint.image_url}
                      alt="Defect"
                      onClick={() => setSelectedPhoto(complaint.image_url || null)}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}

                {complaint.resolution_image_url && (
                  <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="p-2 bg-emerald-100/70 dark:bg-emerald-900/40 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Resolution Proof Photo
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">By Facilities</span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={complaint.resolution_image_url}
                      alt="Resolution Proof"
                      onClick={() => setSelectedPhoto(complaint.resolution_image_url || null)}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution Note (if present) */}
          {complaint.resolution_note && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Administrator Resolution Note
              </div>
              <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                {complaint.resolution_note}
              </p>
            </div>
          )}

          {/* Student Feedback & Star Rating Section */}
          {complaint.status === 'Resolved' && (
            <div className="pt-2">
              {complaint.rating ? (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Your Resolution Feedback
                  </p>
                  <div className="flex items-center gap-1.5 text-amber-500 my-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (complaint.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">
                      {complaint.rating} out of 5 stars
                    </span>
                  </div>
                  {complaint.feedback_note && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1">
                      &quot;{complaint.feedback_note}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      Rate this Resolution
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                      How satisfied are you with the facility repair?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRatingValue(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || ratingValue)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-2">
                        {ratingValue} / 5 Stars
                      </span>
                    </div>

                    <Textarea
                      rows={2}
                      placeholder="Optional feedback comment (e.g. 'Technician arrived quickly, clean work')..."
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      className="text-xs"
                    />

                    <Button
                      size="sm"
                      onClick={() => feedbackMutation.mutate()}
                      disabled={feedbackMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                    >
                      {feedbackMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail Timeline */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Complaint Resolution Timeline
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Chronological audit trail of status updates and administrative actions.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {!complaint.history || complaint.history.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No status changes recorded yet.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {complaint.history.map((event, index) => (
                <div key={event.id || index} className="relative group">
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 shadow-sm" />

                  <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ComplaintStatusBadge status={event.new_status} showIcon={false} />
                        {event.old_status && (
                          <span className="text-xs text-slate-400">
                            (from {event.old_status})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(event.updated_at)}
                      </span>
                    </div>

                    {event.note && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium pt-1">
                        {event.note}
                      </p>
                    )}

                    {event.updater && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                        Updated by {event.updater.full_name} ({event.updater.role})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Zoom for Photos */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPhoto} alt="Zoomed" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
            <p className="text-center text-xs text-white mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
