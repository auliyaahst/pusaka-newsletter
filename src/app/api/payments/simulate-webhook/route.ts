import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId, action } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json({ error: 'Payment ID and action are required' }, { status: 400 })
    }

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (action === 'complete') {
      if (payment.status === 'PAID') {
        return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
      }

      // Get user's current subscription end date
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
        select: { subscriptionEnd: true }
      })
      
      // Calculate new subscription end date
      const now = new Date()
      const currentEnd = user?.subscriptionEnd ? new Date(user.subscriptionEnd) : null
      const startDate = currentEnd && currentEnd > now ? currentEnd : now
      
      const subscriptionEnd = new Date(startDate)
      
      // Add subscription duration based on type
      switch (payment.subscriptionType) {
        case 'MONTHLY':
          subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)
          break
        case 'QUARTERLY':
          subscriptionEnd.setDate(subscriptionEnd.getDate() + 90)
          break
        case 'ANNUALLY':
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1)
          break
        default:
          subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod: 'SIMULATED_SUCCESS'
        }
      })

      // Update user subscription
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionType: payment.subscriptionType,
          subscriptionEnd: subscriptionEnd,
          trialUsed: true,
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment completed successfully',
        subscriptionEnd: subscriptionEnd.toISOString(),
        subscriptionType: payment.subscriptionType
      })

    } else if (action === 'expire') {
      if (payment.status === 'EXPIRED') {
        return NextResponse.json({ error: 'Payment already expired' }, { status: 400 })
      }

      // Update payment status to expired
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment marked as expired'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action. Use "complete" or "expire"' }, { status: 400 })
    }

  } catch (error) {
    console.error('Simulate webhook error:', error)
    return NextResponse.json({ 
      error: 'Failed to simulate webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
