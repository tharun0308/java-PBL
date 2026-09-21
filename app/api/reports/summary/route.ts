import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CATEGORIES, PRIORITIES } from '@/lib/constants';
import { ReportSummary } from '@/lib/types';
import { localStore } from '@/lib/db/local-store';
import { getCurrentUser } from '@/lib/auth';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project');
};

// GET /api/reports/summary
export async function GET() {
  try {
    const localUser = getCurrentUser();

    // 1. Local database store
    if (!isSupabaseConfigured() || localUser) {
      if (localUser && localUser.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden. Admin privileges required.' },
          { status: 403 }
        );
      }

      const summary = localStore.getSummary();
      return NextResponse.json({ data: summary });
    }

    // 2. Supabase Cloud
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      );
    }

    const [
      totalResult,
      pendingResult,
      inProgressResult,
      resolvedResult,
      rejectedResult,
      ...categoryResults
    ] = await Promise.all([
      supabase.from('complaints').select('*', { count: 'exact', head: true }),
      supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'In Progress'),
      supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
      supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Rejected'),
      ...CATEGORIES.map((cat) =>
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('category', cat)
      ),
    ]);

    const byCategory = CATEGORIES.map((cat, index) => ({
      category: cat,
      count: categoryResults[index].count || 0,
    }));

    const priorityResults = await Promise.all(
      PRIORITIES.map((p) =>
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('priority', p)
      )
    );

    const byPriority = PRIORITIES.map((p, index) => ({
      priority: p,
      count: priorityResults[index].count || 0,
    }));

    const summary: ReportSummary = {
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      inProgress: inProgressResult.count || 0,
      resolved: resolvedResult.count || 0,
      rejected: rejectedResult.count || 0,
      overdue: 0,
      averageRating: null,
      totalRatings: 0,
      byCategory,
      byPriority,
    };

    return NextResponse.json({ data: summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
