'use client';

import React from 'react';
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
  // Constrained Perimeter Ambient Floating Animation (Never crosses center content)
  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Card 1: Top Left Flank */}
      <div className="hidden md:block absolute top-[14%] left-[2%] lg:left-[3%] xl:left-[6%] opacity-95 pointer-events-none select-none anim-drift-1">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-md shadow-slate-200/60 hover:shadow-lg transition-shadow">
          <div className="w-7 h-7 rounded-lg bg-pale-mint border border-mint/40 text-mint-strong flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-lavender-strong">#GRIV-0038</span>
              <span className="text-[10px] text-slate">•</span>
              <span className="text-[11px] font-medium text-charcoal">Plumbing</span>
            </div>
            <span className="text-[10px] text-mint-strong font-semibold">
              Resolved • Hostel Block C
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Top Right Flank */}
      <div className="hidden md:block absolute top-[16%] right-[2%] lg:right-[3%] xl:right-[6%] opacity-95 pointer-events-none select-none anim-drift-2">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-md shadow-slate-200/60 hover:shadow-lg transition-shadow">
          <div className="w-7 h-7 rounded-lg bg-pale-warning border border-warning/40 text-warning flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-semibold text-charcoal tracking-tight">Avg. Resolution: 18h</span>
            <span className="text-[10px] text-slate">99.2% SLA Compliance</span>
          </div>
        </div>
      </div>

      {/* Card 3: Bottom Left Flank */}
      <div className="hidden md:block absolute bottom-[18%] left-[2%] lg:left-[3%] xl:left-[6%] opacity-95 pointer-events-none select-none anim-drift-3">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-md shadow-slate-200/60 hover:shadow-lg transition-shadow">
          <div className="w-7 h-7 rounded-lg bg-pale-lavender border border-lavender/40 text-lavender-strong flex items-center justify-center shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lavender-strong animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-charcoal">Technician Dispatched</span>
            </div>
            <span className="text-[10px] text-slate">Hostel Block B • Electrical</span>
          </div>
        </div>
      </div>

      {/* Card 4: Bottom Right Flank */}
      <div className="hidden md:block absolute bottom-[14%] right-[2%] lg:right-[3%] xl:right-[6%] opacity-95 pointer-events-none select-none anim-drift-4">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-md shadow-slate-200/60 hover:shadow-lg transition-shadow">
          <div className="w-7 h-7 rounded-lg bg-pale-lavender border border-lavender/40 text-lavender-strong flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-semibold text-charcoal">New Teacher Onboarded</span>
            <span className="text-[10px] text-slate">Dept. of Computer Science</span>
          </div>
        </div>
      </div>

      {/* Card 5: Mid Left Flank */}
      <div className="hidden xl:block absolute top-[48%] left-[1.5%] xl:left-[4%] opacity-90 pointer-events-none select-none anim-drift-5">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-md shadow-slate-200/60 hover:shadow-lg transition-shadow">
          <div className="w-7 h-7 rounded-lg bg-pale-mint border border-mint/40 text-mint-strong flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-semibold text-charcoal">Audit Log Verified</span>
            <span className="font-mono text-[10px] text-slate">Hash #8f2a...c019</span>
          </div>
        </div>
      </div>
    </div>
  );
}
