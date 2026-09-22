import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException } from '@/lib/api/client';
import { getAccessToken, getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser();
    const token = getAccessToken();

    if (!user || !token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    if (user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Main Administrator access required.' }, { status: 403 });
    }

    const { id } = params;
    const response = await apiClient<any>(`/api/v1/admin/staff-requests/${id}/approve`, {
      method: 'POST',
      token,
    });

    return NextResponse.json({
      success: true,
      message: 'Staff Admin access approved successfully',
      data: response,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to approve staff admin request' },
      { status }
    );
  }
}
