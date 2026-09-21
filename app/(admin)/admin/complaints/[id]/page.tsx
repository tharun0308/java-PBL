'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComplaintWithHistory } from '@/lib/types';
import { STATUSES, Status, DEPARTMENTS } from '@/lib/constants';
import { ComplaintStatusBadge, ComplaintPriorityBadge } from '@/components/complaint-status-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { getComplaintSla } from '@/lib/sla';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  Camera,
  Upload,
  X,
  Star,
  Check,
  Eye,
} from 'lucide-react';

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [status, setStatus] = useState<Status>('Pending');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [auditNote, setAuditNote] = useState<string>('');
  const [resolutionImageUrl, setResolutionImageUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: complaint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ComplaintWithHistory>({
    queryKey: ['admin-complaint', id],
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

  // Sync state once complaint loads
  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setAssignedTo(complaint.assigned_to || '');
      setResolutionNote(complaint.resolution_note || '');
      setResolutionImageUrl(complaint.resolution_image_url || null);
    }
  }, [complaint]);

  const handleResolutionPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Proof photo must be under 3MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setResolutionImageUrl(reader.result as string);
      toast.success('Resolution proof photo attached');
    };
    reader.readAsDataURL(file);
  };

  const removeResolutionPhoto = () => {
    setResolutionImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assigned_to: assignedTo || null,
          resolution_note: resolutionNote || null,
          resolution_image_url: resolutionImageUrl,
          note: auditNote || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update complaint');
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success('Complaint Updated Successfully', {
        description: `Status changed to "${status}" and audit trail recorded.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      });
      setAuditNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-summary'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Error updating complaint';
      toast.error('Update Failed', {
        description: msg,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {error instanceof Error ? error.message : 'Unable to find the requested complaint.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/admin/complaints">
            <Button>Back to All Complaints</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedId = `#SCMS-${String(complaint.complaint_number).padStart(4, '0')}`;
  const sla = getComplaintSla(complaint);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/complaints"
          className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to All Complaints
        </Link>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Last touched: {formatRelativeTime(complaint.updated_at)}
        </span>
      </div>

      {/* Complaint Info & Admin Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Details */}
        <div className="lg:col-span-2 space-y-6">
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
                    {complaint.location}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <ComplaintPriorityBadge priority={complaint.priority} />
                  <ComplaintStatusBadge status={complaint.status} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Reporter Info Bar */}
              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                  {complaint.user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Reported by {complaint.user?.full_name || 'Student User'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{complaint.user?.email || 'N/A'}</p>
                </div>
                <div className="text-right text-slate-500 dark:text-slate-400">
                  <p className="font-medium">{formatDate(complaint.created_at)}</p>
                  <p className="text-[11px]">{formatRelativeTime(complaint.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Description
                </h4>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </div>
              </div>

              {/* Defect Photo & Current Resolution Photo */}
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
                          <span>Student Defect Photo</span>
                          <span className="text-[10px] text-slate-400">Click to enlarge</span>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={complaint.image_url}
                          alt="Defect photo"
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
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Click to enlarge</span>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={complaint.resolution_image_url}
                          alt="Resolution proof"
                          onClick={() => setSelectedPhoto(complaint.resolution_image_url || null)}
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Resolution Note */}
              {complaint.resolution_note && (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                    Current Resolution Note:
                  </p>
                  <p className="text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {complaint.resolution_note}
                  </p>
                </div>
              )}

              {/* Student Feedback & Star Rating */}
              {complaint.rating && (
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      Student Satisfaction Feedback
                    </p>
                    {complaint.rated_at && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatDate(complaint.rated_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (complaint.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-2">
                      {complaint.rating} / 5 Stars
                    </span>
                  </div>
                  {complaint.feedback_note && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-2 bg-white/70 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-100 dark:border-slate-700">
                      &quot;{complaint.feedback_note}&quot;
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail Timeline */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Audit Trail & Status History
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Immutable chronological log of all updates made to this complaint.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {!complaint.history || complaint.history.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                  No previous audit records found.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {complaint.history.map((event, index) => (
                    <div key={event.id || index} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 shadow-sm" />

                      <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-700 space-y-1">
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
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                            By {event.updater.full_name} ({event.updater.role})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Admin Triage & Action Panel */}
        <div className="space-y-6">
          <Card className="shadow-md border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 sticky top-20 transition-colors">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Administrative Actions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Update status, assign departments, attach proof, and resolve.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Update Status <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Department Assignment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Assigned Department / Team
                </label>
                <Select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
                <Input
                  className="mt-2 text-xs"
                  placeholder="Or enter custom technician / team name..."
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>

              {/* Resolution Proof Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Resolution Proof Photo (Optional)
                </label>

                {resolutionImageUrl ? (
                  <div className="relative border border-emerald-200 dark:border-emerald-800 rounded-lg overflow-hidden bg-emerald-50/40 dark:bg-emerald-950/20 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolutionImageUrl}
                      alt="Proof preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attached
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeResolutionPhoto}
                        className="h-6 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleResolutionPhotoChange}
                      className="hidden"
                      id="admin-proof-upload"
                    />
                    <label
                      htmlFor="admin-proof-upload"
                      className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/30 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Upload Repair Proof Photo
                      </span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WebP up to 3MB</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Resolution Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Resolution Note (Visible to Student)
                </label>
                <Textarea
                  rows={3}
                  placeholder="Details of fix applied, reason for rejection, or technician notes..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              {/* Audit Log Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Audit Entry Note (Internal Log)
                </label>
                <Input
                  placeholder="e.g. Dispatched plumber, awaiting spare parts"
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Log Audit Trail
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-800/90 flex items-center justify-between text-white border-b border-slate-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" />
                Full Resolution Photo Preview
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Full size preview"
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
