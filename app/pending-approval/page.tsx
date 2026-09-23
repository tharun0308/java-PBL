'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { BrandIcon } from '@/components/brand-logo';
import { FloatingCards } from '@/components/floating-cards';
import { motion } from 'framer-motion';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fetch current user details from /api/auth/me
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['pending-auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      const json = await res.json();
      return json.user;
    },
  });

  const staffStatus = userData?.staffAdminStatus || 'PENDING';
  const appealCount = userData?.staffAdminAppealCount || 1;
  const isRejected = staffStatus === 'REJECTED';
  const isApproved = staffStatus === 'APPROVED' || userData?.role === 'STAFF_ADMIN';

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      // 1. Call /api/auth/refresh to exchange refresh token for fresh JWT claims
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
      const refreshData = await refreshRes.json().catch(() => ({}));

      if (!refreshRes.ok) {
        throw new Error(refreshData.error || 'Failed to refresh authentication session.');
      }

      const updatedUser = refreshData.user;
      await refetchUser();

      if (updatedUser?.staffAdminStatus === 'APPROVED' || updatedUser?.role === 'STAFF_ADMIN') {
        toast.success('Access Approved!', {
          description: 'Your Staff Admin access has been approved by the Main Administrator. Redirecting to Admin Portal...',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        });
        window.location.href = '/admin/dashboard';
        return;
      }

      if (updatedUser?.staffAdminStatus === 'REJECTED') {
        toast.error('Request Status: Not Approved', {
          description: 'Your request for Manager access was reviewed and not approved at this time.',
          icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
        });
        return;
      }

      toast.info('Status: Still Pending', {
        description: 'Your request is currently awaiting review by the Main Administrator.',
        icon: <Clock className="w-5 h-5 text-amber-400" />,
      });
    } catch (err: any) {
      toast.error('Check Failed', {
        description: err.message || 'Unable to verify status at this moment.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleAppealAccess = async () => {
    if (appealCount >= 3) {
      toast.error('Limit Reached', {
        description: 'You have reached the maximum of 3 appeal requests.',
      });
      return;
    }

    setIsAppealing(true);
    try {
      const res = await fetch('/api/users/request-staff-admin', { method: 'POST' });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit appeal.');
      }

      toast.success('Appeal Submitted', {
        description: `Appeal attempt ${appealCount + 1} of 3 sent to Main Administrator.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      });

      await handleCheckStatus();
    } catch (err: any) {
      toast.error('Appeal Failed', {
        description: err.message || 'Could not submit appeal request.',
      });
    } finally {
      setIsAppealing(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully');
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none -z-10" />

      {/* Floating live-activity background cards */}
      <FloatingCards />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center p-2.5">
              <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-white tracking-tight">
                SCMS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Campus
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Smart Grievance & Resolution Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Main Status Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0 relative z-10"
      >
        <Card className="shadow-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          {/* Card Top Banner */}
          <div className={`p-6 border-b border-white/[0.08] text-center ${isRejected ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg ${
              isRejected
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/10'
            }`}>
              {isRejected ? (
                <ShieldAlert className="w-7 h-7" />
              ) : (
                <Clock className="w-7 h-7 animate-pulse" />
              )}
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-semibold px-3 py-1 uppercase tracking-wider mb-2 ${
                isRejected
                  ? 'border-rose-500/40 text-rose-300 bg-rose-500/15'
                  : 'border-amber-500/40 text-amber-300 bg-amber-500/15'
              }`}
            >
              {isRejected ? 'Request Not Approved' : 'Waiting for Administrator Approval'}
            </Badge>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isRejected ? 'Staff Admin Access Declined' : 'Manager Access Pending Review'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {isRejected
                ? 'Your request for Manager (Staff Admin) rights was reviewed by the Main Administrator.'
                : 'Your request for Manager (Staff Admin) access is pending approval from the Main Administrator.'}
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Account Details Box */}
            <div className="rounded-xl p-4 bg-slate-950/60 border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-semibold text-white">{userData?.fullName || 'Teacher / Faculty'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Institutional Email:</span>
                <span className="font-mono text-slate-300">{userData?.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Role Requested:</span>
                <span className="font-semibold text-cyan-300">Staff Administrator (Manager)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Appeal Submission:</span>
                <span className="font-semibold text-amber-300">Attempt {appealCount} of 3</span>
              </div>
            </div>

            {/* Access Restriction Notice */}
            <div className="rounded-xl p-3.5 bg-slate-800/40 border border-white/5 flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Feature Access Restricted:</span>{' '}
                Complaint triage, technician dispatching, and department management features remain disabled until your account is approved.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="glow"
                size="lg"
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full h-11 font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking Administrator Approval...' : 'Check Status / Refresh Session'}</span>
              </Button>

              {isRejected && appealCount < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleAppealAccess}
                  disabled={isAppealing}
                  className="w-full h-11 font-semibold border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" />
                  <span>{isAppealing ? 'Submitting Appeal...' : `Submit Appeal (${appealCount + 1} of 3)`}</span>
                </Button>
              )}
            </div>

            {/* Footer Sign Out */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Need help? Contact college administration</span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="font-semibold text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
