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
  const isPendingApprovalRoute = pathname.startsWith('/pending-approval');
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/complaints');

  const token = request.cookies.get('scms_access_token')?.value;
  const user = token ? decodeJwtPayload(token) : null;

  const isStaffOrAdmin =
    user &&
    (user.role === 'MAIN_ADMIN' ||
      (user.role === 'STAFF_ADMIN' && user.staffAdminStatus === 'APPROVED'));
  const isPending = user && user.staffAdminStatus === 'PENDING';

  // 1. If unauthenticated user attempts to access protected routes, redirect to /login
  if (!user && (isOnboardingRoute || isPendingApprovalRoute || isAdminRoute || isUserRoute)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If authenticated non-admin user has NOT completed onboarding:
  if (user && user.role !== 'MAIN_ADMIN' && user.onboardingCompleted === false) {
    if (!isOnboardingRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.next();
  }

  // 3. If authenticated user has PENDING staff admin status:
  if (user && isPending) {
    if (!isPendingApprovalRoute) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.next();
  }

  // 4. If non-pending user attempts to visit /pending-approval:
  if (user && !isPending && isPendingApprovalRoute) {
    return NextResponse.redirect(
      new URL(isStaffOrAdmin ? '/admin/dashboard' : '/dashboard', request.url)
    );
  }

  // 5. If authenticated user HAS completed onboarding and attempts to visit /onboarding:
  if (user && user.onboardingCompleted !== false && isOnboardingRoute) {
    if (isPending) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.redirect(
      new URL(isStaffOrAdmin ? '/admin/dashboard' : '/dashboard', request.url)
    );
  }

  // 6. If authenticated user attempts to visit /login or /register, redirect to appropriate destination
  if (user && isAuthRoute) {
    if (user.role !== 'MAIN_ADMIN' && user.onboardingCompleted === false) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    if (isPending) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.redirect(
      new URL(isStaffOrAdmin ? '/admin/dashboard' : '/dashboard', request.url)
    );
  }

  // 7. If non-admin attempts to access /admin routes:
  if (user && isAdminRoute && !isStaffOrAdmin) {
    if (isPending) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 8. If approved Admin explicitly navigates to /dashboard, redirect to /admin/dashboard
  if (user && isStaffOrAdmin && pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/|auth/oauth-callback).*)',
  ],
};
