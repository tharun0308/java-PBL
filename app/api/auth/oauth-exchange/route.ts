import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Exchange code is required' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/oauth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'OAuth exchange failed or code has expired' },
        { status: response.status }
      );
    }

    const { accessToken, refreshToken, user } = data.data || {};

    if (accessToken) {
      setAuthCookies(accessToken, refreshToken);
    }

    return NextResponse.json({
      success: true,
      message: 'OAuth login successful',
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to exchange OAuth code' },
      { status: 500 }
    );
  }
}
