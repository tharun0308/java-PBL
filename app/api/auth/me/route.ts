import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getAccessToken } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api/client';

export async function GET(req: NextRequest) {
  const token = getAccessToken();
  const fallbackUser = getCurrentUser();

  if (!token || !fallbackUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        user: data.data || fallbackUser,
        token,
      });
    }
  } catch {
    // Fallback to cookie-decoded user if network call fails
  }

  return NextResponse.json({
    user: fallbackUser,
    token,
  });
}
