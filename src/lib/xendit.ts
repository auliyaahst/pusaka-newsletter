import { Xendit } from 'xendit-node'

// Initialize Xendit with your secret key
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || '',
})

export interface PaymentData {
  amount: number
  currency: string
  externalId: string
  payerEmail: string
  description: string
  successRedirectUrl: string
  failureRedirectUrl: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  duration: number // in days
  features: string[]
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 99000, // IDR 99,000
    currency: 'IDR',
    duration: 30,
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Basic support',
      'Download PDF articles'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 249000, // IDR 249,000 (save 16%)
    currency: 'IDR',
    duration: 90,
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Early access to new content'
    ]
  },
  {
    id: 'annually',
    name: 'Annual Plan',
    price: 899000, // IDR 899,000 (save 24%)
    currency: 'IDR',
    duration: 365,
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Premium support',
      'Download PDF articles',
      'Early access to new content',
      'Exclusive webinars',
      'Direct author contact'
    ]
  }
]

export class XenditService {
  private xendit: Xendit

  constructor() {
    this.xendit = xendit
  }

  // Create payment invoice with specific payment method
  async createInvoice(paymentData: PaymentData, specificPaymentMethods?: string[]) {
    try {
      // Use specific payment methods if provided, otherwise use all available methods
      const paymentMethods = specificPaymentMethods || [
        'CREDIT_CARD',
        'BCA',
        'BNI', 
        'BRI',
        'MANDIRI',
        'PERMATA',
        'OVO',
        'DANA',
        'GOPAY',
        'LINKAJA',
        'SHOPEEPAY',
        'QRIS'
      ]

      const invoiceRequest = {
        data: {
          externalId: paymentData.externalId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          payerEmail: paymentData.payerEmail,
          description: paymentData.description,
          successRedirectUrl: paymentData.successRedirectUrl,
          failureRedirectUrl: paymentData.failureRedirectUrl,
          invoiceDuration: 86400, // 24 hours
          shouldSendEmail: true,
          paymentMethods: paymentMethods
        }
      }

      const invoice = await this.xendit.Invoice.createInvoice(invoiceRequest)

      return {
        success: true,
        invoice,
        paymentUrl: invoice.invoiceUrl || ''
      }
    } catch (error) {
      console.error('Xendit invoice creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment'
      }
    }
  }

  // Get invoice details
  async getInvoice(invoiceId: string) {
    try {
      const invoices = await this.xendit.Invoice.getInvoices({
        statuses: ['PENDING', 'PAID', 'SETTLED', 'EXPIRED'],
        limit: 100
      })

      // Find the specific invoice by ID
      const foundInvoice = invoices.find((inv) => inv.id === invoiceId)

      return {
        success: true,
        invoice: foundInvoice
      }
    } catch (error) {
      console.error('Xendit get invoice error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get invoice'
      }
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(_rawBody: string, _signature: string): boolean {
    try {
      // Xendit webhook verification logic
      // You'll need to implement this based on Xendit's webhook signature verification
      return true // Placeholder
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }
}

export const xenditService = new XenditService()
