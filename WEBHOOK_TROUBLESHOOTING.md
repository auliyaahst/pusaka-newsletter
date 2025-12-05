# Xendit Webhook Not Working - Solutions

## Problem
Payments are stuck in "PENDING" status because Xendit webhooks are not being received by the server.

## Root Causes

### 1. **Webhook URL Not Configured in Xendit**
The most common reason - you need to register your webhook URL in Xendit Dashboard.

### 2. **Using TEST Mode**
Test and Live environments have separate webhook configurations.

### 3. **Server Not Accessible**
Webhook URL must be publicly accessible by Xendit servers.

---

## Solutions

### Solution 1: Configure Xendit Webhook (PRIMARY FIX)

1. **Go to Xendit Dashboard:**
   - Login at https://dashboard.xendit.co
   - Navigate to **Settings** → **Webhooks** → **Callbacks**

2. **Add Webhook URL:**
   ```
   https://dev.thepusaka.id/api/payments/webhook/xendit
   ```

3. **Set Verification Token:**
   - Copy your `XENDIT_WEBHOOK_VERIFICATION_TOKEN` from `.env`
   - Paste it in the webhook configuration

4. **Select Events:**
   - Enable: `invoice.paid`
   - Enable: `invoice.expired`

5. **Test the Webhook:**
   - Use Xendit's "Send Test" button
   - Check your server logs for webhook receipt

---

### Solution 2: Verify Webhook is Publicly Accessible

Test if Xendit can reach your webhook:

```bash
# From external server or use online tools like webhook.site
curl -X POST https://dev.thepusaka.id/api/payments/webhook/xendit \
  -H "Content-Type: application/json" \
  -H "x-callback-token: YOUR_TOKEN_HERE" \
  -d '{
    "id": "test-invoice-id",
    "status": "PAID",
    "payment_method": "CREDIT_CARD",
    "paid_at": "2025-12-05T10:00:00Z"
  }'
```

---

### Solution 3: Process Existing Pending Payments Manually

**Option A: Use the Script (Recommended)**

```bash
# Run the script to process all pending payments
npx tsx scripts/process-pending-payments.ts
```

**Option B: Use Simulate Webhook API**

For each pending payment in Prisma Studio:

```bash
# Replace PAYMENT_ID with actual payment ID
curl -X POST https://dev.thepusaka.id/api/payments/simulate-webhook \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "paymentId": "PAYMENT_ID",
    "action": "complete"
  }'
```

**Option C: Update Directly in Database (Not Recommended)**

Only use if you can't access the API:

```sql
-- Update payment status
UPDATE "Payment" 
SET 
  "status" = 'PAID',
  "paidAt" = NOW(),
  "paymentMethod" = 'MANUAL_UPDATE'
WHERE "id" = 'YOUR_PAYMENT_ID';

-- Update user subscription
UPDATE "User"
SET 
  "subscriptionType" = 'MONTHLY',
  "subscriptionEnd" = NOW() + INTERVAL '30 days',
  "trialUsed" = true,
  "isActive" = true
WHERE "id" = 'USER_ID';
```

---

### Solution 4: Monitor Webhook Logs

After configuring webhooks, monitor the logs to ensure they're being received:

```bash
# Watch the logs
pm2 logs pusaka-dev --lines 100

# Look for these log messages:
# 🔔 ============ XENDIT WEBHOOK RECEIVED ============
# 📦 Webhook Data: ...
# ✅ ============ WEBHOOK PROCESSED SUCCESSFULLY ============
```

---

## Testing Webhook Flow

### 1. Create Test Payment

```bash
# Login to your dev site
# Navigate to subscription page
# Create a new payment
```

### 2. Complete Payment in Xendit

- Go to Xendit Dashboard → Invoices
- Find the test invoice
- Mark it as "Paid" (in test mode)

### 3. Check Webhook Receipt

```bash
pm2 logs pusaka-dev --lines 50 | grep "WEBHOOK"
```

### 4. Verify in Database

- Check Payment table - status should be "PAID"
- Check User table - subscription should be active

---

## Common Issues

### Issue 1: "Payment not found for invoice ID"

**Cause:** Invoice ID mismatch between Xendit and your database

**Solution:**
```typescript
// Check what invoice IDs are in your database
SELECT "xenditInvoiceId" FROM "Payment" WHERE "status" = 'PENDING';

// Compare with Xendit dashboard invoice IDs
```

### Issue 2: Webhook receives but doesn't process

**Cause:** Token verification failure (even though disabled)

**Solution:** Check webhook logs for errors in processing logic

### Issue 3: Multiple PENDING payments for same user

**Cause:** User creating multiple payments without completing

**Solution:** 
- Expire old pending payments
- Only allow one active payment per user

---

## Production Checklist

Before deploying to production:

- [ ] Webhook URL configured in Xendit (LIVE mode)
- [ ] Verification token matches between Xendit and `.env`
- [ ] Webhook events enabled: `invoice.paid`, `invoice.expired`
- [ ] Server is publicly accessible
- [ ] SSL certificate is valid
- [ ] Re-enable token verification (uncomment in route.ts)
- [ ] Test with real small payment
- [ ] Monitor logs for successful webhook processing

---

## Quick Commands

```bash
# Check pending payments
npx tsx scripts/check-payments.ts

# Process all pending
npx tsx scripts/process-pending-payments.ts

# Watch logs for webhooks
pm2 logs pusaka-dev | grep -A 10 "WEBHOOK"

# Restart app after webhook config
git pull origin dev
npm run build
pm2 restart pusaka-dev
```

---

## Contact Xendit Support

If webhooks still don't work after configuration:

1. Contact: support@xendit.co
2. Provide:
   - Your webhook URL
   - Sample invoice ID
   - Timestamp of test
   - Any error messages from Xendit dashboard

---

## Emergency: Manual Payment Processing

If you need to immediately activate a user's subscription:

```typescript
// scripts/manual-activate-subscription.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.user.update({
  where: { email: 'user@example.com' },
  data: {
    subscriptionType: 'MONTHLY',
    subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    trialUsed: true
  }
})

await prisma.payment.update({
  where: { id: 'PAYMENT_ID' },
  data: {
    status: 'PAID',
    paidAt: new Date(),
    paymentMethod: 'MANUAL_ACTIVATION'
  }
})
```
