import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/complaints');

  // 1. Check local database session cookie
  const localCookie = request.cookies.get('scms_session')?.value;
  if (localCookie) {
    try {
      const decoded = Buffer.from(localCookie, 'base64').toString('utf8');
      const user = JSON.parse(decoded);

      if (isAuthRoute) {
        return NextResponse.redirect(
          new URL(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', request.url)
        );
      }

      if (isAdminRoute && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Admins manage complaints and cannot file complaints
      if (user.role === 'admin' && pathname === '/complaints/new') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      return NextResponse.next();
    } catch {
      // Invalid cookie, proceed
    }
  }

  // 2. Supabase Cloud check
  try {
    const { response, supabase, user } = await updateSession(request);

    if (!user && (isAdminRoute || isUserRoute)) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (user && isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware auth check error:', error);
    if (!localCookie && (isAdminRoute || isUserRoute)) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
