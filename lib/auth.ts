import { cookies } from 'next/headers';
import { Role, StaffAdminStatus } from './constants';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  staffAdminStatus: StaffAdminStatus;
  userTitle?: string;
  onboardingCompleted: boolean;
  academicYear?: number;
  staffAdminAppealCount?: number;
}

export const ACCESS_TOKEN_COOKIE = 'scms_access_token';
export const REFRESH_TOKEN_COOKIE = 'scms_refresh_token';

/**
 * Decode JWT token payload without external library dependencies
 */
export function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Extract UserSession from JWT access token string
 */
export function getUserFromToken(token: string): UserSession | null {
  const claims = decodeJwt(token);
  if (!claims || !claims.sub) return null;

  return {
    id: claims.sub,
    email: claims.email || '',
    fullName: claims.fullName || '',
    role: claims.role || 'STUDENT_TEACHER',
    staffAdminStatus: claims.staffAdminStatus || 'NONE',
    userTitle: claims.userTitle || 'Student',
    onboardingCompleted: claims.onboardingCompleted !== undefined ? Boolean(claims.onboardingCompleted) : true,
    academicYear: claims.academicYear,
    staffAdminAppealCount: claims.staffAdminAppealCount || 0,
  };
}

/**
 * Set HTTP-Only authentication cookies in Next.js Server Actions or Route Handlers
 */
export function setAuthCookies(accessToken: string, refreshToken?: string) {
  const cookieStore = cookies();

  // Access Token (15-30m)
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30, // 30 minutes
  });

  // Refresh Token (7 days)
  if (refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  cookieStore.set(REFRESH_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/**
 * Retrieve current user session from cookies on the server
 */
export function getCurrentUser(): UserSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) return null;
  return getUserFromToken(token);
}

export const getCurrentProfile = getCurrentUser;

/**
 * Retrieve raw access token from cookies on the server
 */
export function getAccessToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Retrieve raw refresh token from cookies on the server
 */
export function getRefreshToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}
