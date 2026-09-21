import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/db/local-store';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

interface RouteContext {
  params: {
    id: string;
  };
}

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback_note: z.string().max(500).optional(),
});

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project');
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    const validation = feedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Please provide a valid rating from 1 to 5 stars.' },
        { status: 400 }
      );
    }

    const { rating, feedback_note } = validation.data;
    const localUser = getCurrentUser();

    // 1. Local Database Mode
    if (!isSupabaseConfigured() || localUser) {
      const studentId = localUser?.id || '22222222-2222-2222-2222-222222222222';
      const updated = localStore.addFeedback(id, rating, feedback_note || '', studentId);

      if (!updated) {
        return NextResponse.json(
          { error: 'Complaint not found or you are not authorized to rate this complaint.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        data: updated,
        message: 'Feedback submitted successfully. Thank you!',
      });
    }

    // 2. Supabase Mode
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({
        rating,
        feedback_note: feedback_note || null,
        rated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: updated,
      message: 'Feedback submitted successfully. Thank you!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
