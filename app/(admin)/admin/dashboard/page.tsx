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
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

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
      const res = await fetchWithAuth('/api/reports/summary');
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
      const res = await fetchWithAuth('/api/complaints');
      if (!res.ok) throw new Error('Failed to fetch complaint data for export');
      const json = await res.json();
      const complaints: Complaint[] = json.data || [];
      exportComplaintsToCsv(complaints, 'grivo-facilities-master-report.csv');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pale-lavender text-lavender-strong text-xs font-semibold mb-2">
            Administrator Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Facilities Overview & Analytics
          </h1>
          <p className="text-sm text-slate mt-1">
            Real-time status aggregates, category distribution, SLA timers, and campus feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1.5 text-lavender" />
            )}
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/complaints">
            <Button variant="glow">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Manage All Complaints
            </Button>
          </Link>
        </div>
      </div>

      {isError ? (
        <Card className="border-[#FECDD3] bg-pale-danger p-6 text-center">
          <AlertCircle className="w-8 h-8 text-danger mx-auto mb-2" />
          <h3 className="text-base font-semibold text-charcoal">Failed to load statistics</h3>
          <p className="text-xs text-danger mt-1">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
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
              <Card className="shadow-sm border-border bg-white">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        Campus Satisfaction Scorecard
                      </CardTitle>
                      <CardDescription className="text-xs text-slate mt-0.5">
                        Feedback submitted by students following issue resolution.
                      </CardDescription>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-pale-warning text-warning border border-[#FDE68A]">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-cream to-pale-lavender/50 border border-border">
                      <div className="flex items-center gap-4">
                        <div className="text-center p-3 rounded-lg bg-white shadow-sm border border-border min-w-[90px]">
                          <span className="text-3xl font-black text-charcoal tracking-tight">
                            {summary?.averageRating ? summary.averageRating.toFixed(1) : '—'}
                          </span>
                          <span className="text-xs text-slate block mt-0.5">/ 5.0</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-amber-500 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(summary?.averageRating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-charcoal">
                            {summary?.averageRating && summary.averageRating >= 4.5
                              ? '⭐ Exceptional Campus Satisfaction'
                              : summary?.averageRating && summary.averageRating >= 3.5
                              ? '👍 Good Facilities Feedback'
                              : summary?.averageRating
                              ? '⚠️ Requires Attention'
                              : 'No student reviews recorded yet'}
                          </p>
                          <p className="text-[11px] text-slate mt-0.5">
                            Based on {summary?.totalRatings || 0} student verified rating{summary?.totalRatings === 1 ? '' : 's'}.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href="/admin/complaints?status=Resolved">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
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
              <Card className="shadow-sm border-border bg-white">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-lavender" />
                    Priority Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-slate">
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
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted border border-border text-sm"
                      >
                        <ComplaintPriorityBadge priority={item.priority} />
                        <span className="font-bold text-charcoal">
                          {item.count} {item.count === 1 ? 'issue' : 'issues'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate">No priority data available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Prompt Card */}
              <Card className="shadow-sm border-lavender/30 bg-pale-lavender">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-lavender" />
                    Triage & Dispatch
                  </CardTitle>
                  <CardDescription className="text-xs text-lavender-strong">
                    {summary?.pending || 0} issues currently awaiting department assignment or status change.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Link href="/admin/complaints?status=Pending">
                    <Button variant="glow" className="w-full text-xs">
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
