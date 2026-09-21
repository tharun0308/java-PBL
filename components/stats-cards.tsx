import React from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ClipboardList, Clock, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  overdue?: number;
  isLoading?: boolean;
}

export function StatsCards({
  total,
  pending,
  inProgress,
  resolved,
  rejected,
  overdue = 0,
  isLoading = false,
}: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Complaints',
      value: total,
      icon: ClipboardList,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      border: 'border-indigo-100 dark:border-indigo-900',
    },
    {
      title: 'Pending Triage',
      value: pending,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'border-amber-100 dark:border-amber-900',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      border: 'border-blue-100 dark:border-blue-900',
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-100 dark:border-emerald-900',
    },
    {
      title: 'SLA Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      border: 'border-rose-200 dark:border-rose-900',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: XCircle,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800',
      border: 'border-slate-200 dark:border-slate-800',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border ${card.border} bg-white dark:bg-slate-900 hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
