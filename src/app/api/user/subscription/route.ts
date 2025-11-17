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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionType: true,
        subscriptionEnd: true,
        // payments: {
        //   orderBy: { createdAt: 'desc' },
        //   take: 5,
        //   select: {
        //     id: true,
        //     amount: true,
        //     status: true,
        //     createdAt: true,
        //     xenditInvoiceId: true,
        //   }
        // }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isActive = user.subscriptionEnd ? new Date(user.subscriptionEnd) > new Date() : false

    return NextResponse.json({
      subscriptionType: user.subscriptionType,
      subscriptionEnd: user.subscriptionEnd,
      isActive,
      // payments: user.payments
    })

  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
