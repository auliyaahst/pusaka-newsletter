import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Force clearing all sessions and cookies...')
    
    // Clear all session-related data from NextAuth tables
    const deletedSessions = await prisma.session.deleteMany({})
    const deletedAccounts = await prisma.account.deleteMany({})
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({})
    
    console.log(`✅ Cleared ${deletedSessions.count} sessions`)
    console.log(`✅ Cleared ${deletedAccounts.count} accounts`)
    console.log(`✅ Cleared ${deletedVerificationTokens.count} verification tokens`)
    
    // Create response to clear NextAuth cookies
    const response = NextResponse.json({
      success: true,
      message: 'All sessions and cookies cleared',
      cleared: {
        sessions: deletedSessions.count,
        accounts: deletedAccounts.count,
        verificationTokens: deletedVerificationTokens.count
      }
    })
    
    // Clear all NextAuth-related cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'authjs.session-token',
      'authjs.csrf-token'
    ]
    
    for (const cookieName of cookiesToClear) {
      // Set cookie with past expiration date to delete it
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
      
      // Also try to clear without httpOnly flag
      response.cookies.set(cookieName, '', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
    }
    
    console.log('🍪 All NextAuth cookies cleared')
    console.log('🔒 Complete session cleanup finished')
    
    return response
    
  } catch (error) {
    console.error('❌ Error in force session cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to clear sessions', details: error },
      { status: 500 }
    )
  }
}
