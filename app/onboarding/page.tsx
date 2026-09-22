'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  GraduationCap,
  BookOpen,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { BrandIcon } from '@/components/brand-logo';

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'Student' | 'Teacher' | null>(null);
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [teacherIntent, setTeacherIntent] = useState<'REGULAR' | 'MANAGER' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully');
      router.replace('/login');
      router.refresh();
    } catch {
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  const academicYears = [
    { year: 1, label: '1st Year', sub: 'Freshman / First Year' },
    { year: 2, label: '2nd Year', sub: 'Sophomore / Second Year' },
    { year: 3, label: '3rd Year', sub: 'Junior / Pre-Final Year' },
    { year: 4, label: '4th Year', sub: 'Senior / Final Year' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Selection Required', {
        description: 'Please select whether you are a Student or a Teacher.',
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
      return;
    }

    if (selectedRole === 'Student' && !academicYear) {
      toast.error('Academic Year Required', {
        description: 'Please select your current academic year (1st to 4th year).',
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
      return;
    }

    if (selectedRole === 'Teacher' && !teacherIntent) {
      toast.error('Role Option Required', {
        description: 'Please select whether you want Regular Teacher access or Manager (Staff Admin) access.',
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload =
        selectedRole === 'Student'
          ? { userTitle: 'Student', academicYear }
          : { userTitle: 'Teacher', teacherIntent };

      console.log('[Onboarding] Submitting payload:', payload);

      const response = await fetch('/api/auth/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('[Onboarding] Response status:', response.status, 'data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile setup.');
      }

      toast.success('Profile Setup Complete!', {
        description:
          selectedRole === 'Teacher' && teacherIntent === 'MANAGER'
            ? 'Manager access request submitted for Main Admin approval. Redirecting to portal...'
            : 'Welcome to the Smart Complaint Management System.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      });

      console.log('[Onboarding] Navigating to /dashboard');
      // Use window.location.href to guarantee full browser navigation with newly set cookies
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('[Onboarding] Error submitting onboarding:', err);
      toast.error('Onboarding Failed', {
        description: err.message || 'Something went wrong. Please try again.',
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    (selectedRole === 'Student' && academicYear !== null) ||
    (selectedRole === 'Teacher' && teacherIntent !== null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        {/* Header / Brand */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Campus Identity Setup</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Tell us your campus role to personalize your dashboard and routing permissions.
          </p>
        </div>

        {/* Onboarding Form Card */}
        <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8 bg-slate-900/80 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Student vs Teacher */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                1. Select Your Campus Role
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Student');
                    setTeacherIntent(null);
                  }}
                  className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'Student'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/40 border-white/10 hover:border-white/20 hover:bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {selectedRole === 'Student' && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Student</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Report classroom, hostel, lab, and infrastructure grievances with live tracking.
                    </p>
                  </div>
                </button>

                {/* Teacher Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Teacher');
                    setAcademicYear(null);
                  }}
                  className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'Teacher'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/40 border-white/10 hover:border-white/20 hover:bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    {selectedRole === 'Teacher' && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Teacher / Faculty</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Raise departmental complaints or manage facility triage and technician assignments.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Conditional Sub-Questions */}
            <AnimatePresence mode="wait">
              {selectedRole === 'Student' && (
                <motion.div
                  key="student-step"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 pt-2 border-t border-white/[0.08]"
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    2. Which Academic Year Are You In?
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {academicYears.map((ay) => (
                      <button
                        key={ay.year}
                        type="button"
                        onClick={() => setAcademicYear(ay.year)}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          academicYear === ay.year
                            ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 shadow-sm'
                            : 'bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <p className="text-sm font-bold">{ay.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ay.sub}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedRole === 'Teacher' && (
                <motion.div
                  key="teacher-step"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 pt-2 border-t border-white/[0.08]"
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    2. Choose Your Portal Access Mode
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Regular Teacher Option */}
                    <button
                      type="button"
                      onClick={() => setTeacherIntent('REGULAR')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        teacherIntent === 'REGULAR'
                          ? 'bg-indigo-600/25 border-indigo-500 ring-1 ring-indigo-500/50 shadow-sm'
                          : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-bold text-white">Regular Teacher</span>
                        </div>
                        {teacherIntent === 'REGULAR' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Standard faculty access to file campus tickets, follow updates, and sign off on department repairs.
                      </p>
                    </button>

                    {/* Manager / Staff Admin Option */}
                    <button
                      type="button"
                      onClick={() => setTeacherIntent('MANAGER')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        teacherIntent === 'MANAGER'
                          ? 'bg-cyan-600/25 border-cyan-500 ring-1 ring-cyan-500/50 shadow-sm'
                          : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-white">Manager Access</span>
                        </div>
                        {teacherIntent === 'MANAGER' && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Request Staff Admin rights to triage issues and assign technicians.
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center gap-1.5 text-[10px] text-amber-300/90 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>Requires Main Admin approval</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submission Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={!isFormValid || isSubmitting}
                className="w-full h-12 text-sm sm:text-base font-semibold group cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Saving Profile Preferences...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            {/* Return to Login / Switch Account Action */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <span>Logged in with the wrong account?</span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="font-semibold text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isSigningOut ? 'Signing out...' : 'Sign out & return to Login'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
