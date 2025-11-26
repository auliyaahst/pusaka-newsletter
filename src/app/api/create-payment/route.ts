import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscriptionType, amount } = await request.json();

    if (!subscriptionType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate unique external ID
    const externalId = `pusaka-${user.id}-${Date.now()}`;

    // Create Xendit invoice
    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: amount,
        currency: 'IDR',
        payer_email: user.email,
        description: `The Pusaka Newsletter - ${subscriptionType} Subscription`,
        invoice_duration: 86400, // 24 hours
        success_redirect_url: `${process.env.NEXTAUTH_URL}/payment-result?payment=success`,
        failure_redirect_url: `${process.env.NEXTAUTH_URL}/payment-result?payment=failed`,
        customer: {
          given_names: user.name || 'Subscriber',
          email: user.email,
        },
        customer_notification_preference: {
          invoice_created: ['email'],
          invoice_reminder: ['email'],
          invoice_paid: ['email'],
          invoice_expired: ['email']
        },
        items: [
          {
            name: `The Pusaka Newsletter - ${subscriptionType}`,
            quantity: 1,
            price: amount,
            category: 'Newsletter Subscription'
          }
        ]
      }),
    });

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.text();
      console.error('Xendit API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create payment invoice' },
        { status: 500 }
      );
    }

    const xenditData = await xenditResponse.json();

    // Save payment record to database
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        xenditInvoiceId: xenditData.id,
        amount: amount,
        currency: 'IDR',
        status: 'PENDING',
        subscriptionType: subscriptionType,
        externalId: externalId,
        invoiceUrl: xenditData.invoice_url,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      invoiceUrl: xenditData.invoice_url,
      externalId: externalId,
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
