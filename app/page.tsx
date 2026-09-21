import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import {
  Zap,
  ShieldCheck,
  History,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar profile={null} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Campus Facility Management
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Smart Complaint <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600">
                Management System
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Empowering students to report facility issues across electrical, plumbing, IT, and
              infrastructure in seconds, while equipping administrators with automated triage,
              timelines, and resolution metrics.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  Register as Student
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Access Portal / Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Built for Speed, Transparency & Accountability
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every step from complaint submission to technician resolution is tracked with an
              immutable audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant Filing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Log campus issues in under 30 seconds with automatic human-readable tracking IDs
                like #SCMS-0042.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Full Audit Trail</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every status update, assignee change, and resolution note is logged with exact
                timestamps and admin IDs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Role-Based Security</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Strict Row-Level Security ensures students only access their own records while
                administrators oversee all facilities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Facility Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Aggregated statistics and breakdown charts provide administration with facility
                hotspots and SLA turnaround data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Covered */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Supported Facility Categories</h2>
            <p className="text-sm text-slate-500 mt-1">
              Comprehensive maintenance coverage across entire campus infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 text-slate-700 text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Smart Complaint Management System (SCMS). Production-ready campus operations.</p>
        </div>
      </footer>
    </div>
  );
}
