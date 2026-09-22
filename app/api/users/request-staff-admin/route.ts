import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException, API_BASE_URL } from '@/lib/api/client';
import { getAccessToken, getRefreshToken, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const response = await apiClient<any>('/api/v1/users/request-staff-admin', {
      method: 'POST',
      token,
    });

    // Refresh cookies so claims reflect new appeal count & PENDING status
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data || {};
          if (newAccess) {
            setAuthCookies(newAccess, newRefresh);
          }
        }
      } catch {
        // Continue even if silent token refresh fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Staff Admin access requested successfully. Awaiting administrator approval.',
      data: response,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to request staff admin access' },
      { status }
    );
  }
}
