import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { XenditService } from '@/lib/xendit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Get payment record from database
    const payment = await prisma.payment.findUnique({
      where: { xenditInvoiceId: invoiceId },
      include: { user: true }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify with Xendit
    const xenditService = new XenditService()
    const invoiceStatus = await xenditService.getInvoice(invoiceId)

    if (!invoiceStatus.success) {
      return NextResponse.json({ 
        error: 'Failed to verify payment with Xendit',
        details: invoiceStatus.error 
      }, { status: 500 })
    }

    const invoice = invoiceStatus.invoice
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found in Xendit' }, { status: 404 })
    }

    // Update payment status if needed
    if (invoice.status === 'PAID' || invoice.status === 'SETTLED') {
      if (payment.status !== 'PAID') {
        // Get user's current subscription end date
        const currentUser = await prisma.user.findUnique({
          where: { id: payment.userId },
          select: { subscriptionEnd: true }
        })
        
        // Calculate new subscription end date
        // If user has active subscription, extend from that date
        // Otherwise, start from today
        const now = new Date()
        const currentEnd = currentUser?.subscriptionEnd ? new Date(currentUser.subscriptionEnd) : null
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
            paymentMethod: invoice.paymentMethod || 'UNKNOWN'
          }
        })

        // Update user subscription
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            subscriptionType: payment.subscriptionType,
            subscriptionEnd: subscriptionEnd
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Payment verified and subscription activated',
          subscriptionEnd: subscriptionEnd.toISOString()
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        subscriptionEnd: payment.user.subscriptionEnd
      })
    }

    // Payment not completed yet
    if (invoice.status === 'PENDING') {
      return NextResponse.json({
        success: false,
        error: 'Payment is still pending'
      }, { status: 202 })
    }

    // Payment failed or expired
    if (invoice.status === 'EXPIRED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' }
      })

      return NextResponse.json({
        success: false,
        error: `Payment ${invoice.status.toLowerCase()}`
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown payment status'
    }, { status: 400 })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
