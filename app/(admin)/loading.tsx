import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-lg bg-surface-muted" />
          <Skeleton className="h-4 w-96 rounded-md bg-surface-muted/60" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl bg-surface-muted" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-xl bg-surface-muted/50" />
        <Skeleton className="h-28 rounded-xl bg-surface-muted/50" />
        <Skeleton className="h-28 rounded-xl bg-surface-muted/50" />
      </div>
      <Skeleton className="h-64 rounded-2xl bg-surface-muted/40" />
    </div>
  );
}
