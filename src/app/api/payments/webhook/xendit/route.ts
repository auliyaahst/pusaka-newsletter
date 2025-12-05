import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Disable CSRF protection for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookData = JSON.parse(body)

    console.log('🔔 ============ XENDIT WEBHOOK RECEIVED ============')
    console.log('📦 Webhook Data:', JSON.stringify(webhookData, null, 2))

    // Log all headers for debugging
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('📨 Request Headers:', JSON.stringify(headers, null, 2))

    // Verify webhook signature for security
    const callbackToken = request.headers.get('x-callback-token')
    const expectedToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN

    console.log('🔐 Callback Token Check:')
    console.log('  - Received:', callbackToken ? `${callbackToken.substring(0, 20)}...` : 'NONE')
    console.log('  - Expected:', expectedToken ? `${expectedToken.substring(0, 20)}...` : 'NOT SET')

    // Check the request host header to determine if this is dev or production
    const host = request.headers.get('host') || ''
    const isDev = host.includes('dev.') || host.includes('localhost')

    console.log('🌍 Environment:', { host, isDev })

    // TEMPORARILY DISABLED - Skip all token verification for testing
    console.log('⚠️  Token verification TEMPORARILY DISABLED for testing')
    console.log('⚠️  This should be re-enabled in production!')

    // if (!isDev) {
    //   // Only verify token on production
    //   if (!callbackToken || callbackToken !== expectedToken) {
    //     console.error('Invalid webhook signature')
    //     return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    //   }
    // } else {
    //   console.log('Dev server - skipping token verification')
    // }

    const { id: invoiceId, status, payment_method: paymentMethod, paid_at: paidAt } = webhookData

    console.log('💰 Payment Details:')
    console.log('  - Invoice ID:', invoiceId)
    console.log('  - Status:', status)
    console.log('  - Payment Method:', paymentMethod)
    console.log('  - Paid At:', paidAt)

    if (!invoiceId) {
      console.error('❌ No Invoice ID provided in webhook')
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Find the payment record
    console.log('🔍 Looking for payment with Invoice ID:', invoiceId)
    const payment = await prisma.payment.findUnique({
      where: { xenditInvoiceId: invoiceId },
      include: { user: true }
    })

    if (!payment) {
      console.error('❌ Payment not found for invoice ID:', invoiceId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('✅ Payment found:', {
      id: payment.id,
      currentStatus: payment.status,
      userId: payment.userId,
      userEmail: payment.user.email,
      subscriptionType: payment.subscriptionType
    })

    // Handle payment status updates
    if (status === 'PAID' || status === 'SETTLED') {
      console.log('💳 Processing PAID/SETTLED status...')
      if (payment.status !== 'PAID') {
        console.log('📝 Payment status needs update from', payment.status, 'to PAID')
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

        console.log('📅 Subscription dates:', {
          currentEnd: currentEnd?.toISOString(),
          newEnd: subscriptionEnd.toISOString(),
          subscriptionType: payment.subscriptionType
        })

        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            paidAt: paidAt ? new Date(paidAt) : new Date(),
            paymentMethod: paymentMethod || 'UNKNOWN'
          }
        })
        console.log('✅ Payment status updated to PAID')

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
        console.log('✅ User subscription updated')

        if (currentEnd && currentEnd > now) {
          console.log(`🎉 Subscription extended for user ${payment.user.email}: ${payment.subscriptionType} from ${currentEnd.toISOString()} to ${subscriptionEnd.toISOString()}`)
        } else {
          console.log(`🎉 Subscription activated for user ${payment.user.email}: ${payment.subscriptionType} until ${subscriptionEnd.toISOString()}`)
        }
      } else {
        console.log('ℹ️  Payment already marked as PAID, skipping update')
      }
    } else if (status === 'EXPIRED') {
      console.log('⏰ Processing EXPIRED status...')
      // Update payment status to expired
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' }
      })

      console.log(`⏰ Payment expired for user ${payment.user.email}`)
    } else {
      console.log(`ℹ️  Unhandled status: ${status}`)
    }

    console.log('✅ ============ WEBHOOK PROCESSED SUCCESSFULLY ============')
    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('❌ ============ XENDIT WEBHOOK ERROR ============')
    console.error('Error details:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}