import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Public routes
const publicRoutes = ['/', '/login', '/register', '/doctors', '/about', '/contact', '/unauthorized'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // ✅ Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // ✅ If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Let the client-side handle role-based access
  // Middleware will only check authentication, not authorization
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/appointment',
    '/appointments',
    '/records',
    '/my-doctors',
    '/settings',
  ],
};