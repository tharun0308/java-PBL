'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Complaint } from '@/lib/types';
import { STATUSES, Status } from '@/lib/constants';
import { ComplaintCard } from '@/components/complaint-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, ClipboardList, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export default function UserDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Complaint[]>({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const res = await fetch('/api/complaints');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch complaints');
      }
      const json = await res.json();
      return json.data || [];
    },
  });

  const filteredComplaints = complaints.filter((c) => {
    if (selectedStatus === 'all') return true;
    return c.status === selectedStatus;
  });

  const statusCounts: Record<string, number> = {
    all: complaints.length,
    Pending: complaints.filter((c) => c.status === 'Pending').length,
    'In Progress': complaints.filter((c) => c.status === 'In Progress').length,
    Resolved: complaints.filter((c) => c.status === 'Resolved').length,
    Rejected: complaints.filter((c) => c.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Registered Complaints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and monitor the resolution progress of your campus facility issues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/complaints/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              File New Complaint
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <button
          type="button"
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            selectedStatus === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All ({statusCounts.all})
        </button>
        {STATUSES.map((status: Status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              selectedStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {/* Content State Handling */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between items-center pt-3 border-t">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-rose-200 bg-rose-50/50 p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">Failed to load complaints</h3>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
            {error instanceof Error ? error.message : 'Unknown error occurred.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Try Again
          </Button>
        </Card>
      ) : filteredComplaints.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 bg-white p-12 text-center">
          <CardContent className="space-y-4 p-0">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedStatus === 'all'
                  ? 'No complaints registered yet'
                  : `No complaints found with status "${selectedStatus}"`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                {selectedStatus === 'all'
                  ? 'Notice an electrical fault, plumbing leak, or internet issue? Lodge a complaint to get it resolved quickly.'
                  : 'Try switching filters or submit a new complaint to track.'}
              </p>
            </div>
            <Link href="/complaints/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 mt-2">
                <PlusCircle className="w-4 h-4 mr-2" />
                Register Your First Complaint
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
