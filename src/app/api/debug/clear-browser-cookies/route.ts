import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing all browser cookies...')
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'All cookies cleared - refresh the page'
    })
    
    // Get all possible NextAuth cookie names
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token', 
      '__Host-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'authjs.csrf-token',
      '__Secure-authjs.csrf-token',
      'next-auth.pkce.code_verifier'
    ]
    
    // Clear all cookies with multiple domain/path combinations
    for (const cookieName of cookiesToClear) {
      // Clear for current domain
      response.cookies.delete(cookieName)
      
      // Clear with explicit settings
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: undefined,
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      })
      
      // Clear without httpOnly (for JS accessible cookies)  
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: undefined,
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
      })
      
      // Clear for localhost specifically
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost',
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      })
    }
    
    // Add cache control headers to prevent cached responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    console.log('🍪 All cookies cleared with multiple strategies')
    
    return response
    
  } catch (error) {
    console.error('❌ Error clearing cookies:', error)
    return NextResponse.json(
      { error: 'Failed to clear cookies', details: error },
      { status: 500 }
    )
  }
}
