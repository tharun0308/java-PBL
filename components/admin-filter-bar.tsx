'use client';

import React from 'react';
import { CATEGORIES, STATUSES, PRIORITIES } from '@/lib/constants';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { Search, RotateCcw } from 'lucide-react';

interface AdminFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  onReset: () => void;
}

export function AdminFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  onReset,
}: AdminFilterBarProps) {
  const hasActiveFilters = search !== '' || status !== 'all' || category !== 'all' || priority !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by ID, location, or keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        {/* Category Filter */}
        <div>
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <Select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Active filters applied</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
