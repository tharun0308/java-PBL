import { NextResponse } from 'next/server';
import { clearSessionCookie, getCurrentUser } from '@/lib/auth';

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ message: 'Signed out successfully' });
}

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ data: user });
}
