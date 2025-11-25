import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Session Debug - NextAuth session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      isActive: session?.user?.isActive
    })

    let dbUser = null
    if (session?.user?.email) {
      // Check if user exists in database
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          isActive: true, 
          isVerified: true,
          createdAt: true
        }
      })
      
      console.log('🔍 Session Debug - DB user:', {
        userExists: !!dbUser,
        dbUserId: dbUser?.id,
        dbUserEmail: dbUser?.email,
        dbUserRole: dbUser?.role,
        dbUserActive: dbUser?.isActive
      })
    }

    // Get NextAuth session and account data
    const sessionData = session?.user?.email ? await prisma.session.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    }) : []

    const accountData = session?.user?.email ? await prisma.account.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      select: {
        provider: true,
        type: true,
        userId: true
      }
    }) : []

    return NextResponse.json({
      session: {
        exists: !!session,
        user: session?.user ?? null
      },
      database: {
        userExists: !!dbUser,
        user: dbUser
      },
      nextAuthData: {
        sessions: sessionData,
        accounts: accountData
      },
      validation: {
        isValid: !!(session && dbUser?.isActive),
        issues: [
          ...(session && !dbUser ? ['Session exists but user not in database'] : []),
          ...(session && dbUser && !dbUser.isActive ? ['User exists but is inactive'] : []),
          ...(session && !session.user?.id ? ['Session missing user ID'] : []),
          ...(session && !session.user?.email ? ['Session missing user email'] : [])
        ]
      }
    })
  } catch (error) {
    console.error('❌ Session debug error:', error)
    return NextResponse.json(
      { error: 'Failed to debug session', details: error },
      { status: 500 }
    )
  }
}
