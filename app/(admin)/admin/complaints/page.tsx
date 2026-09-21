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
} from 'lucide-react';
import { toast } from 'sonner';

function AdminComplaintsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');

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

      const res = await fetch(`/api/complaints?${params.toString()}`);
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
    exportComplaintsToCsv(complaints, 'scms-complaints-filtered.csv');
    toast.success('Filtered List Exported', {
      description: `Downloaded ${complaints.length} records as CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Facility Complaints Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, filter, reassign, triage SLA timers, and resolve issues reported across campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={complaints.length === 0}
            className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
            Export CSV ({complaints.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
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
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors">
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
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Failed to load complaints</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No complaints found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
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
                  <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[110px]">ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA Timer</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => {
                    const formattedId = `#SCMS-${String(complaint.complaint_number).padStart(
                      4,
                      '0'
                    )}`;
                    const sla = getComplaintSla(complaint);
                    const hasPhotos = Boolean(complaint.image_url || complaint.resolution_image_url);

                    return (
                      <TableRow
                        key={complaint.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800"
                      >
                        <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{formattedId}</span>
                            {hasPhotos && (
                              <span title="Contains photo attachment">
                                <Camera className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {complaint.category}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[170px] truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                          {complaint.location}
                        </TableCell>
                        <TableCell className="text-xs">
                          {complaint.user ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {complaint.user.full_name}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                {complaint.user.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Student</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ComplaintPriorityBadge priority={complaint.priority} />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <ComplaintStatusBadge status={complaint.status} />
                            {complaint.rating && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {complaint.rating}/5
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${sla.badgeClass}`}>
                            {sla.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {complaint.assigned_to || (
                            <span className="text-amber-600 dark:text-amber-400 font-normal italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(complaint.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/complaints/${complaint.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-semibold text-xs"
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
