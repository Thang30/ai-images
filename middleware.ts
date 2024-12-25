import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')
  
  // Redirect authenticated users away from auth page
  if (userEmail && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Protect generate route
  if (!userEmail && request.nextUrl.pathname.startsWith('/generate')) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/generate/:path*', '/auth']
} 