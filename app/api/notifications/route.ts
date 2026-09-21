import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db/local-store';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project');
};

export async function GET() {
  try {
    const localUser = getCurrentUser();

    if (!isSupabaseConfigured() || localUser) {
      const user = localUser || { id: 'admin', role: 'admin' as const };
      const isAdmin = user.role === 'admin';
      const notifications = localStore.getNotifications(user.id, isAdmin);
      return NextResponse.json({ data: notifications });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = localStore.getNotifications(user.id, false);
    return NextResponse.json({ data: notifications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const localUser = getCurrentUser();

    if (!isSupabaseConfigured() || localUser) {
      const user = localUser || { id: 'admin', role: 'admin' as const };
      const isAdmin = user.role === 'admin';
      localStore.markNotificationsAsRead(user.id, isAdmin);
      return NextResponse.json({ message: 'Notifications marked as read' });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      localStore.markNotificationsAsRead(user.id, false);
    }

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
