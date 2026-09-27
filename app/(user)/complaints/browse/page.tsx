'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Complaint } from '@/lib/types';
import {
  STATUSES,
  STATUS_LABELS,
  Status,
  CATEGORIES,
  CATEGORY_LABELS,
  Category,
} from '@/lib/constants';
import {
  ComplaintStatusBadge,
  ComplaintPriorityBadge,
  ComplaintEscalationBadge,
} from '@/components/complaint-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
  MapPin,
  Calendar,
  ChevronUp,
  Sparkles,
  Camera,
  Globe,
  Info,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

export default function BrowseCampusComplaintsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'VOTES' | 'NEWEST' | 'OLDEST' | 'PRIORITY'>('VOTES');
  const [votingId, setVotingId] = useState<string | null>(null);

  // Fetch all public campus complaints
  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Complaint[]>({
    queryKey: ['campus-complaints-all'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/complaints/all');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch campus complaints');
      }
      const json = await res.json();
      return json.data || [];
    },
  });

  // Toggle upvote mutation
  const voteMutation = useMutation({
    mutationFn: async (complaintId: string) => {
      const res = await fetchWithAuth(`/api/complaints/${complaintId}/vote`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle upvote');
      }
      return { complaintId, ...data.data };
    },
    onMutate: async (complaintId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campus-complaints-all'] });

      // Snapshot previous state
      const previousComplaints = queryClient.getQueryData<Complaint[]>(['campus-complaints-all']);

      // Optimistically update
      if (previousComplaints) {
        queryClient.setQueryData<Complaint[]>(
          ['campus-complaints-all'],
          previousComplaints.map((c) => {
            if (c.id === complaintId) {
              const currentVoted = !!c.hasUpvoted;
              const currentCount = c.upvoteCount ?? 0;
              return {
                ...c,
                hasUpvoted: !currentVoted,
                upvoteCount: currentVoted ? Math.max(0, currentCount - 1) : currentCount + 1,
              };
            }
            return c;
          })
        );
      }

      return { previousComplaints };
    },
    onError: (err: any, _, context) => {
      if (context?.previousComplaints) {
        queryClient.setQueryData(['campus-complaints-all'], context.previousComplaints);
      }
      toast.error('Upvote Failed', {
        description: err.message || 'Unable to update vote.',
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    },
    onSuccess: (data) => {
      if (data.voted) {
        toast.success('Upvoted!', {
          description: 'Your support helps prioritize this campus issue.',
        });
      } else {
        toast.info('Vote removed');
      }
      queryClient.invalidateQueries({ queryKey: ['campus-complaints-all'] });
    },
    onSettled: () => {
      setVotingId(null);
    },
  });

  const handleVote = (e: React.MouseEvent, complaintId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVotingId(complaintId);
    voteMutation.mutate(complaintId);
  };

  // Filter & Sort complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
        if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const ticketNum = (c.complaintNumber || `#GRIV-${c.complaint_number || ''}`).toLowerCase();
          const matchNum = ticketNum.includes(q);
          const matchLoc = (c.location || '').toLowerCase().includes(q);
          const matchDesc = (c.description || '').toLowerCase().includes(q);
          const matchCat = (CATEGORY_LABELS[c.category] || c.category || '').toLowerCase().includes(q);
          const matchCustomCat = (c.customCategory || '').toLowerCase().includes(q);
          if (!matchNum && !matchLoc && !matchDesc && !matchCat && !matchCustomCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'VOTES') {
          const voteA = a.upvoteCount ?? 0;
          const voteB = b.upvoteCount ?? 0;
          if (voteB !== voteA) return voteB - voteA;
          // Tie-break by newest
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        }
        if (sortBy === 'NEWEST') {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        }
        if (sortBy === 'OLDEST') {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateA - dateB;
        }
        if (sortBy === 'PRIORITY') {
          const pOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        }
        return 0;
      });
  }, [complaints, selectedStatus, selectedCategory, search, sortBy]);

  // Statistics
  const totalVotesCount = useMemo(() => {
    return complaints.reduce((sum, c) => sum + (c.upvoteCount || 0), 0);
  }, [complaints]);

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight flex items-center gap-2.5">
            <span>Browse Campus Grievances</span>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-pale-lavender text-lavender-strong border border-lavender/30">
              Community Board
            </span>
          </h1>
          <p className="text-sm text-slate mt-1">
            Explore active campus issues, track resolution transparency, and upvote issues affecting you.
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
              <Sparkles className="w-4 h-4" />
              <span>Report New Issue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Community Banner Notice */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-pale-lavender/60 via-pale-mint/40 to-white border border-lavender/30 flex items-start gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-white border border-lavender/30 text-lavender-strong flex items-center justify-center shrink-0 shadow-2xs">
          <Globe className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-charcoal">Public Read-Only Campus Feed</h4>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-mint-strong border border-mint/30">
              {complaints.length} Total Complaints • {totalVotesCount} Upvotes
            </span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            All students and faculty can view registered complaints campus-wide. Upvote issues to demonstrate community impact and accelerate administrative resolution. Only authorized Staff Administrators and Technicians can modify ticket status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border-border shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 items-center">
            {/* Search Input */}
            <div className="sm:col-span-12 lg:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
              <Input
                placeholder="Search ticket #, location, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-4 lg:col-span-3">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((cat: Category) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-4 lg:col-span-2">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {STATUSES.map((st: Status) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-4 lg:col-span-3">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="VOTES">🔥 Most Upvoted First</option>
                <option value="NEWEST">⏱️ Newest First</option>
                <option value="OLDEST">⏳ Oldest First</option>
                <option value="PRIORITY">⚡ Highest Priority</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint List Section */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white border-border p-5">
                <div className="flex gap-4 items-center">
                  <Skeleton className="w-12 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-8 text-center bg-white border-border">
            <AlertCircle className="w-8 h-8 text-danger mx-auto mb-2" />
            <h3 className="text-base font-semibold text-charcoal">Failed to Load Complaints</h3>
            <p className="text-xs text-slate mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </Card>
        ) : filteredComplaints.length === 0 ? (
          <Card className="p-12 text-center bg-white border-border">
            <div className="w-12 h-12 rounded-full bg-surface-muted border border-border flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-slate" />
            </div>
            <h3 className="text-base font-bold text-charcoal">No Complaints Found</h3>
            <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
              No campus grievances match your current search and filter settings.
            </p>
          </Card>
        ) : (
          <AnimatePresence initial={false}>
            {filteredComplaints.map((complaint) => {
              const photosCount = complaint.photoPaths?.length || 0;
              const hasVoted = !!complaint.hasUpvoted;
              const votes = complaint.upvoteCount ?? 0;
              const isVoteBusy = votingId === complaint.id && voteMutation.isPending;

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white border-border hover:border-lavender/50 hover:shadow-md transition-all overflow-hidden group">
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      {/* Left: Upvote Box */}
                      <button
                        type="button"
                        onClick={(e) => handleVote(e, complaint.id)}
                        disabled={isVoteBusy}
                        aria-label={hasVoted ? 'Remove upvote' : 'Upvote complaint'}
                        className={`flex sm:flex-col items-center justify-center gap-1 sm:gap-0.5 px-3 py-2 sm:py-2.5 sm:px-3 rounded-xl border transition-all cursor-pointer select-none shrink-0 self-start sm:self-center ${
                          hasVoted
                            ? 'bg-pale-lavender border-lavender text-lavender-strong shadow-xs font-bold'
                            : 'bg-surface-muted hover:bg-pale-lavender/40 border-border text-slate hover:text-charcoal'
                        }`}
                      >
                        <ChevronUp
                          className={`w-5 h-5 transition-transform group-hover:-translate-y-0.5 shrink-0 ${
                            hasVoted ? 'text-lavender-strong stroke-[3]' : 'text-slate'
                          }`}
                        />
                        <span className="text-xs font-bold font-mono leading-none">
                          {votes}
                        </span>
                      </button>

                      {/* Center: Main Complaint Info */}
                      <Link
                        href={`/complaints/${complaint.id}`}
                        className="flex-1 min-w-0 space-y-2 block"
                      >
                        {/* Badges & Meta row */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-lavender-strong shrink-0">
                            {complaint.complaintNumber || `#GRIV-${complaint.complaint_number || 'TICKET'}`}
                          </span>

                          <ComplaintStatusBadge status={complaint.status} />
                          <ComplaintPriorityBadge priority={complaint.priority} />

                          {/* Category Badge */}
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-surface-muted text-charcoal border border-border shrink-0">
                            {complaint.category === 'OTHER' && complaint.customCategory
                              ? `Other: ${complaint.customCategory}`
                              : CATEGORY_LABELS[complaint.category] || complaint.category}
                          </span>

                          {/* Escalation Badge */}
                          {complaint.escalationLevel && complaint.escalationLevel > 0 ? (
                            <ComplaintEscalationBadge
                              escalationLevel={complaint.escalationLevel}
                              escalatedTo={complaint.escalatedTo}
                            />
                          ) : null}

                          {photosCount > 0 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pale-lavender text-lavender-strong border border-lavender/30 flex items-center gap-1 shrink-0">
                              <Camera className="w-3 h-3 shrink-0" />
                              <span>{photosCount} photo{photosCount > 1 ? 's' : ''}</span>
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        <p className="text-sm font-medium text-charcoal line-clamp-2 leading-relaxed break-words">
                          {complaint.description}
                        </p>

                        {/* Location & Time Footer */}
                        <div className="flex items-center gap-4 text-xs text-slate flex-wrap pt-0.5">
                          {complaint.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-xs">{complaint.location}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate shrink-0" />
                            <span>Filed {formatRelativeTime(complaint.createdAt || complaint.created_at || '')}</span>
                          </span>
                        </div>
                      </Link>

                      {/* Right: Detail Arrow */}
                      <Link
                        href={`/complaints/${complaint.id}`}
                        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate hover:text-charcoal hover:bg-surface-muted transition-colors shrink-0 self-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
