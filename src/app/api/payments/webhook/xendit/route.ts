import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookData = JSON.parse(body)
    
    console.log('Xendit webhook received:', webhookData)
    
    // Verify webhook signature for security
    const callbackToken = request.headers.get('x-callback-token')
    const expectedToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN
    
    // Only verify in production, skip in development for easier testing
    if (process.env.NODE_ENV === 'production') {
      if (!callbackToken || callbackToken !== expectedToken) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
      }
    }

    const { id: invoiceId, status, payment_method: paymentMethod, paid_at: paidAt } = webhookData

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { xenditInvoiceId: invoiceId },
      include: { user: true }
    })

    if (!payment) {
      console.log('Payment not found for invoice ID:', invoiceId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Handle payment status updates
    if (status === 'PAID' || status === 'SETTLED') {
      if (payment.status !== 'PAID') {
        // Get user's current subscription end date
        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
          select: { subscriptionEnd: true }
        })
        
        // Calculate new subscription end date
        // If user has active subscription, extend from that date
        // Otherwise, start from today
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
            paidAt: paidAt ? new Date(paidAt) : new Date(),
            paymentMethod: paymentMethod || 'UNKNOWN'
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

        if (currentEnd && currentEnd > now) {
          console.log(`Subscription extended for user ${payment.user.email}: ${payment.subscriptionType} from ${currentEnd.toISOString()} to ${subscriptionEnd.toISOString()}`)
        } else {
          console.log(`Subscription activated for user ${payment.user.email}: ${payment.subscriptionType} until ${subscriptionEnd.toISOString()}`)
        }
      }
    } else if (status === 'EXPIRED') {
      // Update payment status to expired
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' }
      })

      console.log(`Payment expired for user ${payment.user.email}`)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })

  } catch (error) {
    console.error('Xendit webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
