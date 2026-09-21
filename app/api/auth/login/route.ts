import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/db/local-store';
import { setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/complaint';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const user = localStore.findUserByEmail(email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    setSessionCookie(sessionUser);

    return NextResponse.json({
      data: sessionUser,
      message: 'Logged in successfully',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
