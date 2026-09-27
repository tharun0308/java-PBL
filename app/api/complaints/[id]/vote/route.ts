import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException } from '@/lib/api/client';
import { getValidAccessToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const response = await apiClient<any>(`/api/v1/complaints/${params.id}/vote`, {
      method: 'POST',
      token,
    });

    return NextResponse.json({
      success: true,
      message: 'Vote updated successfully',
      data: response,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to update vote' },
      { status }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const response = await apiClient<any>(`/api/v1/complaints/${params.id}/upvote`, {
      method: 'DELETE',
      token,
    });

    return NextResponse.json({
      success: true,
      message: 'Upvote removed successfully',
      data: response,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to remove upvote' },
      { status }
    );
  }
}
