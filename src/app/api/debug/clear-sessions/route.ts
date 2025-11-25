import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()

    if (action === 'clear_sessions') {
      // Clear all sessions
      await prisma.session.deleteMany()
      console.log('✅ All sessions cleared from database')
      
      return NextResponse.json({ 
        success: true, 
        message: 'All sessions cleared successfully' 
      })
    }

    if (action === 'clear_user_session' && email) {
      // Clear sessions for specific user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (user) {
        await prisma.session.deleteMany({
          where: { userId: user.id }
        })
        console.log(`✅ Sessions cleared for user: ${email}`)
        
        return NextResponse.json({ 
          success: true, 
          message: `Sessions cleared for ${email}` 
        })
      } else {
        return NextResponse.json({ 
          error: 'User not found' 
        }, { status: 404 })
      }
    }

    if (action === 'check_user' && email) {
      // Check if user exists and their status
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isVerified: true
        }
      })

      if (user) {
        return NextResponse.json({ 
          success: true, 
          user 
        })
      } else {
        return NextResponse.json({ 
          success: false,
          message: 'User not found in database',
          email
        })
      }
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use clear_sessions, clear_user_session, or check_user' 
    }, { status: 400 })

  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json({ 
      error: 'Failed to clear sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
