import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { getRefreshToken, clearAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      // Invalidate on Java backend
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }

    clearAuthCookies();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    clearAuthCookies();
    return NextResponse.json({ success: true, message: 'Logged out' });
  }
}
