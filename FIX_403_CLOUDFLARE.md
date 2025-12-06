# Fixing 403 Error - Cloudflare WAF Rule Configuration

## Problem
Xendit webhook is getting **403 Forbidden** with HTML response, which means Cloudflare's WAF is still blocking it even though you created a rule.

## Root Cause
The WAF rule might not be matching the exact path or the rule configuration is incomplete.

## Solution: Fix the Cloudflare WAF Rule

### Step 1: Edit Your Existing WAF Rule

1. Go to https://dash.cloudflare.com
2. Select **thepusaka.id** domain
3. Go to **Security** → **WAF** → **Custom rules**
4. Click on **"Allow Xendit Webhooks"** rule (the one you created)

### Step 2: Verify Rule Configuration

Make sure your rule is configured **EXACTLY** like this:

**Field**: `URI Path`  
**Operator**: `equals`  
**Value**: `/api/payments/webhook/xendit`

**THEN** (Action):  
**Choose**: `Skip`

**Select ALL these options:**
- ✅ All remaining custom rules
- ✅ Rate limiting  
- ✅ Security level (Super Bot Fight Mode)
- ✅ Managed rulesets (Cloudflare managed rules)
- ✅ User Agent Blocking
- ✅ Zone Lockdown

### Step 3: Make Sure Rule is FIRST in Order

**IMPORTANT**: The rule order matters!

1. In the Custom rules list, your "Allow Xendit Webhooks" rule should be **#1** (first position)
2. If it's not first, drag it to the top of the list

### Step 4: Alternative - Use "Contains" Instead of "Equals"

If the above doesn't work, edit the rule to use:

**Field**: `URI Path`  
**Operator**: `contains`  
**Value**: `/api/payments/webhook/xendit`

### Step 5: Turn OFF Bot Fight Mode Temporarily

As a quick test, go back to:
1. **Security** → **Bots**  
2. **Toggle OFF** "Bot Fight Mode" (the green switch)
3. Test the webhook from Xendit
4. If it works, then Bot Fight Mode is the culprit

### Step 6: Check if Rule is Actually Active

Make sure:
- Rule status shows **"Active"** (green badge)
- Not **"Disabled"** or **"Draft"**

---

## Quick Test

After making changes, test with this command:

\`\`\`bash
curl -X POST https://dev.thepusaka.id/api/payments/webhook/xendit \\
  -H "Content-Type: application/json" \\
  -H "x-callback-token: No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg" \\
  -H "User-Agent: Xendit-Webhook" \\
  -d '{"id":"test-123","status":"PAID"}'
\`\`\`

**Expected**: `{"error":"Payment not found"}` with HTTP 404 (NOT 403!)

---

## If Still Getting 403

### Option A: Create Page Rule Instead

1. Go to **Rules** → **Page Rules**
2. Click **Create Page Rule**
3. **URL pattern**: `dev.thepusaka.id/api/payments/webhook/xendit*`
4. **Settings**:
   - Security Level: **Off**
   - Browser Integrity Check: **Off**
5. Click **Save and Deploy**

### Option B: Disable Cloudflare Proxy (DNS Only)

**Temporary solution for testing:**

1. Go to **DNS** settings
2. Find the `dev` record
3. Click the **orange cloud** icon to turn it **grey** (DNS Only)
4. Test webhook - it should work now
5. If it works, the issue is definitely Cloudflare security

**Important**: Remember to turn the cloud back to orange after confirming!

---

## Check Cloudflare Firewall Events

1. Go to **Security** → **Events**
2. Filter by:
   - **Host**: `dev.thepusaka.id`
   - **Path**: `/api/payments/webhook/xendit`
3. Look for blocked requests
4. Check which rule is blocking it
5. Click on the event to see details

---

## Expected Cloudflare Event After Fix

After the fix is working, you should see in Firewall Events:
- **Action**: Allow (or Skip)
- **Rule**: Allow Xendit Webhooks
- **Service**: Your custom rule

**NOT**:
- **Action**: Block/Challenge
- **Rule**: Bot Fight Mode / Managed Rules

---

## For the PENDING Payments

Once the webhook is working, you have two options:

### Option 1: Process Them Manually

Run this script to check pending payments:

\`\`\`bash
cd /home/sfadmin/pusaka-newsletter
npx ts-node scripts/process-pending-payments.ts
\`\`\`

### Option 2: Re-trigger Webhooks from Xendit

1. Go to Xendit Dashboard
2. Find each payment transaction
3. Click "Resend Webhook" for successful payments

---

## Summary Checklist

- [ ] WAF rule uses exact path: `/api/payments/webhook/xendit`
- [ ] Rule action is "Skip" with ALL options checked
- [ ] Rule is #1 in the order (first position)
- [ ] Rule status is "Active" (green)
- [ ] Bot Fight Mode has exception OR is turned off
- [ ] Test with curl returns 404 (not 403)
- [ ] Xendit test webhook returns 200 or 404 (not 403)
- [ ] Check Firewall Events to confirm rule is working
