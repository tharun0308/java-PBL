'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Category } from '@/lib/constants';

interface CategoryChartProps {
  data: { category: Category; count: number }[];
  isLoading?: boolean;
}

const COLORS = [
  '#6366f1', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#64748b', // Slate
];

export function CategoryChart({ data, isLoading = false }: CategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="h-[320px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
          Complaints by Facility Category
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Distribution of reported issues across college facilities and services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <p className="text-sm">No complaints recorded across categories yet.</p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: -10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.2} />
                <XAxis
                  dataKey="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.payload.category}</p>
                          <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                            {item.value} {item.value === 1 ? 'complaint' : 'complaints'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
