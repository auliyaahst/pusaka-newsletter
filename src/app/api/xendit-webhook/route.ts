import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-callback-token');

    // Verify webhook signature (optional but recommended)
    if (process.env.XENDIT_WEBHOOK_TOKEN && signature !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    
    // Handle invoice paid event
    if (data.status === 'PAID') {
      const payment = await prisma.payment.findUnique({
        where: { xenditInvoiceId: data.id },
        include: { user: true }
      });

      if (!payment) {
        console.error('Payment not found for invoice:', data.id);
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paymentMethod: data.payment_method || null,
          paidAt: new Date(data.paid_at),
        },
      });

      // Calculate subscription dates based on subscription type
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();

      switch (payment.subscriptionType) {
        case 'MONTHLY':
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
          break;
        case 'QUARTERLY':
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 3);
          break;
        case 'HALF_YEARLY':
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 6);
          break;
        case 'ANNUALLY':
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
          break;
        default:
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      // Update user subscription
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionType: payment.subscriptionType,
          subscriptionStart: subscriptionStart,
          subscriptionEnd: subscriptionEnd,
          isActive: true,
        },
      });

      console.log(`Payment confirmed for user ${payment.user.email}, subscription updated`);
    }

    // Handle other invoice statuses
    if (data.status === 'EXPIRED' || data.status === 'FAILED') {
      await prisma.payment.updateMany({
        where: { xenditInvoiceId: data.id },
        data: {
          status: data.status === 'EXPIRED' ? 'EXPIRED' : 'FAILED',
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}