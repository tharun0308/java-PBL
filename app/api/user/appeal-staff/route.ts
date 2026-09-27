import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { getValidAccessToken, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const response = await fetch(`${API_BASE_URL}/api/v1/users/request-staff-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to submit appeal' },
        { status: response.status }
      );
    }

    const { accessToken: newAccess, refreshToken: newRefresh, user } = data.data || {};

    const res = NextResponse.json({
      success: true,
      message: data.message || 'Appeal submitted successfully',
      data: user || data.data,
    });

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

    if (newAccess) {
      setAuthCookies(newAccess, newRefresh);
    }

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during staff admin appeal' },
      { status: 500 }
    );
  }
}
