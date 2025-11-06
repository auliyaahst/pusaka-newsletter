import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { XenditService } from '@/lib/xendit'

const subscriptionPlans = {
  monthly: {
    name: 'Monthly Plan',
    price: 99000,
    currency: 'IDR',
    duration: 30,
    type: 'MONTHLY'
  },
  quarterly: {
    name: 'Quarterly Plan',
    price: 249000,
    currency: 'IDR',
    duration: 90,
    type: 'QUARTERLY'
  },
  annually: {
    name: 'Annual Plan',
    price: 899000,
    currency: 'IDR',
    duration: 365,
    type: 'ANNUALLY'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, userEmail, paymentMethod } = await request.json()

    if (!planId || !subscriptionPlans[planId as keyof typeof subscriptionPlans]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
    
    // Map payment method to Xendit format
    const getPaymentMethods = (method?: string) => {
      if (!method) {
        return ['CREDIT_CARD', 'OVO', 'DANA', 'GOPAY', 'LINKAJA', 'SHOPEEPAY', 'QRIS']
      }
      
      switch (method) {
        case 'credit_card':
          return ['CREDIT_CARD']
        case 'ovo':
          return ['OVO']
        case 'gopay':
          return ['GOPAY']  
        case 'dana':
          return ['DANA']
        case 'shopeepay':
          return ['SHOPEEPAY']
        case 'qris':
          return ['QRIS']
        default:
          return ['CREDIT_CARD', 'OVO', 'DANA', 'GOPAY', 'LINKAJA', 'SHOPEEPAY', 'QRIS']
      }
    }
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create Xendit invoice
    const xenditService = new XenditService()
    const selectedPaymentMethods = getPaymentMethods(paymentMethod)
    
    const invoiceData = {
      externalId: `subscription-${user.id}-${Date.now()}`,
      amount: plan.price,
      description: `${plan.name} - The Pusaka Newsletter Subscription`,
      payerEmail: user.email,
      successRedirectUrl: `${process.env.NEXTAUTH_URL}/subscription/success`,
      failureRedirectUrl: `${process.env.NEXTAUTH_URL}/subscription/failed`,
      customerName: user.name || user.email,
      currency: plan.currency,
      paymentMethods: selectedPaymentMethods
    }

    const invoice = await xenditService.createInvoice(invoiceData, selectedPaymentMethods)

    if (!invoice.success || !invoice.invoice || !invoice.invoice.id) {
      return NextResponse.json({ 
        error: 'Failed to create payment invoice',
        details: invoice.error 
      }, { status: 500 })
    }

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'PENDING',
        xenditInvoiceId: invoice.invoice.id,
        externalId: invoiceData.externalId,
        subscriptionType: plan.type as 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY',
        invoiceUrl: invoice.paymentUrl
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: invoice.paymentUrl,
      invoiceId: invoice.invoice.id
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
