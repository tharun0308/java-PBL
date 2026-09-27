import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException } from '@/lib/api/client';
import { getValidAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const response = await apiClient<any>('/api/v1/admin/escalation/run-now', {
      method: 'POST',
      token,
    });

    return NextResponse.json({
      success: true,
      message: 'Escalation check completed successfully',
      data: response,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to trigger escalation check' },
      { status }
    );
  }
}
