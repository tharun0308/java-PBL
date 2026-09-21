import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { complaintStatusUpdateSchema } from '@/lib/validations/complaint';
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

// PATCH /api/complaints/[id]/status
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    const validation = complaintStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { status, assigned_to, resolution_note, resolution_image_url, note } = validation.data;
    const localUser = getCurrentUser();

    // 1. Local database store
    if (!isSupabaseConfigured() || localUser) {
      if (localUser && localUser.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden. Only administrators can update complaint status.' },
          { status: 403 }
        );
      }

      const adminId = localUser?.id || '11111111-1111-1111-1111-111111111111';
      const updated = localStore.updateComplaintStatus(
        id,
        {
          status,
          assigned_to,
          resolution_note,
          resolution_image_url,
          note,
        },
        adminId
      );

      if (!updated) {
        return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
      }

      return NextResponse.json({
        data: updated,
        message: 'Status updated and audit entry recorded successfully.',
      });
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
        { error: 'Forbidden. Only administrators can update complaint status.' },
        { status: 403 }
      );
    }

    const { data: currentComplaint, error: fetchError } = await supabase
      .from('complaints')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !currentComplaint) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    const oldStatus = currentComplaint.status;
    const adminSupabase = createAdminClient();

    const { data: updatedComplaint, error: updateError } = await adminSupabase
      .from('complaints')
      .update({
        status,
        assigned_to: assigned_to !== undefined ? assigned_to : null,
        resolution_note: resolution_note !== undefined ? resolution_note : null,
        resolution_image_url: resolution_image_url !== undefined ? resolution_image_url : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedComplaint) {
      return NextResponse.json(
        { error: updateError?.message || 'Failed to update complaint' },
        { status: 500 }
      );
    }

    const historyNote = note || (
      oldStatus !== status
        ? `Status updated from ${oldStatus} to ${status}`
        : 'Complaint details updated by administrator'
    );

    await adminSupabase.from('complaint_history').insert({
      complaint_id: id,
      old_status: oldStatus,
      new_status: status,
      note: historyNote,
      updated_by: user.id,
    });

    return NextResponse.json({
      data: updatedComplaint,
      message: 'Status updated and audit entry recorded successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
