import { type NextRequest, NextResponse } from 'next/server';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/complaints');

  const token = request.cookies.get('scms_access_token')?.value;
  const user = token ? decodeJwtPayload(token) : null;

  // 1. If unauthenticated user attempts to access onboarding or protected user/admin routes, redirect to /login
  if (!user && (isOnboardingRoute || isAdminRoute || isUserRoute)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If authenticated non-admin user has NOT completed onboarding:
  if (user && user.role !== 'MAIN_ADMIN' && user.onboardingCompleted === false) {
    // Force redirect to /onboarding for any other route
    if (!isOnboardingRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    // Allow user on /onboarding
    return NextResponse.next();
  }

  // 3. If authenticated user HAS completed onboarding and attempts to visit /onboarding:
  if (user && user.onboardingCompleted !== false && isOnboardingRoute) {
    const role = user.role;
    const isStaffOrAdmin = role === 'MAIN_ADMIN' || (role === 'STAFF_ADMIN' && user.staffAdminStatus === 'APPROVED');
    return NextResponse.redirect(new URL(isStaffOrAdmin ? '/admin/dashboard' : '/dashboard', request.url));
  }

  // 4. If authenticated user attempts to visit /login or /register, redirect to their dashboard
  if (user && isAuthRoute) {
    const role = user.role;
    const isStaffOrAdmin = role === 'MAIN_ADMIN' || (role === 'STAFF_ADMIN' && user.staffAdminStatus === 'APPROVED');
    return NextResponse.redirect(new URL(isStaffOrAdmin ? '/admin/dashboard' : '/dashboard', request.url));
  }

  // 5. If non-admin attempts to access /admin routes, redirect to user /dashboard
  if (user && isAdminRoute) {
    const role = user.role;
    const isStaffOrAdmin = role === 'MAIN_ADMIN' || (role === 'STAFF_ADMIN' && user.staffAdminStatus === 'APPROVED');

    if (!isStaffOrAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/|auth/oauth-callback).*)',
  ],
};
