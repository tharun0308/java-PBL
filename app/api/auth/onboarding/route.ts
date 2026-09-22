import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { getAccessToken, setAuthCookies } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/v1/users/onboarding`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to complete onboarding' },
        { status: response.status }
      );
    }

    const { accessToken: newAccess, refreshToken: newRefresh, user } = data.data || {};

    const res = NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user,
    });

    // Write fresh tokens with onboardingCompleted: true directly to response cookies
    if (newAccess) {
      res.cookies.set('scms_access_token', newAccess, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 30, // 30 minutes
      });
    }

    if (newRefresh) {
      res.cookies.set('scms_refresh_token', newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Also call setAuthCookies to ensure Next.js cookieStore is synced
    if (newAccess) {
      setAuthCookies(newAccess, newRefresh);
    }

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during onboarding' },
      { status: 500 }
    );
  }
}
