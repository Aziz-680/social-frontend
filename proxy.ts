import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = ['/feed', '/profile', '/friends', '/search'].some((route) =>
    path === route || path.startsWith(`${route}/`),
  );
  const isPublicAuthRoute = path === '/login' || path === '/register' || path === '/';

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicAuthRoute && token) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/feed',
    '/feed/:path*',
    '/profile',
    '/profile/:path*',
    '/friends',
    '/search',
  ],
};