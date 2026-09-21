import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/db/local-store';
import { setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/complaint';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName } = validation.data;
    const existing = localStore.findUserByEmail(email);

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const newUser = localStore.createUser(email, password, fullName);

    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    };

    setSessionCookie(sessionUser);

    return NextResponse.json({
      data: sessionUser,
      message: 'Account created successfully',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
