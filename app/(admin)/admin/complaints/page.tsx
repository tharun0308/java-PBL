'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Complaint } from '@/lib/types';
import { AdminFilterBar } from '@/components/admin-filter-bar';
import { ComplaintStatusBadge, ComplaintPriorityBadge } from '@/components/complaint-status-badge';
import { formatRelativeTime } from '@/lib/utils';
import { getComplaintSla } from '@/lib/sla';
import { exportComplaintsToCsv } from '@/lib/export-csv';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  Loader2,
  Download,
  Camera,
  Star,
  Eye,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface PhotoPreviewState {
  url: string;
  title: string;
  subtitle: string;
  uploader: string;
  type: 'defect' | 'resolution';
  downloadName: string;
}

function AdminComplaintsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [photoPreview, setPhotoPreview] = useState<PhotoPreviewState | null>(null);

  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Complaint[]>({
    queryKey: ['admin-complaints', search, status, category, priority],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      if (category !== 'all') params.set('category', category);
      if (priority !== 'all') params.set('priority', priority);

      const res = await fetchWithAuth(`/api/complaints?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load complaints');
      }
      const json = await res.json();
      return json.data || [];
    },
  });

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setCategory('all');
    setPriority('all');
  };

  const handleExportCsv = () => {
    if (complaints.length === 0) {
      toast.info('No complaints to export', {
        description: 'Try adjusting your filters to show complaints first.',
      });
      return;
    }
    exportComplaintsToCsv(complaints, 'grivo-complaints-filtered.csv');
    toast.success('Filtered List Exported', {
      description: `Downloaded ${complaints.length} records as CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Facility Complaints Management
          </h1>
          <p className="text-sm text-slate mt-1">
            Review, inspect attached defect evidence, reassign technicians, and verify resolution proof.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={complaints.length === 0}
          >
            <Download className="w-4 h-4 mr-1.5 text-lavender" />
            Export CSV ({complaints.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
        priority={priority}
        onPriorityChange={setPriority}
        onReset={handleReset}
      />

      {/* Complaints Table Container */}
      <Card className="shadow-sm border-border bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-24" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
              <h3 className="text-base font-semibold text-charcoal">Failed to load complaints</h3>
              <p className="text-xs text-slate mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-12 h-12 text-slate mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">No complaints found</h3>
              <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
                No facility issues matched your current filter criteria. Try resetting or adjusting
                your search query.
              </p>
              <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent bg-surface-muted">
                    <TableHead className="w-[110px] text-slate font-semibold">ID</TableHead>
                    <TableHead className="text-slate font-semibold">Category</TableHead>
                    <TableHead className="text-slate font-semibold">Location</TableHead>
                    <TableHead className="text-slate font-semibold">Reported By</TableHead>
                    <TableHead className="text-slate font-semibold">Priority</TableHead>
                    <TableHead className="text-slate font-semibold">Status</TableHead>
                    <TableHead className="text-slate font-semibold">Attachments / Evidence</TableHead>
                    <TableHead className="text-slate font-semibold">SLA Timer</TableHead>
                    <TableHead className="text-slate font-semibold">Assigned To</TableHead>
                    <TableHead className="text-slate font-semibold">Date</TableHead>
                    <TableHead className="text-right text-slate font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => {
                    const formattedId = complaint.complaintNumber || `#GRIV-${String(complaint.complaint_number || '0000').padStart(
                      4,
                      '0'
                    )}`;
                    const sla = getComplaintSla(complaint);
                    const hasPhotos = Boolean(complaint.image_url || complaint.resolution_image_url);

                    return (
                      <TableRow
                        key={complaint.id}
                        className="hover:bg-pale-lavender border-border"
                      >
                        <TableCell className="font-mono font-bold text-lavender-strong text-xs">
                          <Link
                            href={`/admin/complaints/${complaint.id}`}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>{formattedId}</span>
                            {hasPhotos && (
                              <span title="Contains photo attachment">
                                <Camera className="w-3.5 h-3.5 text-lavender shrink-0" />
                              </span>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal bg-surface-muted px-2 py-0.5 rounded border border-border">
                            {complaint.category === 'OTHER' && (complaint.customCategory || complaint.custom_category)
                              ? `Other: ${complaint.customCategory || complaint.custom_category}`
                              : complaint.category}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[170px] truncate text-xs font-medium text-charcoal">
                          {complaint.location}
                        </TableCell>
                        <TableCell className="text-xs">
                          {complaint.user ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-charcoal">
                                {complaint.user.full_name}
                              </span>
                              <span className="text-[11px] text-slate truncate max-w-[130px]">
                                {complaint.user.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate italic">Student</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ComplaintPriorityBadge priority={complaint.priority} />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <ComplaintStatusBadge status={complaint.status} />
                            {complaint.rating && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {complaint.rating}/5
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Attachments / Evidence Column */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {((complaint.photoPaths && complaint.photoPaths.length > 0) || (complaint.photo_paths && complaint.photo_paths.length > 0)) ? (
                              (complaint.photoPaths || complaint.photo_paths || []).map((filename, pIdx) => (
                                <button
                                  key={filename}
                                  type="button"
                                  title={`Click to inspect Student Defect Photo ${pIdx + 1}`}
                                  onClick={() =>
                                    setPhotoPreview({
                                      url: `/api/complaints/photos/${filename}`,
                                      title: `Student Defect Photo ${pIdx + 1} (${formattedId})`,
                                      subtitle: `${complaint.category} • ${complaint.location}`,
                                      uploader: complaint.user ? `Reported by ${complaint.user.full_name}` : 'Reported by Student User',
                                      type: 'defect',
                                      downloadName: `defect-${complaint.complaint_number || 'photo'}-${pIdx + 1}.jpg`,
                                    })
                                  }
                                  className="relative group w-9 h-9 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-lavender transition-all cursor-pointer shrink-0 bg-surface-muted shadow-sm"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`/api/complaints/photos/${filename}`}
                                    alt="Defect thumbnail"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <Eye className="w-3.5 h-3.5" />
                                  </div>
                                </button>
                              ))
                            ) : complaint.image_url ? (
                              <button
                                type="button"
                                title="Click to inspect Student Defect Photo"
                                onClick={() =>
                                  setPhotoPreview({
                                    url: complaint.image_url!,
                                    title: `Student Defect Photo (${formattedId})`,
                                    subtitle: `${complaint.category} • ${complaint.location}`,
                                    uploader: complaint.user ? `Reported by ${complaint.user.full_name}` : 'Reported by Student User',
                                    type: 'defect',
                                    downloadName: `defect-${complaint.complaint_number}.jpg`,
                                  })
                                }
                                className="relative group w-9 h-9 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-lavender transition-all cursor-pointer shrink-0 bg-surface-muted shadow-sm"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={complaint.image_url}
                                  alt="Defect thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ) : null}

                            {complaint.resolution_image_url ? (
                              <button
                                type="button"
                                title="Click to inspect Resolution Proof Photo"
                                onClick={() =>
                                  setPhotoPreview({
                                    url: complaint.resolution_image_url!,
                                    title: `Resolution Proof Photo (${formattedId})`,
                                    subtitle: `Resolved • Assigned: ${complaint.assigned_to || 'Facilities Team'}`,
                                    uploader: 'Verified by Facilities Maintenance',
                                    type: 'resolution',
                                    downloadName: `resolution-proof-${complaint.complaint_number}.jpg`,
                                  })
                                }
                                className="relative group w-9 h-9 rounded-lg overflow-hidden border-2 border-mint hover:ring-2 hover:ring-mint-strong transition-all cursor-pointer shrink-0 bg-pale-mint shadow-sm"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={complaint.resolution_image_url}
                                  alt="Resolution thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute top-0 right-0 bg-mint-strong text-white p-0.5 rounded-bl">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ) : null}

                            {!complaint.image_url && !complaint.resolution_image_url && (
                              <span className="text-[11px] text-slate italic">No media</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${sla.badgeClass}`}>
                            {sla.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-charcoal font-medium">
                          {complaint.assigned_to || (
                            <span className="text-warning font-normal italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate whitespace-nowrap">
                          {formatRelativeTime(complaint.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/complaints/${complaint.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-lavender-strong hover:text-charcoal hover:bg-pale-lavender font-semibold text-xs"
                            >
                              Triage
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachment Inspection Modal */}
      {photoPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPhotoPreview(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-charcoal rounded-2xl overflow-hidden shadow-2xl border border-charcoal/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#374151] flex items-center justify-between text-white border-b border-[#4B5563]">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4 text-lavender" />
                  {photoPreview.title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {photoPreview.subtitle} • {photoPreview.uploader}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={photoPreview.url}
                  download={photoPreview.downloadName}
                  className="px-2.5 py-1.5 rounded-lg bg-[#4B5563] hover:bg-[#6B7280] text-slate-200 text-xs flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="p-1.5 rounded-lg hover:bg-[#4B5563] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-black/70 flex items-center justify-center max-h-[75vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview.url}
                alt={photoPreview.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminComplaintsListPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        </div>
      }
    >
      <AdminComplaintsContent />
    </Suspense>
  );
}
