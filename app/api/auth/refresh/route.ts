import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { getRefreshToken, setAuthCookies, clearAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthCookies();
      return NextResponse.json({ error: 'No refresh token available' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      clearAuthCookies();
      return NextResponse.json(
        { error: data.message || 'Token refresh failed' },
        { status: response.status }
      );
    }

    const { accessToken, refreshToken: newRefreshToken, user } = data.data || {};

    if (accessToken) {
      setAuthCookies(accessToken, newRefreshToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      user,
    });
  } catch (err: any) {
    clearAuthCookies();
    return NextResponse.json(
      { error: err.message || 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
