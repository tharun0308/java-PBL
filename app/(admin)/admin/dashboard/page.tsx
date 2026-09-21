'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ReportSummary, Complaint } from '@/lib/types';
import { StatsCards } from '@/components/stats-cards';
import { CategoryChart } from '@/components/category-chart';
import { exportComplaintsToCsv } from '@/lib/export-csv';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  PieChart,
  Download,
  Star,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ComplaintPriorityBadge } from '@/components/complaint-status-badge';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<ReportSummary>({
    queryKey: ['admin-reports-summary'],
    queryFn: async () => {
      const res = await fetch('/api/reports/summary');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load report summary');
      }
      const json = await res.json();
      return json.data;
    },
  });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('Failed to fetch complaint data for export');
      const json = await res.json();
      const complaints: Complaint[] = json.data || [];
      exportComplaintsToCsv(complaints, 'scms-facilities-master-report.csv');
      toast.success('CSV Export Completed', {
        description: `Exported ${complaints.length} complaint records to CSV.`,
      });
    } catch (err: unknown) {
      toast.error('Export Failed', {
        description: err instanceof Error ? err.message : 'Unknown export error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-semibold mb-2">
            Administrator Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Facilities Overview & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time status aggregates, category distribution, SLA timers, and campus feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
            )}
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/complaints">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Manage All Complaints
            </Button>
          </Link>
        </div>
      </div>

      {isError ? (
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">Failed to load statistics</h3>
          <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 border-rose-300 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
          >
            Retry
          </Button>
        </Card>
      ) : (
        <>
          {/* Metric Stats Cards including SLA Overdue */}
          <StatsCards
            total={summary?.total || 0}
            pending={summary?.pending || 0}
            inProgress={summary?.inProgress || 0}
            resolved={summary?.resolved || 0}
            rejected={summary?.rejected || 0}
            overdue={summary?.overdue || 0}
            isLoading={isLoading}
          />

          {/* Charts & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Chart (2 Cols on lg) */}
            <div className="lg:col-span-2 space-y-6">
              <CategoryChart
                data={summary?.byCategory || []}
                isLoading={isLoading}
              />

              {/* Campus Satisfaction Scorecard */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        Campus Satisfaction Scorecard
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Feedback submitted by students following issue resolution.
                      </CardDescription>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Live Student Metric
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-slate-50 to-indigo-50/50 dark:from-amber-950/20 dark:via-slate-900 dark:to-indigo-950/20 border border-amber-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-amber-200 dark:border-slate-700 min-w-[90px]">
                          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {summary?.averageRating ? summary.averageRating.toFixed(1) : '—'}
                          </span>
                          <span className="text-xs text-slate-400 block mt-0.5">/ 5.0</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-amber-500 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(summary?.averageRating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {summary?.averageRating && summary.averageRating >= 4.5
                              ? '⭐ Exceptional Campus Satisfaction'
                              : summary?.averageRating && summary.averageRating >= 3.5
                              ? '👍 Good Facilities Feedback'
                              : summary?.averageRating
                              ? '⚠️ Requires Attention'
                              : 'No student reviews recorded yet'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Based on {summary?.totalRatings || 0} student verified rating{summary?.totalRatings === 1 ? '' : 's'}.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href="/admin/complaints?status=Resolved">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700"
                          >
                            View Resolved Complaints
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Priority & Quick Actions Breakdown (1 Col on lg) */}
            <div className="space-y-6">
              {/* Priority Breakdown Card */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Priority Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Complaints classified by urgency level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : summary?.byPriority ? (
                    summary.byPriority.map((item) => (
                      <div
                        key={item.priority}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-sm"
                      >
                        <ComplaintPriorityBadge priority={item.priority} />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.count} {item.count === 1 ? 'issue' : 'issues'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No priority data available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Prompt Card */}
              <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-indigo-950/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Triage & Dispatch
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-800/80 dark:text-slate-400">
                    {summary?.pending || 0} issues currently awaiting department assignment or status change.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Link href="/admin/complaints?status=Pending">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-sm">
                      View Pending Complaints
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
