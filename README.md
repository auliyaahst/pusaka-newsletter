# The Pusaka Newsletter - Pricing & Payment Integration

A comprehensive newsletter subscription platform with Xendit payment integration and free trial functionality.

## Features

- 🎯 **Free 3-Month Trial** - New users get full access for 3 months
- 💳 **Xendit Payment Integration** - Secure payment processing for Indonesian market
- 📊 **Subscription Management** - Track subscription status and renewal dates
- 🎨 **Beautiful Pricing Page** - Modern, responsive pricing tiers
- ⚡ **Real-time Webhooks** - Automatic subscription activation via Xendit webhooks
- 🔐 **NextAuth Integration** - Secure authentication with multiple providers

## Subscription Plans

### Free Trial
- **Duration**: 3 months
- **Price**: Free
- **Features**: Full access to all newsletter content
- **Availability**: One-time per user

### Paid Plans
- **Monthly**: IDR 99,000/month
- **Quarterly**: IDR 249,000 (16% savings)
- **Annual**: IDR 899,000 (24% savings)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Xendit API
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your configuration:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pusaka_newsletter"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Xendit Configuration
XENDIT_SECRET_KEY="xnd_development_..."
XENDIT_PUBLIC_KEY="xnd_public_development_..."
XENDIT_WEBHOOK_TOKEN="your-webhook-token"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Database Setup

1. Install PostgreSQL and create a database
2. Update the `DATABASE_URL` in your `.env.local`
3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Generate Prisma client:

```bash
npx prisma generate
```

### 3. Xendit Configuration

1. Sign up for a [Xendit account](https://xendit.co)
2. Get your API keys from the Xendit dashboard
3. Set up webhooks in Xendit dashboard:
   - Webhook URL: `https://yourdomain.com/api/xendit-webhook`
   - Events: `invoice.paid`, `invoice.expired`, `invoice.failed`
   - Set the webhook token in your environment variables

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## API Endpoints

### Payment APIs
- `POST /api/payments/create-subscription` - Create Xendit payment invoice
- `POST /api/start-trial` - Start 3-month free trial
- `POST /api/xendit-webhook` - Handle Xendit payment confirmations
- `GET /api/subscription-status` - Get user subscription details

## Payment Flow

1. **User selects plan** on pricing page
2. **Free trial**: Immediately activated, no payment required
3. **Paid plans**: 
   - Creates Xendit invoice via API
   - Redirects user to Xendit payment page
   - User completes payment
   - Xendit sends webhook to confirm payment
   - Subscription automatically activated

## Security Features

- ✅ Webhook signature verification
- ✅ User authentication required for all payment APIs
- ✅ CSRF protection with NextAuth
- ✅ SQL injection prevention with Prisma
- ✅ Input validation and sanitization

## Development

### Testing Payments

Use Xendit's test mode:
- Test API keys start with `xnd_development_`
- Use test payment methods provided by Xendit
- No real money is charged in development mode

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@thepusaka.id
- Xendit documentation: https://developers.xendit.co/

## License

MIT License - see LICENSE file for details
