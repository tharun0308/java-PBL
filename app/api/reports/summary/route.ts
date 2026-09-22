import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth';
import { Category, Priority } from '@/lib/constants';
import { ReportSummary } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const token = getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const raw = await apiClient<any>('/api/v1/reports/summary', {
      token,
    });

    const categoryBreakdown = raw?.categoryBreakdown || {};
    const priorityBreakdown = raw?.priorityBreakdown || {};

    const byCategory: { category: Category; count: number }[] = Object.entries(categoryBreakdown).map(
      ([cat, count]) => ({
        category: cat as Category,
        count: Number(count) || 0,
      })
    );

    const byPriority: { priority: Priority; count: number }[] = Object.entries(priorityBreakdown).map(
      ([prio, count]) => ({
        priority: prio as Priority,
        count: Number(count) || 0,
      })
    );

    const summary: ReportSummary = {
      total: raw?.totalComplaints ?? 0,
      pending: raw?.pendingComplaints ?? 0,
      inProgress: raw?.inProgressComplaints ?? 0,
      resolved: raw?.resolvedComplaints ?? 0,
      rejected: raw?.rejectedComplaints ?? 0,
      overdue: 0,
      averageRating: null,
      totalRatings: 0,
      byCategory,
      byPriority,
    };

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to load report summary' },
      { status }
    );
  }
}
