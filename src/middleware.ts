import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection middleware.
 * Redirects unauthenticated users to the login page.
 *
 * Note: iron-session doesn't support edge runtime middleware natively,
 * so we check for the session cookie's existence as a lightweight guard.
 * Actual session validation happens in the API routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ['/dashboard'];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('bgi-session');

    if (!sessionCookie) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === '/') {
    const sessionCookie = request.cookies.get('bgi-session');
    if (sessionCookie) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
