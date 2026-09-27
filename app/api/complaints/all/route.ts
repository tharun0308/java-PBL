import { NextRequest, NextResponse } from 'next/server';
import { apiClient, ApiException } from '@/lib/api/client';
import { getValidAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      if (value) params[key] = value;
    });

    const response = await apiClient<any>('/api/v1/complaints/all', {
      token,
      params,
    });

    const complaintsList = response?.content !== undefined ? response.content : response;

    return NextResponse.json({
      success: true,
      data: complaintsList,
      pageInfo: response?.content !== undefined ? {
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        pageNumber: response.number,
        pageSize: response.size,
      } : undefined,
    });
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to fetch campus complaints' },
      { status }
    );
  }
}
