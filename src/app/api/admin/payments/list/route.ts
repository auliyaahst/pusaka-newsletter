import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (you might want to add proper admin check)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all payments with user details
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to 50 most recent payments
    })

    return NextResponse.json({
      success: true,
      payments
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
