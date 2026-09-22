import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        fullName: body.fullName || body.full_name,
        userTitle: body.userTitle || 'Student',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Registration failed' },
        { status: response.status }
      );
    }

    const { accessToken, refreshToken, user } = data.data || {};

    if (accessToken) {
      setAuthCookies(accessToken, refreshToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
