import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, apiClient, ApiException } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      if (value) params[key] = value;
    });

    const response = await apiClient<any>('/api/v1/complaints', {
      token,
      params,
    });

    // Spring Boot Page response has .content array
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
      { error: err.message || 'Failed to fetch complaints' },
      { status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();

    const response = await apiClient<any>('/api/v1/complaints', {
      method: 'POST',
      token,
      body: JSON.stringify({
        category: body.category,
        location: body.location,
        description: body.description,
        priority: body.priority || 'MEDIUM',
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint submitted successfully',
        data: response,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const status = err instanceof ApiException ? err.status : 500;
    return NextResponse.json(
      { error: err.message || 'Failed to submit complaint' },
      { status }
    );
  }
}
