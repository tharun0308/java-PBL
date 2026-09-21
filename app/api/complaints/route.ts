import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { complaintCreateSchema } from '@/lib/validations/complaint';
import { localStore } from '@/lib/db/local-store';
import { getCurrentUser } from '@/lib/auth';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project');
};

// GET /api/complaints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const localUser = getCurrentUser();

    if (!isSupabaseConfigured() || localUser) {
      const user = localUser || {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@college.edu',
        full_name: 'Campus Administrator',
        role: 'admin' as const,
      };

      const isAdmin = user.role === 'admin';
      const complaints = localStore.getComplaints({
        userId: user.id,
        isAdmin,
        status,
        category,
        priority,
        search,
      });

      return NextResponse.json({ data: complaints });
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

    const isAdmin = profile?.role === 'admin';

    let query = supabase
      .from('complaints')
      .select('*, user:profiles!complaints_user_id_fkey(id, full_name, email, role)')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    if (status && status !== 'all') query = query.eq('status', status);
    if (category && category !== 'all') query = query.eq('category', category);
    if (priority && priority !== 'all') query = query.eq('priority', priority);
    if (search) {
      const numMatch = search.replace(/[^0-9]/g, '');
      if (numMatch && !isNaN(parseInt(numMatch, 10))) {
        query = query.eq('complaint_number', parseInt(numMatch, 10));
      } else {
        query = query.or(`location.ilike.%${search}%,description.ilike.%${search}%`);
      }
    }

    const { data: complaints, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: complaints });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/complaints
export async function POST(request: NextRequest) {
  try {
    const localUser = getCurrentUser();

    // Enforce role rule: Administrators manage complaints and CANNOT file complaints
    if (localUser && localUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Administrators manage campus complaints and cannot file new complaints.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = complaintCreateSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { category, location, description, priority, image_url } = validation.data;

    if (!isSupabaseConfigured() || localUser) {
      const userId = localUser?.id || '22222222-2222-2222-2222-222222222222';
      const newComplaint = localStore.createComplaint({
        userId,
        category,
        location,
        description,
        priority,
        image_url: image_url || null,
      });

      return NextResponse.json({ data: newComplaint }, { status: 201 });
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

    if (profile?.role === 'admin') {
      return NextResponse.json(
        { error: 'Administrators manage campus complaints and cannot file new complaints.' },
        { status: 403 }
      );
    }

    const { data: complaint, error: insertError } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        category,
        location,
        description,
        priority,
        status: 'Pending',
        image_url: image_url || null,
      })
      .select()
      .single();

    if (insertError || !complaint) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create complaint' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from('complaint_history').insert({
      complaint_id: complaint.id,
      old_status: null,
      new_status: 'Pending',
      note: 'Complaint registered by student',
      updated_by: user.id,
    });

    return NextResponse.json({ data: complaint }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
