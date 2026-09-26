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
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
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
        icon: <Clock className="w-5 h-5 text-amber-500" />,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to verify status at this moment.';
      toast.error('Check Failed', {
        description: msg,
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
      const res = await fetch('/api/user/appeal-staff', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit appeal.');
      }

      toast.success('Appeal Submitted', {
        description: data.message || `Appeal #${appealCount + 1} has been sent to the Main Administrator.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      });

      await refetchUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit appeal request.';
      toast.error('Appeal Failed', {
        description: msg,
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
    <div className="min-h-screen bg-cream text-body flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-pale-lavender selection:text-charcoal">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-lavender/20 via-mint/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none -z-10" />

      {/* Floating live-activity background cards */}
      <FloatingCards />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-charcoal p-[1px] shadow-sm transition-all duration-300 group-hover:scale-105 border border-charcoal">
            <div className="w-full h-full bg-charcoal rounded-[15px] flex items-center justify-center p-2.5">
              <BrandIcon className="w-full h-full group-hover:rotate-6 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-charcoal tracking-tight">
                SCMS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lavender text-charcoal">
                Campus
              </span>
            </div>
            <span className="text-[11px] text-slate font-medium tracking-wide">
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
        <Card className="shadow-xl border-border bg-surface rounded-2xl overflow-hidden">
          {/* Card Top Banner */}
          <div className={`p-6 border-b border-border text-center ${isRejected ? 'bg-pale-danger' : 'bg-pale-warning'}`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-sm ${
              isRejected
                ? 'bg-rose-100 text-rose-600 border border-rose-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
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
                  ? 'border-rose-300 text-rose-700 bg-rose-50'
                  : 'border-amber-300 text-amber-800 bg-amber-50'
              }`}
            >
              {isRejected ? 'Request Not Approved' : 'Waiting for Administrator Approval'}
            </Badge>

            <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
              {isRejected ? 'Staff Admin Access Declined' : 'Manager Access Pending Review'}
            </h2>
            <p className="text-xs text-slate mt-1 max-w-sm mx-auto leading-relaxed">
              {isRejected
                ? 'Your request for Manager (Staff Admin) rights was reviewed by the Main Administrator.'
                : 'Your request for Manager (Staff Admin) access is pending approval from the Main Administrator.'}
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Account Details Box */}
            <div className="rounded-xl p-4 bg-slate-50 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="text-slate">Applicant:</span>
                <span className="font-semibold text-charcoal">{userData?.fullName || 'Teacher / Faculty'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="text-slate">Institutional Email:</span>
                <span className="font-mono text-charcoal">{userData?.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="text-slate">Role Requested:</span>
                <span className="font-semibold text-lavender-strong">Staff Administrator (Manager)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">Appeal Submission:</span>
                <span className="font-semibold text-amber-700">Attempt {appealCount} of 3</span>
              </div>
            </div>

            {/* Access Restriction Notice */}
            <div className="rounded-xl p-3.5 bg-slate-50 border border-border flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate shrink-0 mt-0.5" />
              <div className="text-xs text-slate leading-relaxed">
                <span className="font-semibold text-charcoal">Feature Access Restricted:</span>{' '}
                Complaint triage, technician dispatching, and department management features remain disabled until your account is approved.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full h-11 font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
                  className="w-full h-11 font-semibold border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-600" />
                  <span>{isAppealing ? 'Submitting Appeal...' : `Submit Appeal (${appealCount + 1} of 3)`}</span>
                </Button>
              )}
            </div>

            {/* Footer Sign Out */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-slate">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate" />
                <span>Need help? Contact college administration</span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="font-semibold text-rose-500 hover:text-rose-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
