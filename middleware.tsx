// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export default withAuth(
  function middleware(req) {
    // Add subscription check logic here
    const token = req.nextauth.token;
    
    // Check if user has active subscription for premium content
    if (req.nextUrl.pathname.startsWith('/premium')) {
      if (!token?.subscriptionType || token.subscriptionType === 'FREE_TRIAL') {
        return NextResponse.redirect(new URL('/pricing', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/premium/:path*']
};