import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/db/local-store';
import { findPotentialDuplicates } from '@/lib/ai-triage';
import { Category } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category') as Category;
    const location = searchParams.get('location') || '';

    if (!category || !location || location.trim().length < 3) {
      return NextResponse.json({ data: [] });
    }

    const allComplaints = localStore.getComplaints({ isAdmin: true });
    const duplicates = findPotentialDuplicates(allComplaints, category, location);

    return NextResponse.json({
      data: duplicates.slice(0, 3).map((d) => ({
        id: d.id,
        complaint_number: d.complaint_number,
        location: d.location,
        category: d.category,
        status: d.status,
        created_at: d.created_at,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = body.category as Category;
    const location = body.location || '';

    if (!category || !location || location.trim().length < 3) {
      return NextResponse.json({ data: [] });
    }

    const allComplaints = localStore.getComplaints({ isAdmin: true });
    const duplicates = findPotentialDuplicates(allComplaints, category, location);

    return NextResponse.json({
      data: duplicates.slice(0, 3).map((d) => ({
        id: d.id,
        complaint_number: d.complaint_number,
        location: d.location,
        category: d.category,
        status: d.status,
        created_at: d.created_at,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
