'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Complaint } from '@/lib/types';
import { STATUSES, Status, CATEGORIES, Category } from '@/lib/constants';
import { ComplaintTrackerCard } from '@/components/complaint-tracker-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  PlusCircle,
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Star,
  Camera,
  X,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';

export default function UserDashboardPage() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

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

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const rejected = complaints.filter((c) => c.status === 'Rejected').length;
    const rated = complaints.filter((c) => Boolean(c.rating)).length;

    return { total, pending, inProgress, resolved, rejected, rated };
  }, [complaints]);

  // Filter & Sort complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        // Status filter
        if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
        // Category filter
        if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = String(c.complaint_number).includes(q) || `#scms-${String(c.complaint_number).padStart(4, '0')}`.toLowerCase().includes(q);
          const matchLoc = c.location.toLowerCase().includes(q);
          const matchDesc = c.description.toLowerCase().includes(q);
          const matchCategory = c.category.toLowerCase().includes(q);
          if (!matchId && !matchLoc && !matchDesc && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'priority') {
          const pOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        }
        return 0;
      });
  }, [complaints, selectedStatus, selectedCategory, search, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  const hasActiveFilters = search !== '' || selectedStatus !== 'all' || selectedCategory !== 'all';

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Campus Facilities & Maintenance Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Student Complaint Tracking Center
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Lodge campus maintenance requests, track real-time resolution stages with live SLA countdowns, and rate repair quality.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Link href="/complaints/new">
              <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-md hover:shadow-lg transition-all">
                <PlusCircle className="w-4 h-4 mr-2 text-indigo-600" />
                File New Complaint
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-40 -top-20 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Lodged
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {metrics.total}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {metrics.inProgress}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Awaiting Triage
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {metrics.pending}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {metrics.resolved}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Feedback Given
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {metrics.rated}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID (e.g. 0001), location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-3">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'priority')}
              className="text-xs"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest Priority</option>
            </Select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('In Progress')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === 'In Progress'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              In Progress ({metrics.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Pending')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === 'Pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Pending ({metrics.pending})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Resolved')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === 'Resolved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Resolved ({metrics.resolved})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Rejected')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === 'Rejected'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Rejected ({metrics.rejected})
            </button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Complaint List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Active Complaints & Timeline Progress
            <span className="text-xs font-normal text-slate-400">
              ({filteredComplaints.length} {filteredComplaints.length === 1 ? 'item' : 'items'})
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-4 w-1/3" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
              Failed to load complaints
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 max-w-md mx-auto">
              {error instanceof Error ? error.message : 'Unknown error occurred while fetching your records.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 border-rose-300 text-rose-800 dark:text-rose-300 hover:bg-rose-100"
            >
              Try Again
            </Button>
          </Card>
        ) : filteredComplaints.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
            <CardContent className="space-y-4 p-0">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {hasActiveFilters ? 'No complaints match your criteria' : 'No facility complaints logged yet'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                  {hasActiveFilters
                    ? 'Try broadening your search query, selecting "All Categories", or clearing the status filter.'
                    : 'Notice a broken light, leaky pipe, Wi-Fi outage, or cleanliness problem? Submit a report in 30 seconds.'}
                </p>
              </div>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="text-xs mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Clear All Filters
                </Button>
              ) : (
                <Link href="/complaints/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md mt-2">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Lodge Your First Complaint
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <ComplaintTrackerCard
                key={complaint.id}
                complaint={complaint}
                onOpenPhoto={(url, title) => setPreviewPhoto({ url, title })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo Zoom Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-800 flex items-center justify-between text-white border-b border-slate-700">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" />
                {previewPhoto.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black/60 flex items-center justify-center max-h-[75vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt="Preview"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
