import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { XenditService } from '@/lib/xendit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a test invoice to see what payment methods are available
    const xenditService = new XenditService()
    const testInvoiceData = {
      externalId: `test-${Date.now()}`,
      amount: 99000,
      description: 'Test invoice to check payment methods',
      payerEmail: session.user.email,
      successRedirectUrl: `${process.env.NEXTAUTH_URL}/subscription/success`,
      failureRedirectUrl: `${process.env.NEXTAUTH_URL}/subscription/failed`,
      customerName: session.user.name || session.user.email,
      currency: 'IDR',
      paymentMethods: ['CREDIT_CARD', 'OVO', 'DANA', 'GOPAY', 'LINKAJA', 'SHOPEEPAY', 'QRIS']
    }

    const invoice = await xenditService.createInvoice(testInvoiceData)

    if (!invoice.success || !invoice.invoice) {
      return NextResponse.json({ 
        error: 'Failed to create test invoice',
        details: invoice.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.invoice.id,
        paymentUrl: invoice.paymentUrl,
        status: invoice.invoice.status,
        amount: invoice.invoice.amount,
        currency: invoice.invoice.currency,
        description: invoice.invoice.description
      }
    })

  } catch (error) {
    console.error('Error creating test invoice:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
