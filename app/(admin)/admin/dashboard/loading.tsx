import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36 rounded-full bg-pale-lavender/60" />
          <Skeleton className="h-8 w-72 sm:w-96 rounded-lg bg-surface-muted" />
          <Skeleton className="h-4 w-60 sm:w-80 rounded-md bg-surface-muted/60" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-xl bg-surface-muted" />
          <Skeleton className="h-9 w-24 rounded-xl bg-surface-muted" />
          <Skeleton className="h-9 w-44 rounded-xl bg-charcoal/20" />
        </div>
      </div>

      {/* 6 Metric Stats Cards Skeleton Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border border-border/80 bg-white shadow-xs p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-8 h-8 rounded-lg bg-surface-muted" />
              <Skeleton className="w-4 h-4 rounded-full bg-surface-muted/60" />
            </div>
            <Skeleton className="h-7 w-16 rounded-md bg-surface-muted mb-1.5" />
            <Skeleton className="h-3.5 w-24 rounded-md bg-surface-muted/60" />
          </Card>
        ))}
      </div>

      {/* Charts & Breakdown Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart Skeleton (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs border-border bg-white rounded-2xl">
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48 rounded-md bg-surface-muted" />
                  <Skeleton className="h-3.5 w-64 rounded-md bg-surface-muted/60" />
                </div>
                <Skeleton className="h-6 w-28 rounded-full bg-pale-lavender/60" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-[280px] w-full rounded-xl bg-surface-muted/50" />
            </CardContent>
          </Card>

          {/* Scorecard Skeleton */}
          <Card className="shadow-xs border-border bg-white rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-56 rounded-md bg-surface-muted" />
                <Skeleton className="h-5 w-32 rounded-full bg-surface-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <Skeleton className="h-28 w-full rounded-xl bg-surface-muted/40" />
            </CardContent>
          </Card>
        </div>

        {/* Priority & Quick Actions Skeleton (1 Col on lg) */}
        <div className="space-y-6">
          <Card className="shadow-xs border-border bg-white rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-5 w-40 rounded-md bg-surface-muted" />
              <Skeleton className="h-3.5 w-52 rounded-md bg-surface-muted/60" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Skeleton className="h-10 w-full rounded-lg bg-surface-muted/60" />
              <Skeleton className="h-10 w-full rounded-lg bg-surface-muted/60" />
              <Skeleton className="h-10 w-full rounded-lg bg-surface-muted/60" />
            </CardContent>
          </Card>

          <Card className="shadow-xs border-lavender/30 bg-pale-lavender rounded-2xl p-5">
            <div className="space-y-3">
              <Skeleton className="h-5 w-36 rounded-md bg-white/60" />
              <Skeleton className="h-4 w-48 rounded-md bg-white/40" />
              <Skeleton className="h-10 w-full rounded-xl bg-charcoal/20" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
