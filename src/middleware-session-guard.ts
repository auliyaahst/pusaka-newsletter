import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  try {
    // Get the JWT token from the session
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // If there's a token, validate it's not corrupted
    if (token?.email) {
      // You could add additional validation here
      // For example, checking if user still exists in database
      
      // For now, just continue
      return NextResponse.next()
    }

    // If accessing protected routes without valid session, redirect to login
    const protectedRoutes = ['/dashboard', '/subscription', '/profile', '/editor']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

  } catch (error) {
    console.warn('Session validation error:', error)
    
    // Clear potentially corrupted session cookies
    const response = NextResponse.next()
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
