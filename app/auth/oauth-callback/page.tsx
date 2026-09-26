'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

function OAuthCallbackContent() {
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'An error occurred during authentication.';
        setError(msg);
      }
    }

    handleExchange();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-cream text-body flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-pale-lavender selection:text-charcoal">
      {/* Soft pastel ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-lavender/20 via-mint/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full p-8 rounded-2xl bg-surface border border-border shadow-xl text-center relative z-10"
      >
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pale-danger border border-danger/30 text-danger mx-auto flex items-center justify-center shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-charcoal tracking-tight">Authentication Failed</h2>
            <p className="text-sm text-slate">{error}</p>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                window.location.href = '/login';
              }}
              className="mt-4 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-charcoal hover:bg-charcoal-hover text-white transition-colors cursor-pointer shadow-sm"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pale-lavender border border-lavender/30 text-lavender-strong mx-auto flex items-center justify-center shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-charcoal tracking-tight">Securing Session...</h2>
            <p className="text-sm text-slate">
              Validating credentials and establishing your encrypted campus session.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>JWT Authentication Active</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-lavender-strong" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
