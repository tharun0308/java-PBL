'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { BrandIcon } from '@/components/brand-logo';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Zap,
  Wifi,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />

      {/* Floating Decorative Background Cards - Hidden on mobile/tablet to keep form focused */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none -z-10 overflow-hidden">
        {/* Card 1: Top Left */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
          animate={{
            opacity: 0.7,
            scale: 1,
            y: shouldReduceMotion ? 0 : [0, -10, 0],
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, delay: 0.1 },
                  scale: { duration: 0.6, delay: 0.1 },
                  y: { duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
                }
          }
          className="hidden lg:block absolute top-20 left-6 xl:left-14 w-64 glass-card p-4 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-mono text-xs font-bold text-indigo-300">#SCMS-0018</span>
            <Badge variant="success" className="text-[10px] px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Resolved
            </Badge>
          </div>
          <div className="pt-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Water Supply Unit</p>
              <p className="text-[10px] text-slate-400">Hostel Wing B Valve Fixed</p>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Top Right */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
          animate={{
            opacity: 0.7,
            scale: 1,
            y: shouldReduceMotion ? 0 : [0, 11, 0],
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, delay: 0.28 },
                  scale: { duration: 0.6, delay: 0.28 },
                  y: { duration: 7.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 },
                }
          }
          className="hidden lg:block absolute top-24 right-6 xl:right-14 w-64 glass-card p-4 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="font-mono text-xs font-bold text-indigo-300">#SCMS-0027</span>
            <Badge variant="warning" className="text-[10px] px-2 py-0.5">
              <Clock className="w-3 h-3 mr-1 animate-spin" />
              In Progress
            </Badge>
          </div>
          <div className="pt-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xs">
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Campus IT Network</p>
              <p className="text-[10px] text-slate-400">Library AP Node Upgrade</p>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Bottom Left */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
          animate={{
            opacity: 0.6,
            scale: 1,
            y: shouldReduceMotion ? 0 : [0, 9, 0],
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, delay: 0.46 },
                  scale: { duration: 0.6, delay: 0.46 },
                  y: { duration: 8.4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 },
                }
          }
          className="hidden lg:block absolute bottom-14 left-10 xl:left-18 w-60 glass-card p-3.5 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Tamper-Proof Audit</p>
              <p className="text-[10px] text-slate-400">100% Verified Log Integrity</p>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Bottom Right */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
          animate={{
            opacity: 0.6,
            scale: 1,
            y: shouldReduceMotion ? 0 : [0, -11, 0],
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, delay: 0.64 },
                  scale: { duration: 0.6, delay: 0.64 },
                  y: { duration: 6.9, repeat: Infinity, ease: 'easeInOut', delay: 1.3 },
                }
          }
          className="hidden lg:block absolute bottom-16 right-10 xl:right-18 w-60 glass-card p-3.5 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Turnaround SLA</p>
              <p className="text-[10px] text-slate-400">&lt; 24h Average Response</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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

      {/* Auth Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}
