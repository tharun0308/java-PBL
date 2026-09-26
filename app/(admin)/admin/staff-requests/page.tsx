'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  User as UserIcon,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingStaffRequest {
  id: string;
  email: string;
  fullName: string;
  role: string;
  staffAdminStatus: string;
  userTitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function StaffRequestsAdminPage() {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PendingStaffRequest[]>({
    queryKey: ['admin-staff-requests'],
    queryFn: async () => {
      const res = await fetch('/api/admin/staff-requests');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch staff requests');
      }
      const json = await res.json();
      return json.data || [];
    },
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/staff-requests/${userId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve staff access');
      }
      return data;
    },
    onSuccess: (_, userId) => {
      toast.success('Staff Access Approved', {
        description: 'User has been promoted to Staff Administrator.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-staff-requests'] });
    },
    onError: (err: any) => {
      toast.error('Approval Failed', {
        description: err.message,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    },
    onSettled: () => {
      setProcessingId(null);
      setActionType(null);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/staff-requests/${userId}/reject`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject staff request');
      }
      return data;
    },
    onSuccess: () => {
      toast.info('Staff Access Rejected', {
        description: 'The request was rejected. User remains in current role.',
        icon: <XCircle className="w-5 h-5 text-amber-400" />,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-staff-requests'] });
    },
    onError: (err: any) => {
      toast.error('Rejection Failed', {
        description: err.message,
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    },
    onSettled: () => {
      setProcessingId(null);
      setActionType(null);
    },
  });

  const handleApprove = (userId: string) => {
    setProcessingId(userId);
    setActionType('approve');
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    setProcessingId(userId);
    setActionType('reject');
    rejectMutation.mutate(userId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight flex items-center gap-2.5">
            <span>Staff Admin Requests</span>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-pale-lavender text-lavender-strong border border-lavender/30">
              Main Admin Review
            </span>
          </h1>
          <p className="text-sm text-slate mt-1">
            Review and grant elevated Staff Administrator permissions to verified campus faculty and department coordinators.
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
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Request List Container */}
      <Card className="bg-white border-border shadow-md overflow-hidden">
        <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-lavender" />
              <span>Pending Authorization Requests</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate mt-0.5">
              {requests.length === 1
                ? '1 user currently awaiting verification'
                : `${requests.length} users currently awaiting verification`}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-pale-warning text-warning border border-[#FDE68A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{requests.length} Pending</span>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-muted border border-border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-10 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-danger mx-auto" />
              <h3 className="text-base font-bold text-charcoal">Failed to load requests</h3>
              <p className="text-xs text-slate max-w-sm mx-auto">
                {error instanceof Error ? error.message : 'An error occurred while loading pending staff requests.'}
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : requests.length === 0 ? (
            /* Empty State */
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-pale-mint border border-mint/30 text-mint-strong flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-charcoal">No Pending Staff Requests</h3>
              <p className="text-xs text-slate max-w-md mx-auto leading-relaxed">
                All campus members requesting Staff Administrator privileges have been reviewed and processed.
              </p>
            </div>
          ) : (
            /* Requests Table / List */
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {requests.map((req) => {
                  const isBusy = processingId === req.id;
                  const isApproving = isBusy && actionType === 'approve';
                  const isRejecting = isBusy && actionType === 'reject';
                  const requestedTime = req.updatedAt || req.createdAt;

                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pale-lavender/50 transition-colors"
                    >
                      {/* User Information */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-pale-lavender border border-lavender/30 text-lavender flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-charcoal text-sm">
                              {req.fullName}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-muted text-charcoal border border-border">
                              {req.userTitle || 'Member'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pale-warning text-warning border border-[#FDE68A] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate" />
                              <span className="text-charcoal">{req.email}</span>
                            </span>
                            {requestedTime && (
                              <span className="flex items-center gap-1.5 text-slate text-[11px]">
                                <Calendar className="w-3 h-3" />
                                <span>Requested {formatRelativeTime(requestedTime)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(req.id)}
                          disabled={isBusy}
                          className="border-[#FECDD3] text-danger hover:bg-pale-danger"
                        >
                          {isRejecting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />
                              Reject
                            </>
                          )}
                        </Button>

                        <Button
                          variant="glow"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={isBusy}
                          className="bg-mint-strong hover:bg-mint text-white shadow-sm"
                        >
                          {isApproving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                              Approve Staff Access
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
