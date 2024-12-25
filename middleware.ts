import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')
  
  // Redirect authenticated users away from auth page
  if (userEmail && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Protect all image-related routes
  if (!userEmail && (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/generate') ||
    request.nextUrl.pathname.startsWith('/gallery')
  )) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/generate/:path*', '/gallery/:path*', '/auth']
} 