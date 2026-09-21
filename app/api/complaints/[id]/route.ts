import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { localStore } from '@/lib/db/local-store';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: {
    id: string;
  };
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project');
};

// GET /api/complaints/[id]
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const localUser = getCurrentUser();

    if (!isSupabaseConfigured() || localUser) {
      const complaint = localStore.getComplaintById(id);
      if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
      }

      // Check ownership if student
      if (localUser && localUser.role !== 'admin' && complaint.user_id !== localUser.id) {
        return NextResponse.json({ error: 'Forbidden. You do not own this complaint.' }, { status: 403 });
      }

      return NextResponse.json({ data: complaint });
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .select('*, user:profiles!complaints_user_id_fkey(id, full_name, email, role)')
      .eq('id', id)
      .single();

    if (complaintError || !complaint) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && complaint.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this complaint.' }, { status: 403 });
    }

    const { data: history } = await supabase
      .from('complaint_history')
      .select('*, updater:profiles!complaint_history_updated_by_fkey(id, full_name, email, role)')
      .eq('complaint_id', id)
      .order('updated_at', { ascending: false });

    return NextResponse.json({
      data: {
        ...complaint,
        history: history || [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/complaints/[id]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();
    const localUser = getCurrentUser();

    if (!isSupabaseConfigured() || localUser) {
      if (localUser && localUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
      }

      const updated = localStore.updateComplaintStatus(id, body, localUser?.id || '11111111-1111-1111-1111-111111111111');
      if (!updated) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
      }

      return NextResponse.json({ data: updated });
    }

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
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('complaints')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
