# Xendit Webhook Setup Guide

## Issues Fixed

### 1. ✅ Subscription Extension Logic
**Problem:** When a user with an active subscription or free trial purchased a new subscription, the new subscription would **replace** the existing one instead of **extending** it.

**Solution:** Updated all webhook and payment verification endpoints to:
- Check if user has an existing subscription end date
- If the subscription is still active (end date > today), extend from that date
- If no subscription or expired, start from today

**Files Updated:**
- `/src/app/api/payments/webhook/xendit/route.ts`
- `/src/app/api/payments/verify-payment/route.ts`
- `/src/app/api/xendit-webhook/route.ts`

### 2. ⚠️ Webhook URL Configuration Required

**Problem:** The Xendit webhook URL is not configured in your Xendit Dashboard (showing "URL not set" in the screenshot).

## How to Configure Xendit Webhook

### Step 1: Determine Your Webhook URL

**For Development (localhost):**
You'll need to use a tunneling service like ngrok:
```bash
# Install ngrok if you haven't
brew install ngrok

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
# Your webhook URL will be: https://abc123.ngrok.io/api/payments/webhook/xendit
```

**For Production:**
```
https://dev.thepusaka.id/api/payments/webhook/xendit
```

### Step 2: Configure in Xendit Dashboard

1. **Login to Xendit Dashboard**: https://dashboard.xendit.co
2. **Navigate to Webhooks**:
   - Click on **"Developers"** in the left sidebar
   - Click on **"Webhooks"**
   - Or go directly to: https://dashboard.xendit.co/webhooks

3. **Add New Webhook**:
   - Click **"+ Add Webhook"** or **"Log Webhook"**
   - Enter your webhook URL (see Step 1)
   - For example: `https://dev.thepusaka.id/api/payments/webhook/xendit`

4. **Select Events**:
   - ✅ `invoice.paid` - When customer completes payment
   - ✅ `invoice.expired` - When invoice expires
   - ✅ `invoice.settled` - When payment is settled (confirmed)

5. **Set Callback Token** (already in your .env):
   - The token is already set in your `.env` file
   - Make sure it matches: `No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg`
   - This is used to verify webhook authenticity

6. **Save Configuration**

### Step 3: Test the Webhook

1. **Using Xendit Dashboard**:
   - Go to the Webhooks page
   - Click on your webhook
   - Click **"Test"** or **"Send Test Event"**
   - Check your application logs for webhook received

2. **Make a Test Payment**:
   - Go to your subscription page
   - Select a plan
   - Use Xendit test card numbers (if in test mode)
   - Complete the payment
   - Check logs to see webhook processing

### Step 4: Verify It's Working

Check your application logs for messages like:
```
Xendit webhook received: { ... }
Subscription activated for user test@example.com: MONTHLY until 2025-12-17...
```

Or for subscription extensions:
```
Subscription extended for user test@example.com: MONTHLY from 2025-11-30 to 2025-12-30
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Xendit Keys
XENDIT_SECRET_KEY="xnd_development_..."
XENDIT_PUBLIC_KEY="xnd_public_development_..."

# Webhook Verification Tokens (both use the same value)
XENDIT_WEBHOOK_TOKEN="No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg"
XENDIT_WEBHOOK_VERIFICATION_TOKEN="No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg"
```

## Testing Subscription Extension

### Scenario 1: User with Free Trial
1. User signs up and gets 7-day free trial (expires Nov 24, 2025)
2. User purchases Monthly subscription on Nov 20
3. **Before fix**: Subscription ends Dec 20 (trial period wasted)
4. **After fix**: Subscription ends Dec 24 (extends from trial end)

### Scenario 2: User Renews Early
1. User has Monthly subscription (expires Dec 10, 2025)
2. User purchases another Monthly on Dec 1
3. **Before fix**: New subscription ends Jan 1 (10 days wasted)
4. **After fix**: New subscription ends Jan 10 (extends from current end)

### Scenario 3: Expired Subscription
1. User's subscription expired Nov 1, 2025
2. User purchases Monthly on Nov 17
3. **Result**: Subscription ends Dec 17 (starts from today)

## Troubleshooting

### Webhook Not Receiving Data
- Check that webhook URL is publicly accessible
- For localhost, ensure ngrok is running
- Check firewall settings
- Verify URL is correct in Xendit Dashboard

### Webhook Returns 401 Error
- Check that `XENDIT_WEBHOOK_VERIFICATION_TOKEN` matches the token in Xendit Dashboard
- Verify the token in `.env` is correct

### Subscription Not Extending
- Check application logs for errors
- Verify database has correct `subscriptionEnd` values
- Test with a simple payment to see the extension logic

### Webhook Events Not Listed
- Make sure you saved the webhook configuration
- Check that events are enabled in Xendit Dashboard
- Try deleting and recreating the webhook

## Production Checklist

Before going to production:
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure webhook URL with production domain
- [ ] Switch from `xnd_development_*` keys to `xnd_production_*` keys
- [ ] Test webhook with real payment
- [ ] Set up webhook monitoring/logging
- [ ] Document webhook callback token securely
- [ ] Enable webhook signature verification (already enabled in code)

## Additional Resources

- [Xendit Webhook Documentation](https://developers.xendit.co/api-reference/#webhooks)
- [Xendit Invoice API](https://developers.xendit.co/api-reference/#invoice)
- [ngrok Documentation](https://ngrok.com/docs)
