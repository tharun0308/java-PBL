'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import {
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Building2,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const cardEntranceVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Facility Triage',
      description:
        'Instant categorization across 8 campus departments with auto-generated sequential tracking numbers (#SCMS-0001).',
      accent: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-400',
      border: 'hover:border-amber-500/40',
    },
    {
      icon: Activity,
      title: 'Immutable Resolution Timeline',
      description:
        'End-to-end transparency with tamper-proof audit trails recording every status transition, technician dispatch, and remark.',
      accent: 'from-indigo-500/20 to-indigo-500/5',
      iconColor: 'text-indigo-400',
      border: 'hover:border-indigo-500/40',
    },
    {
      icon: Lock,
      title: 'Three-Tier RBAC Security',
      description:
        'Airtight role segregation between Student/Faculty, Staff Technicians, and Main Campus Administrators enforced with JWT & Spring Security.',
      accent: 'from-cyan-500/20 to-cyan-500/5',
      iconColor: 'text-cyan-400',
      border: 'hover:border-cyan-500/40',
    },
    {
      icon: TrendingUp,
      title: 'Institutional Analytics',
      description:
        'Aggregate resolution metrics, turnaround SLAs, and facility health insights for proactive campus infrastructure upkeep.',
      accent: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
      border: 'hover:border-emerald-500/40',
    },
  ];

  const stats = [
    { label: 'Turnaround SLA', value: '< 24h', detail: 'Average first response' },
    { label: 'Campus Coverage', value: '100%', detail: 'All 8 academic wings' },
    { label: 'Audit Integrity', value: '100%', detail: 'Immutable event logs' },
    { label: 'Resolution Rate', value: '99.4%', detail: 'Term-to-date average' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <Navbar user={null} />

      {/* Background Animated Gradient Mesh - Smooth Continuous Drift */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [-25, 25, -25],
                  y: [-15, 20, -15],
                  scale: [1, 1.12, 1],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 left-1/4 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-gradient-to-br from-indigo-600/30 via-indigo-900/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [25, -25, 25],
                  y: [20, -15, 20],
                  scale: [1.1, 0.95, 1.1],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -top-20 right-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-gradient-to-bl from-cyan-500/25 via-sky-800/15 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Radial Dot Matrix Texture - Subpixel & Zoom Safe */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none -z-10" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 flex flex-col items-center">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6 pt-2 sm:pt-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] sm:text-xs font-medium backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Next-Generation Campus Facility Management</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
          >
            Swift, Transparent{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
              Campus Resolutions
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            The centralized institutional platform for students, faculty, and facility staff. File complaints with instant routing, track live resolution timelines, and maintain campus standards.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 pt-1 sm:pt-2"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="glow" className="w-full sm:w-auto px-6 h-11 sm:h-12 text-sm sm:text-base font-semibold group">
                <span>Register Complaint</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 h-11 sm:h-12 text-sm sm:text-base font-semibold">
                <span>Sign In to Portal</span>
              </Button>
            </Link>
          </motion.div>

          {/* Google Quick Action */}
          <motion.div variants={itemVariants} className="pt-1">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all backdrop-blur-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Instant access with Institutional Google Account</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Live Interactive Complaint Tracker Mockup */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mt-8 sm:mt-12 md:mt-14 relative"
        >
          {/* Animated subtle ambient glow */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.03, 1],
                    opacity: [0.45, 0.7, 0.45],
                  }
            }
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-indigo-500/20 blur-xl pointer-events-none -z-10"
          />

          {/* Floating Card Container */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -6, 0],
                  }
            }
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative rounded-2xl glass-panel p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10 hover:border-indigo-500/30 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="absolute w-5 h-5 rounded-full bg-emerald-400/40 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">#SCMS-0042</span>
                    <Badge variant="cyan" className="text-[10px] sm:text-xs">Electrical</Badge>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Reported in Engineering Block C — Microelectronics Lab</p>
                </div>
              </div>

              <Badge variant="warning" className="px-2.5 py-1 text-[11px] sm:text-xs shadow-sm shadow-amber-500/10">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 animate-spin" />
                In Progress
              </Badge>
            </div>

            {/* Timeline Progress - Mobile 2x2, Desktop 1x4 */}
            <div className="py-4 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Ticket Filed</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Automatic priority check</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Auto-Assigned</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Electrical Unit</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm shadow-blue-500/20">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Technician On-Site</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Power supply check</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3 opacity-50">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Resolved</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Student sign-off</p>
                </div>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                Protected by Java Spring Boot & PostgreSQL RLS
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-slate-500">Updated 8m ago</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Ribbon */}
        <div className="w-full max-w-5xl mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={shouldReduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
              className="glass-card p-5 rounded-2xl text-center border border-white/[0.07] hover:border-indigo-500/30 transition-all cursor-default"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-1">{stat.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-5xl mt-24">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-2 mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Institutional Reliability
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built on modern enterprise standards to deliver guaranteed resolution accountability across departments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                  className={`glass-card p-6 sm:p-8 rounded-2xl transition-all duration-300 ${f.border} cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.accent} border border-white/10 flex items-center justify-center ${f.iconColor} mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Facility Departments Covered */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-24 glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 hover:border-indigo-500/20 transition-colors"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">8 Dedicated Facility Units</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Electrical, Water Supply, Cleanliness, Hostel Maintenance, IT Network, Labs, and Infrastructure.
              </p>
            </div>
            <Link href="/register">
              <Button variant="glow" size="lg" className="whitespace-nowrap">
                <span>Start Filing Tickets</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SCMS Campus Portal</span>
            <span>•</span>
            <span>Production Java Spring Boot 3 Backend</span>
          </div>
          <p>© {new Date().getFullYear()} Campus Infrastructure & Facility Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
