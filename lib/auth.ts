import { cookies } from 'next/headers';
import { localStore } from './db/local-store';
import { Profile } from './types';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
}

const SESSION_COOKIE_NAME = 'scms_session';

export function setSessionCookie(user: UserSession): void {
  const cookieStore = cookies();
  const sessionData = JSON.stringify(user);
  const encoded = Buffer.from(sessionData).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(): void {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
}

export function getCurrentUser(): UserSession | null {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    const decoded = Buffer.from(sessionCookie, 'base64').toString('utf8');
    const user: UserSession = JSON.parse(decoded);
    return user;
  } catch {
    return null;
  }
}

export function getCurrentProfile(): Profile | null {
  const user = getCurrentUser();
  if (!user) return null;

  const stored = localStore.findUserById(user.id);
  if (stored) {
    return {
      id: stored.id,
      full_name: stored.full_name,
      email: stored.email,
      role: stored.role,
      created_at: stored.created_at,
    };
  }

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    created_at: new Date().toISOString(),
  };
}
