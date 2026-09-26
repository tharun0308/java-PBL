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
      color: 'text-lavender-strong',
      bg: 'bg-pale-lavender',
      border: 'border-lavender/30',
    },
    {
      title: 'Pending Triage',
      value: pending,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-pale-warning',
      border: 'border-[#FDE68A]',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Loader2,
      color: 'text-lavender',
      bg: 'bg-pale-lavender',
      border: 'border-lavender/30',
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-mint-strong',
      bg: 'bg-pale-mint',
      border: 'border-mint/30',
    },
    {
      title: 'SLA Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-pale-danger',
      border: 'border-[#FECDD3]',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: XCircle,
      color: 'text-slate',
      bg: 'bg-surface-muted',
      border: 'border-border',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 bg-white border-border">
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
            className={`border ${card.border} bg-white hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-charcoal mt-1">
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
