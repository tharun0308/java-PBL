'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const hasExchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('No authorization exchange code received from provider.');
      return;
    }

    if (hasExchanged.current) {
      return;
    }
    hasExchanged.current = true;

    async function handleExchange() {
      try {
        const res = await fetch('/api/auth/oauth-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.error || 'Failed to authenticate with Google.');
          return;
        }

        const user = data.user;
        const role = user?.role;
        const staffStatus = user?.staffAdminStatus;
        const onboardingDone = user?.onboardingCompleted;

        // Perform clean browser navigation with newly set auth cookies
        if (onboardingDone === false && role !== 'MAIN_ADMIN') {
          window.location.href = '/onboarding';
        } else if (staffStatus === 'PENDING') {
          window.location.href = '/pending-approval';
        } else if (role === 'MAIN_ADMIN' || (role === 'STAFF_ADMIN' && staffStatus === 'APPROVED')) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.');
      }
    }

    handleExchange();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl text-center relative z-10"
      >
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Authentication Failed</h2>
            <p className="text-sm text-slate-400">{error}</p>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                window.location.href = '/login';
              }}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white">Securing Session...</h2>
            <p className="text-sm text-slate-400">
              Validating credentials and establishing your encrypted campus session.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT Authentication Active</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
