import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/doctors', '/about', '/contact', '/unauthorized'];

const publicPrefixes = ['/api/auth', '/_next', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }
  if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/appointment/:path*',
    '/appointment',
    '/appointments/:path*',
    '/appointments',
    '/records/:path*',
    '/records',
    '/my-doctors/:path*',
    '/my-doctors',
    '/settings/:path*',
    '/settings',
    '/book-appointment/:path*',
    '/book-appointment',
  ],
};