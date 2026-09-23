'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { FloatingCards } from '@/components/floating-cards';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<number>(1);
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

  const handleSelectRole = (role: 'Student' | 'Teacher') => {
    setSelectedRole(role);
    if (role === 'Student') {
      setTeacherIntent(null);
    } else {
      setAcademicYear(null);
    }
    setDirection(1);
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setDirection(-1);
    setCurrentStep(1);
  };

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
        description: 'Please select whether you want Regular Teacher access or Manager access.',
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

      if (selectedRole === 'Teacher' && teacherIntent === 'MANAGER') {
        console.log('[Onboarding] Navigating to /pending-approval');
        window.location.href = '/pending-approval';
      } else {
        console.log('[Onboarding] Navigating to /dashboard');
        window.location.href = '/dashboard';
      }
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

  const isStep2Valid =
    (selectedRole === 'Student' && academicYear !== null) ||
    (selectedRole === 'Teacher' && teacherIntent !== null);

  const stepVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 36 : -36,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.28,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -36 : 36,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />

      {/* Floating decorative cards in background */}
      <FloatingCards />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header / Brand */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-1 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Campus Identity Setup</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {currentStep === 1
              ? 'Tell us your campus role to personalize your dashboard and routing permissions.'
              : selectedRole === 'Student'
              ? 'Select your current academic batch for accurate hostel and department routing.'
              : 'Configure your faculty access level and administrative permissions.'}
          </p>
        </div>

        {/* Wizard Card Container */}
        <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
          {/* Progress Header */}
          <div className="pb-6 mb-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Step {currentStep} of 2
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-indigo-300 font-medium">
                {currentStep === 1
                  ? 'Role Selection'
                  : selectedRole === 'Student'
                  ? 'Academic Year'
                  : 'Access Mode'}
              </span>
            </div>

            {/* Step Segments */}
            <div className="flex items-center gap-1.5 w-24">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-slate-800'
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  currentStep === 2 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Multi-Step Wizard Cards with AnimatePresence */}
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      1. Select Your Campus Role
                    </label>
                    <span className="text-[11px] text-slate-400">Click a card to continue</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Student Card */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('Student')}
                      className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                        selectedRole === 'Student'
                          ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/40 border-white/10 hover:border-indigo-500/40 hover:bg-slate-950/70'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                            Student
                          </h3>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                            Learner
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Report classroom, hostel, lab, and infrastructure grievances with live resolution tracking.
                        </p>
                      </div>
                    </button>

                    {/* Teacher Card */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('Teacher')}
                      className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                        selectedRole === 'Teacher'
                          ? 'bg-cyan-600/20 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/40 border-white/10 hover:border-cyan-500/40 hover:bg-slate-950/70'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                            Teacher / Faculty
                          </h3>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-cyan-500/30 text-cyan-300 bg-cyan-500/10">
                            Faculty
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Raise departmental complaints or manage facility triage and technician assignments.
                        </p>
                      </div>
                    </button>
                  </div>
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
                    <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                {/* Back Option & Current Selection Overview */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group py-1 px-2 rounded-lg hover:bg-slate-800/50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>Change role ({selectedRole})</span>
                  </button>

                  <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 border-white/10 bg-slate-800/40 text-slate-300">
                    {selectedRole === 'Student' ? 'Student Setup' : 'Faculty Setup'}
                  </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 2 Content for Student */}
                  {selectedRole === 'Student' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        2. Which Academic Year Are You In?
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {academicYears.map((ay) => (
                          <button
                            key={ay.year}
                            type="button"
                            onClick={() => setAcademicYear(ay.year)}
                            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                              academicYear === ay.year
                                ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/40 shadow-sm'
                                : 'bg-slate-950/40 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <p className="text-sm font-bold">{ay.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{ay.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2 Content for Teacher */}
                  {selectedRole === 'Teacher' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        2. Choose Your Portal Access Mode
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Regular Teacher Option */}
                        <button
                          type="button"
                          onClick={() => setTeacherIntent('REGULAR')}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                            teacherIntent === 'REGULAR'
                              ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/40 shadow-sm'
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
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                            teacherIntent === 'MANAGER'
                              ? 'bg-cyan-600/25 border-cyan-500 ring-2 ring-cyan-500/40 shadow-sm'
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
                    </div>
                  )}

                  {/* Final Submit Button (Only on Step 2) */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="glow"
                      size="lg"
                      disabled={!isStep2Valid || isSubmitting}
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
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      className="font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to step 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="font-semibold text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
