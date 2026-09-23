'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Wrench,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

interface FloatingCardsProps {
  className?: string;
}

export function FloatingCards({ className = '' }: FloatingCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    // Accessible Static Scattered Layout for prefers-reduced-motion
    return (
      <div
        className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
        aria-hidden="true"
      >
        {/* Card 1: Top Left */}
        <div className="hidden md:block absolute top-[12%] left-[4%] xl:left-[8%] opacity-50">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] font-bold text-indigo-300">#SCMS-0038</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[11px] font-medium text-slate-300">Plumbing</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Resolved • Hostel Block C
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Top Right */}
        <div className="hidden md:block absolute top-[18%] right-[4%] xl:right-[8%] opacity-50">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-semibold text-white tracking-tight">Avg. Resolution: 18h</span>
              <span className="text-[10px] text-slate-400">99.2% SLA Compliance</span>
            </div>
          </div>
        </div>

        {/* Card 3: Bottom Left */}
        <div className="hidden md:block absolute bottom-[20%] left-[5%] xl:left-[9%] opacity-50">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-white">Technician Dispatched</span>
              </div>
              <span className="text-[10px] text-slate-400">Hostel Block B • Electrical</span>
            </div>
          </div>
        </div>

        {/* Card 4: Bottom Right */}
        <div className="hidden lg:block absolute bottom-[14%] right-[5%] xl:right-[9%] opacity-50">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-semibold text-white">New Teacher Onboarded</span>
              <span className="text-[10px] text-slate-400">Dept. of Computer Science</span>
            </div>
          </div>
        </div>

        {/* Card 5: Mid Left */}
        <div className="hidden lg:block absolute top-[48%] left-[3%] xl:left-[6%] opacity-45">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-semibold text-white">Audit Log Verified</span>
              <span className="font-mono text-[10px] text-slate-400">Hash #8f2a...c019</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Activity Drifting Ambient Animation
  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Card 1: Resolved Complaint Snippet (Drifting Left-to-Right in upper lane) */}
      <div className="hidden md:block absolute top-[13%] left-0 anim-drift-1">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-indigo-300">#SCMS-0038</span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[11px] font-medium text-slate-300">Plumbing</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Resolved • Hostel Block C
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: SLA & Turnaround Stat (Drifting Right-to-Left in mid-upper lane) */}
      <div className="hidden md:block absolute top-[27%] left-0 anim-drift-2">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-semibold text-white tracking-tight">Avg. Resolution: 18h</span>
            <span className="text-[10px] text-slate-400">99.2% SLA Compliance</span>
          </div>
        </div>
      </div>

      {/* Card 3: Live Dispatch Notification (Drifting Left-to-Right in lower-mid lane) */}
      <div className="hidden md:block absolute top-[62%] left-0 anim-drift-3">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-white">Technician Dispatched</span>
            </div>
            <span className="text-[10px] text-slate-400">Hostel Block B • Electrical</span>
          </div>
        </div>
      </div>

      {/* Card 4: Role / User Snippet (Drifting Right-to-Left in lower lane) */}
      <div className="hidden lg:block absolute top-[77%] left-0 anim-drift-4">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-semibold text-white">New Teacher Onboarded</span>
            <span className="text-[10px] text-slate-400">Dept. of Computer Science</span>
          </div>
        </div>
      </div>

      {/* Card 5: Tamper-Proof Audit Snippet (Drifting Left-to-Right in center-lane) */}
      <div className="hidden lg:block absolute top-[44%] left-0 anim-drift-5">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-semibold text-white">Audit Log Verified</span>
            <span className="font-mono text-[10px] text-slate-400">Hash #8f2a...c019</span>
          </div>
        </div>
      </div>
    </div>
  );
}
