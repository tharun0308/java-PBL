import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const body = await req.json();

    const response = await apiClient<any>(`/api/v1/complaints/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        status: body.status,
        note: body.note || body.resolution_note || undefined,
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: response,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to update complaint status' },
      { status }
    );
  }
}
