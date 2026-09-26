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
  Download,
  ExternalLink,
} from 'lucide-react';

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [status, setStatus] = useState<Status>('PENDING');
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
        <Card className="p-6 bg-white border-border">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6 bg-white border-border">
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-charcoal">Complaint Not Found</h2>
        <p className="text-sm text-slate mt-2">
          {error instanceof Error ? error.message : 'Unable to find the requested complaint.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/admin/complaints">
            <Button variant="glow">Back to All Complaints</Button>
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
          className="inline-flex items-center text-sm font-medium text-slate hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to All Complaints
        </Link>
        <span className="text-xs text-slate">
          Last touched: {formatRelativeTime(complaint.updated_at)}
        </span>
      </div>

      {/* Complaint Info & Admin Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="border-b border-border pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-lavender-strong bg-pale-lavender px-2.5 py-0.5 rounded border border-lavender/30">
                      {formattedId}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate bg-surface-muted px-2 py-0.5 rounded">
                      {complaint.category}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sla.badgeClass}`}>
                      {sla.label}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-charcoal pt-2">
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
              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-muted border border-border text-xs">
                <div className="w-8 h-8 rounded-full bg-pale-lavender text-lavender-strong flex items-center justify-center font-bold">
                  {complaint.user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">
                    Reported by {complaint.user?.full_name || 'Student User'}
                  </p>
                  <p className="text-slate">{complaint.user?.email || 'N/A'}</p>
                </div>
                <div className="text-right text-slate">
                  <p className="font-medium">{formatDate(complaint.created_at)}</p>
                  <p className="text-[11px]">{formatRelativeTime(complaint.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-lavender" />
                  Description
                </h4>
                <div className="p-4 rounded-lg bg-surface-muted border border-border text-sm text-charcoal whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </div>
              </div>

              {/* Visual Evidence & Attachments Panel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-lavender" />
                    Attached Evidence & Documentation
                  </h4>
                  {(complaint.image_url || complaint.resolution_image_url) && (
                    <span className="text-[11px] font-medium text-slate">
                      {[complaint.image_url && '1 Defect Photo', complaint.resolution_image_url && '1 Proof Photo']
                        .filter(Boolean)
                        .join(' • ')}
                    </span>
                  )}
                </div>

                {!complaint.image_url && !complaint.resolution_image_url ? (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-surface-muted/50 text-center text-xs text-slate">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate" />
                    No photos or media attachments were uploaded for this complaint.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complaint.image_url && (
                      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="p-2.5 bg-surface-muted text-xs font-semibold text-charcoal border-b border-border flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Camera className="w-3.5 h-3.5 text-lavender" />
                            Student Defect Photo
                          </span>
                          <span className="text-[10px] text-slate">
                            By {complaint.user?.full_name || 'Student'}
                          </span>
                        </div>
                        <div className="relative group bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={complaint.image_url}
                            alt="Student Defect Photo"
                            onClick={() => setSelectedPhoto(complaint.image_url || null)}
                            className="w-full h-52 object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPhoto(complaint.image_url || null)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/90 text-charcoal text-xs font-semibold flex items-center gap-1 shadow hover:bg-white transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                            <a
                              href={complaint.image_url}
                              download={`defect-${complaint.complaint_number}.jpg`}
                              className="px-2.5 py-1.5 rounded-lg bg-lavender/90 text-white text-xs font-semibold flex items-center gap-1 shadow hover:bg-lavender transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Save
                            </a>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white flex items-center justify-between text-[11px] text-slate border-t border-border">
                          <span>Verified submission file</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(complaint.image_url || null)}
                            className="text-lavender-strong font-semibold hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Zoom in
                          </button>
                        </div>
                      </div>
                    )}

                    {complaint.resolution_image_url && (
                      <div className="border border-mint/30 rounded-xl overflow-hidden bg-pale-mint/30 shadow-sm">
                        <div className="p-2.5 bg-pale-mint text-xs font-semibold text-mint-strong border-b border-mint/30 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Check className="w-3.5 h-3.5 text-mint-strong" />
                            Resolution Proof Photo
                          </span>
                          <span className="text-[10px] text-mint-strong">
                            Facilities Verified
                          </span>
                        </div>
                        <div className="relative group bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={complaint.resolution_image_url}
                            alt="Resolution Proof"
                            onClick={() => setSelectedPhoto(complaint.resolution_image_url || null)}
                            className="w-full h-52 object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPhoto(complaint.resolution_image_url || null)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/90 text-charcoal text-xs font-semibold flex items-center gap-1 shadow hover:bg-white transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                            <a
                              href={complaint.resolution_image_url}
                              download={`resolution-proof-${complaint.complaint_number}.jpg`}
                              className="px-2.5 py-1.5 rounded-lg bg-mint-strong/90 text-white text-xs font-semibold flex items-center gap-1 shadow hover:bg-mint-strong transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Save
                            </a>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white flex items-center justify-between text-[11px] text-mint-strong border-t border-mint/20">
                          <span>Proof of completed repair</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(complaint.resolution_image_url || null)}
                            className="font-semibold hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Zoom in
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current Resolution Note */}
              {complaint.resolution_note && (
                <div className="p-4 rounded-lg bg-pale-mint border border-mint/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-mint-strong mb-1">
                    Current Resolution Note:
                  </p>
                  <p className="text-sm text-mint-strong leading-relaxed">
                    {complaint.resolution_note}
                  </p>
                </div>
              )}

              {/* Student Feedback & Star Rating */}
              {complaint.rating && (
                <div className="p-4 rounded-xl bg-pale-warning border border-[#FDE68A]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      Student Satisfaction Feedback
                    </p>
                    {complaint.rated_at && (
                      <span className="text-[11px] text-slate">
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
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-bold text-charcoal ml-2">
                      {complaint.rating} / 5 Stars
                    </span>
                  </div>
                  {complaint.feedback_note && (
                    <p className="text-xs text-charcoal italic mt-2 bg-white/70 p-3 rounded-lg border border-[#FDE68A]">
                      &quot;{complaint.feedback_note}&quot;
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail Timeline */}
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
                <Clock className="w-4 h-4 text-lavender" />
                Audit Trail & Status History
              </CardTitle>
              <CardDescription className="text-xs text-slate">
                Immutable chronological log of all updates made to this complaint.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {!complaint.history || complaint.history.length === 0 ? (
                <p className="text-xs text-slate py-4 text-center">
                  No previous audit records found.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {complaint.history.map((event, index) => (
                    <div key={event.id || index} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-lavender shadow-sm" />

                      <div className="bg-surface-muted rounded-lg p-3.5 border border-border space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ComplaintStatusBadge status={event.new_status || event.newStatus || 'PENDING'} showIcon={false} />
                            {(event.old_status || event.oldStatus) && (
                              <span className="text-xs text-slate">
                                (from {event.old_status || event.oldStatus})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate">
                            {formatDate(event.updated_at)}
                          </span>
                        </div>

                        {event.note && (
                          <p className="text-xs text-charcoal font-medium pt-1">
                            {event.note}
                          </p>
                        )}

                        {event.updater && (
                          <p className="text-[11px] text-slate flex items-center gap-1 pt-1">
                            <ShieldCheck className="w-3 h-3 text-lavender" />
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
          <Card className="shadow-md border-lavender/30 bg-white sticky top-20">
            <CardHeader className="border-b border-border bg-pale-lavender/40 pb-4">
              <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-lavender" />
                Administrative Actions
              </CardTitle>
              <CardDescription className="text-xs text-slate">
                Update status, assign departments, attach proof, and resolve.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Update Status <span className="text-danger">*</span>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-lavender" />
                  Resolution Proof Photo (Optional)
                </label>

                {resolutionImageUrl ? (
                  <div className="relative border border-mint/30 rounded-lg overflow-hidden bg-pale-mint/30 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolutionImageUrl}
                      alt="Proof preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] font-medium text-mint-strong flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attached
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeResolutionPhoto}
                        className="h-6 px-2 text-xs text-danger hover:bg-pale-danger"
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
                      className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-border hover:border-lavender rounded-lg cursor-pointer bg-surface-muted hover:bg-pale-lavender/30 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate mb-1" />
                      <span className="text-xs font-semibold text-lavender-strong">
                        Upload Repair Proof Photo
                      </span>
                      <span className="text-[10px] text-slate">PNG, JPG, WebP up to 3MB</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Resolution Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
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
                  variant="glow"
                  className="w-full"
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

      {/* Photo Zoom Modal — intentionally dark for media lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-charcoal rounded-xl overflow-hidden shadow-2xl border border-[#374151]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-[#374151] flex items-center justify-between text-white border-b border-[#4B5563]">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-lavender" />
                Full Resolution Evidence Preview ({formattedId})
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPhoto}
                  download={`evidence-${complaint.complaint_number}.jpg`}
                  className="px-2.5 py-1 rounded-lg bg-[#4B5563] hover:bg-[#6B7280] text-slate-200 text-xs flex items-center gap-1 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1 rounded-full hover:bg-[#4B5563] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
