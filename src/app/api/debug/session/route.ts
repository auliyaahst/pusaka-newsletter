import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Also check database user
    let dbUser = null
    if (session?.user?.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isVerified: true,
          accounts: {
            select: {
              provider: true,
              type: true
            }
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      session: session,
      databaseUser: dbUser,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get session',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}