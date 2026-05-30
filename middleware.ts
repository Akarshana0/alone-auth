import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We use client-side Firebase Auth guarding in AuthGuard component.
  // Next.js middleware runs on edge, which doesn't have access to Firebase client auth state.
  // The actual protection is handled by components/auth/AuthGuard.tsx wrapping the dashboard.

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
