'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Complaint } from '@/lib/types';
import {
  STATUSES,
  STATUS_CONFIG,
  STATUS_LABELS,
  Status,
  CATEGORIES,
  CATEGORY_LABELS,
  Category,
} from '@/lib/constants';
import { ComplaintStatusBadge, ComplaintPriorityBadge } from '@/components/complaint-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelativeTime } from '@/lib/utils';
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
  XCircle,
  Layers,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Inbox,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function UserDashboardPage() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRIORITY'>('NEWEST');
  const [isRequestingStaff, setIsRequestingStaff] = useState(false);

  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      const json = await res.json();
      return json.user;
    },
  });

  const handleRequestStaffAdmin = async () => {
    setIsRequestingStaff(true);
    try {
      const res = await fetch('/api/users/request-staff-admin', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to request staff admin access');
      }
      toast.success('Request Submitted', {
        description: 'Your request for Staff Admin access has been sent to the Main Administrator.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      });
      await refetchUser();
    } catch (err: any) {
      toast.error('Request Failed', {
        description: err.message,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    } finally {
      setIsRequestingStaff(false);
    }
  };

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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch complaints');
      }
      const json = await res.json();
      return json.data || [];
    },
  });

  // Calculate Summary Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'PENDING').length;
    const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
    const rejected = complaints.filter((c) => c.status === 'REJECTED').length;

    return { total, pending, inProgress, resolved, rejected };
  }, [complaints]);

  // Filter & Sort complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
        if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const ticketNum = (c.complaintNumber || `#SCMS-${c.complaint_number || ''}`).toLowerCase();
          const matchNum = ticketNum.includes(q);
          const matchLoc = (c.location || '').toLowerCase().includes(q);
          const matchDesc = (c.description || '').toLowerCase().includes(q);
          const matchCat = (CATEGORY_LABELS[c.category] || c.category || '').toLowerCase().includes(q);
          if (!matchNum && !matchLoc && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();

        if (sortBy === 'NEWEST') return dateB - dateA;
        if (sortBy === 'OLDEST') return dateA - dateB;
        if (sortBy === 'PRIORITY') {
          const pOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        }
        return 0;
      });
  }, [complaints, selectedStatus, selectedCategory, search, sortBy]);

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight flex items-center gap-2.5">
            <span>My Complaints</span>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-pale-lavender text-lavender-strong border border-lavender/30">
              Student / Faculty Portal
            </span>
          </h1>
          <p className="text-sm text-slate mt-1">
            Track real-time resolution status and communication logs for your submitted grievances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-lavender' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link href="/complaints/new">
            <Button size="sm" variant="glow" className="flex items-center gap-1.5 shadow-md">
              <PlusCircle className="w-4 h-4" />
              <span>New Complaint</span>
            </Button>
          </Link>
        </div>
      </div>


      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate">
              Total Filed
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-charcoal">
                {isLoading ? <Skeleton className="h-7 w-8" /> : metrics.total}
              </span>
              <ClipboardList className="w-5 h-5 text-slate" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pale-warning border-[#FDE68A] shadow-sm">
          <CardContent className="p-4 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-warning">
              Pending
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-warning">
                {isLoading ? <Skeleton className="h-7 w-8" /> : metrics.pending}
              </span>
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pale-lavender border-lavender/30 shadow-sm">
          <CardContent className="p-4 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-lavender-strong">
              In Progress
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-lavender-strong">
                {isLoading ? <Skeleton className="h-7 w-8" /> : metrics.inProgress}
              </span>
              <Loader2 className="w-5 h-5 text-lavender" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pale-mint border-mint/30 shadow-sm">
          <CardContent className="p-4 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-mint-strong">
              Resolved
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-mint-strong">
                {isLoading ? <Skeleton className="h-7 w-8" /> : metrics.resolved}
              </span>
              <CheckCircle2 className="w-5 h-5 text-mint-strong" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pale-danger border-[#FECDD3] shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-danger">
              Rejected
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-danger">
                {isLoading ? <Skeleton className="h-7 w-8" /> : metrics.rejected}
              </span>
              <XCircle className="w-5 h-5 text-danger" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
              <Input
                placeholder="Search ticket #, location, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-border text-charcoal text-sm focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender"
              >
                <option value="ALL">All Statuses</option>
                {STATUSES.map((st: Status) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-border text-charcoal text-sm focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((cat: Category) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-border text-charcoal text-sm focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="PRIORITY">Highest Priority</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint List Section */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-border p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="bg-pale-danger border-[#FECDD3] p-8 text-center">
            <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
            <h3 className="text-base font-bold text-charcoal">Failed to Load Complaints</h3>
            <p className="text-xs text-danger mt-1 mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </Card>
        ) : filteredComplaints.length === 0 ? (
          /* Empty State */
          <Card className="bg-white border-border p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-pale-lavender border border-lavender/30 flex items-center justify-center text-lavender mx-auto mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-charcoal">
              {complaints.length === 0 ? 'No Complaints Submitted Yet' : 'No Matching Complaints'}
            </h3>
            <p className="text-xs text-slate max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
              {complaints.length === 0
                ? 'When you encounter facility, electrical, cleanliness, or IT issues on campus, file a complaint to initiate instant tracking.'
                : 'No complaints matched your current search filters. Try resetting the filters above.'}
            </p>
            {complaints.length === 0 ? (
              <Link href="/complaints/new">
                <Button variant="glow" size="default" className="shadow-lg">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  File Your First Complaint
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                }}
              >
                Clear Search & Filters
              </Button>
            )}
          </Card>
        ) : (
          /* Complaint Cards Grid */
          filteredComplaints.map((c) => {
            const ticketNumber = c.complaintNumber || `#SCMS-${String(c.complaint_number || '').padStart(4, '0')}`;
            const categoryLabel = CATEGORY_LABELS[c.category] || c.category;
            const createdDate = c.createdAt || c.created_at;

            return (
              <Link
                key={c.id}
                href={`/complaints/${c.id}`}
                className="block group transition-all"
              >
                <Card className="bg-white hover:bg-pale-lavender border-border hover:border-lavender/40 transition-all shadow-sm hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-pale-lavender text-lavender-strong border border-lavender/30">
                          {ticketNumber}
                        </span>
                        <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-lavender" />
                          {categoryLabel}
                        </span>
                        <ComplaintPriorityBadge priority={c.priority} />
                      </div>

                      <div className="flex items-center gap-2">
                        <ComplaintStatusBadge status={c.status} />
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal">
                          <MapPin className="w-3.5 h-3.5 text-slate shrink-0" />
                          <span className="truncate">{c.location}</span>
                        </div>
                        <p className="text-xs text-slate line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate" />
                          <span>{createdDate ? formatRelativeTime(createdDate) : 'Recently'}</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-surface-muted group-hover:bg-pale-lavender text-slate group-hover:text-lavender flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Teacher Manager Access Appeal Feature (Teachers only, max 3 attempts) */}
      {userData?.userTitle === 'Teacher' &&
        userData?.role === 'STUDENT_TEACHER' &&
        userData?.staffAdminStatus !== 'PENDING' &&
        userData?.staffAdminStatus !== 'APPROVED' && (
          <Card
            className={`border shadow-sm transition-all ${
              (userData?.staffAdminAppealCount || 0) >= 3
                ? 'bg-surface-muted border-border opacity-75'
                : 'bg-pale-lavender border-lavender/30'
            }`}
          >
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                    (userData?.staffAdminAppealCount || 0) >= 3
                      ? 'bg-white border-border text-slate'
                      : 'bg-white border-lavender/30 text-lavender'
                  }`}
                >
                  {(userData?.staffAdminAppealCount || 0) >= 3 ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-charcoal">
                      Appeal for Manager (Staff Admin) Access
                    </h4>
                    {(userData?.staffAdminAppealCount || 0) >= 3 ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pale-danger text-danger border border-[#FECDD3]">
                        Max Appeals (3/3) Reached
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-lavender-strong border border-lavender/30">
                        {Math.max(0, 3 - (userData?.staffAdminAppealCount || 0))} of 3 appeals remaining
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate mt-1 max-w-xl leading-relaxed">
                    {(userData?.staffAdminAppealCount || 0) >= 3
                      ? 'You have used all 3 appeal attempts for Staff Admin manager access. If you still require administrative elevation, please contact the campus Main Administrator directly.'
                      : 'As faculty, you can appeal for Manager access to triage departmental grievances, assign technicians, and update resolution statuses. Requires Main Admin verification.'}
                  </p>
                </div>
              </div>

              {(userData?.staffAdminAppealCount || 0) >= 3 ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="cursor-not-allowed shrink-0 self-start sm:self-auto"
                >
                  <Lock className="w-3.5 h-3.5 mr-2" />
                  Appeal Limit Reached
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestStaffAdmin}
                  disabled={isRequestingStaff}
                  className="border-lavender/30 text-lavender-strong hover:bg-white shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  {isRequestingStaff ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Submitting Appeal...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-2" />
                      Submit Appeal (Attempt {(userData?.staffAdminAppealCount || 0) + 1} of 3)
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
