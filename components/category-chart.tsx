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

// Adjacent-distinct palette: Lavender → Amber → Mint → Rose → Sky → Charcoal → Violet → Teal
// No two adjacent bars share similar hue/lightness.
const COLORS = [
  '#A78BFA', // Lavender (accent 1)
  '#F59E0B', // Amber (warm)
  '#86EFAC', // Mint (accent 2)
  '#F43F5E', // Rose (danger)
  '#0EA5E9', // Sky (cool blue)
  '#1F2937', // Charcoal (dark)
  '#8B5CF6', // Violet (purple)
  '#14B8A6', // Teal (cool green)
];

export function CategoryChart({ data, isLoading = false }: CategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-border bg-white">
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
    <Card className="shadow-sm border-border bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-charcoal">
          Complaints by Facility Category
        </CardTitle>
        <CardDescription className="text-slate">
          Distribution of reported issues across college facilities and services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate">
            <p className="text-sm">No complaints recorded across categories yet.</p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: -10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748B" strokeOpacity={0.15} />
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={11}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#A78BFA', opacity: 0.05 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div className="rounded-lg border border-border bg-white p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-charcoal">{item.payload.category}</p>
                          <p className="text-lavender-strong font-bold mt-1">
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
