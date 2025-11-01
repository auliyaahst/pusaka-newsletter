# Xendit Payment Integration for Subscription Management

This document describes the Xendit payment integration implemented for The Pusaka Newsletter subscription system.

## Features Implemented

### 🚀 Complete Subscription System
- **Three Subscription Plans**: Monthly (IDR 99,000), Quarterly (IDR 249,000), Annual (IDR 899,000)
- **Multiple Payment Methods**: Credit Card, E-Wallet (OVO, GoPay, DANA), QR Code (QRIS)
- **Automatic Subscription Management**: Automatic activation upon payment completion
- **Payment Status Tracking**: Real-time payment verification and status updates

### 🎯 User Interface
- **Subscription Page**: Beautiful subscription plans with pricing and features comparison
- **Navigation Integration**: Added "Subscription" menu item to all dashboard hamburger menus
- **Payment Success/Failed Pages**: Dedicated pages for payment completion flows
- **Subscription Status Widget**: Component to display current subscription status

### 🔧 Technical Implementation

#### API Endpoints
- `POST /api/payments/create-subscription` - Create new subscription payment
- `GET /api/user/subscription` - Get user's current subscription status
- `GET /api/payments/verify-payment` - Verify payment status with Xendit
- `POST /api/payments/webhook/xendit` - Handle Xendit webhook callbacks

#### Key Components
- **Xendit Service** (`/src/lib/xendit.ts`) - Payment processing service
- **Subscription Page** (`/src/app/subscription/page.tsx`) - Main subscription interface
- **Success/Failed Pages** - Payment completion flows
- **Subscription Status** (`/src/components/subscription/SubscriptionStatus.tsx`) - Status widget

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```env
XENDIT_SECRET_KEY=your_xendit_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Database Schema
The Payment model in your Prisma schema includes:

```prisma
model Payment {
  id               String            @id @default(cuid())
  userId           String
  xenditInvoiceId  String            @unique
  amount           Int               // Amount in cents
  currency         String            @default("IDR")
  status           PaymentStatus     @default(PENDING)
  subscriptionType SubscriptionType
  externalId       String            @unique
  invoiceUrl       String?
  paymentMethod    String?
  paidAt           DateTime?
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}
```

### 3. Xendit Webhook Configuration
Configure your Xendit webhook URL in the Xendit dashboard:
- Webhook URL: `https://yourdomain.com/api/payments/webhook/xendit`
- Events: Invoice paid, expired

## Usage

### For Users
1. **Access Subscription**: Click "Subscription" in any dashboard hamburger menu
2. **Choose Plan**: Select from Monthly, Quarterly, or Annual plans
3. **Payment**: Complete payment through Xendit payment gateway
4. **Automatic Activation**: Subscription activates automatically upon payment

### For Developers
```typescript
// Create a subscription payment
const response = await fetch('/api/payments/create-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: 'monthly', // or 'quarterly', 'annually'
    userEmail: 'user@example.com'
  })
})

// Check subscription status
const subscription = await fetch('/api/user/subscription')
const data = await subscription.json()
```

## Payment Flow

1. **User selects plan** → Subscription page
2. **Create invoice** → Xendit API creates payment invoice
3. **User pays** → Redirected to Xendit payment gateway
4. **Payment completion** → Webhook notifies our system
5. **Subscription activation** → User subscription status updated
6. **Confirmation** → User redirected to success page

## Subscription Plans

| Plan | Price | Duration | Features |
|------|-------|----------|----------|
| Monthly | IDR 99,000 | 30 days | Basic access, Monthly newsletter, Basic support |
| Quarterly | IDR 249,000 | 90 days | **Most Popular** - Priority support, Early access |
| Annual | IDR 899,000 | 365 days | Premium support, Exclusive webinars, Direct author contact |

## Security Features

- **Webhook Signature Verification**: Validates incoming webhooks from Xendit
- **Session-based Authentication**: Only authenticated users can create subscriptions
- **Payment Status Validation**: Double verification of payment status
- **Secure Redirects**: Proper success/failure redirect handling

## Navigation Integration

The subscription system is integrated into all dashboard pages:
- Main Dashboard (`/dashboard`)
- Admin Dashboard (`/dashboard/admin`)
- Editorial Dashboard (`/dashboard/editorial`)
- Publisher Dashboard (`/dashboard/publisher`)

Each includes a "Subscription" menu item in the profile dropdown for easy access.

## Error Handling

- **Payment Failed**: Users see helpful error messages and alternative payment methods
- **Expired Payments**: Automatic status updates and user notifications
- **Network Issues**: Graceful error handling with retry options

## Testing

Use Xendit test keys for development:
- Test payments will show Xendit test mode warnings
- Use test card numbers for payment testing
- Webhook testing can be done with ngrok for local development

## Support

For implementation questions or issues:
- Check the API endpoint responses for detailed error messages
- Review webhook logs for payment processing issues
- Test with Xendit sandbox environment first

## Files Created/Modified

### New Files
- `/src/app/subscription/page.tsx` - Main subscription interface
- `/src/app/subscription/success/page.tsx` - Payment success page
- `/src/app/subscription/failed/page.tsx` - Payment failed page
- `/src/app/api/payments/create-subscription/route.ts` - Create subscription API
- `/src/app/api/payments/verify-payment/route.ts` - Payment verification API
- `/src/app/api/payments/webhook/xendit/route.ts` - Xendit webhook handler
- `/src/app/api/user/subscription/route.ts` - User subscription status API
- `/src/components/subscription/SubscriptionStatus.tsx` - Status widget
- `/src/lib/subscription.ts` - Subscription utilities

### Modified Files
- `/src/app/dashboard/page.tsx` - Added subscription menu item
- `/src/app/dashboard/admin/page.tsx` - Added subscription menu item
- `/src/app/dashboard/editorial/page.tsx` - Added subscription menu item
- `/src/app/dashboard/publisher/page.tsx` - Added subscription menu item
- `/src/lib/xendit.ts` - Updated for proper API integration

This integration provides a complete, production-ready subscription system with Xendit payment processing for The Pusaka Newsletter platform.
