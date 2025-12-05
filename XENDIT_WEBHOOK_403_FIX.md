# Fix for Xendit Webhook 403 Error

## Problem
Getting **403 Forbidden** when Xendit tries to POST to:
```
https://dev.thepusaka.id/api/payments/webhook/xendit
```

## Root Cause
Cloudflare's security features (WAF, Bot Fight Mode, or Security Level) are blocking Xendit's webhook requests.

---

## Solution 1: Disable Cloudflare Security for Webhook Endpoint (RECOMMENDED)

### Step 1: Login to Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com
2. Select your domain: **thepusaka.id**

### Step 2: Create a WAF Exception Rule
1. Click **Security** → **WAF** in the left sidebar
2. Click on **Custom rules** tab
3. Click **Create rule**

**Rule Configuration:**
- **Rule name**: `Allow Xendit Webhooks`
- **Field**: `URI Path`
- **Operator**: `contains`
- **Value**: `/api/payments/webhook/xendit`

**Then choose action:**
- **Action**: `Skip` → Select:
  - ✅ All remaining custom rules
  - ✅ Rate limiting
  - ✅ Security level
  - ✅ Managed rulesets

4. Click **Deploy**

### Step 3: Disable Bot Fight Mode for this path
1. Go to **Security** → **Bots**
2. Click **Configure Bot Fight Mode**
3. Add exception:
   - **Field**: `URI Path`
   - **Operator**: `equals`
   - **Value**: `/api/payments/webhook/xendit`
   - **Action**: `Allow`

### Step 4: Lower Security Level (Alternative)
If WAF rules don't work:
1. Go to **Security** → **Settings**
2. Set **Security Level** to `Essentially Off` or `Low`
3. **Note**: This affects your whole site, so prefer WAF rules above

---

## Solution 2: Add Xendit IPs to IP Access Rules

Xendit uses these IP ranges for webhooks. Whitelist them:

### Step 1: Get Xendit IPs
According to Xendit docs, their webhook IPs are:
- `52.77.10.104/32`
- `13.251.58.153/32`
- `13.229.106.48/32`
- Contact Xendit support for the latest IP list

### Step 2: Add to Cloudflare IP Access Rules
1. Go to **Security** → **WAF** → **Tools**
2. Scroll to **IP Access Rules**
3. For each Xendit IP:
   - **Value**: Enter IP (e.g., `52.77.10.104`)
   - **Action**: `Allow`
   - **Zone**: Select `This website`
   - **Note**: `Xendit Webhook IP`
4. Click **Add**

---

## Solution 3: Test Webhook Endpoint First

### Test with GET Request
Open in browser:
```
https://dev.thepusaka.id/api/payments/webhook/xendit
```

You should see:
```json
{
  "status": "ok",
  "message": "Xendit webhook endpoint is active",
  "timestamp": "2025-12-05T..."
}
```

If this returns 403, the issue is definitely Cloudflare.

### Test with POST (using curl)
```bash
curl -X POST https://dev.thepusaka.id/api/payments/webhook/xendit \
  -H "Content-Type: application/json" \
  -H "x-callback-token: No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg" \
  -H "User-Agent: Xendit" \
  -d '{
    "id": "test-invoice-123",
    "status": "PAID",
    "payment_method": "CREDIT_CARD",
    "paid_at": "2025-12-05T10:00:00Z"
  }'
```

---

## Solution 4: Cloudflare Page Rules (Quick Fix)

### Create a Page Rule to Disable Security
1. Go to **Rules** → **Page Rules**
2. Click **Create Page Rule**

**Settings:**
- **URL**: `dev.thepusaka.id/api/payments/webhook/*`
- **Settings**:
  - Security Level: `Essentially Off`
  - Browser Integrity Check: `Off`
  - Disable Performance: `Off`

3. Click **Save and Deploy**

---

## Solution 5: Check Cloudflare Tunnel Configuration

If you're using Cloudflare Tunnel, ensure it's properly configured:

```yaml
# /etc/cloudflared/config.yml
tunnel: a20ab40b-cb46-4b91-9725-2885138bb750
credentials-file: /root/.cloudflared/a20ab40b-cb46-4b91-9725-2885138bb750.json

ingress:
  - hostname: dev.thepusaka.id
    service: http://localhost:3000
    # Add this to pass all headers
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
  - service: http_status:404
```

Restart the tunnel:
```bash
sudo systemctl restart cloudflared
```

---

## Verification Steps

### 1. Check Cloudflare Firewall Events
1. Go to **Security** → **Events**
2. Filter by **Host**: `dev.thepusaka.id`
3. Look for blocked requests to `/api/payments/webhook/xendit`
4. Check what rule blocked it

### 2. Test from Xendit Dashboard
1. Go to: https://dashboard.xendit.co/settings/webhooks
2. Find your webhook
3. Click **Send Test**
4. Check if it succeeds

### 3. Check Application Logs
```bash
# If using PM2
pm2 logs pusaka-newsletter --lines 100

# Check for webhook received message
# Should see: "🔔 ============ XENDIT WEBHOOK RECEIVED ============"
```

---

## Quick Checklist

- [ ] WAF exception rule created for webhook path
- [ ] Bot Fight Mode disabled for webhook path
- [ ] Xendit IPs whitelisted (optional)
- [ ] Page rule created (if needed)
- [ ] GET request to webhook returns 200 OK
- [ ] POST request to webhook returns 200 OK
- [ ] Cloudflare Firewall Events shows no blocks
- [ ] Xendit test webhook succeeds

---

## Still Getting 403?

### Debug Steps:

1. **Check exact error in Cloudflare Events**
   - Security → Events
   - Look for the blocked request
   - Note which rule blocked it

2. **Temporarily bypass Cloudflare**
   - In Cloudflare DNS, set the dev record to "DNS Only" (grey cloud)
   - Test webhook directly
   - If it works, the issue is Cloudflare

3. **Check server logs**
   ```bash
   # Check if request is reaching your server
   pm2 logs pusaka-newsletter
   
   # If no logs appear, request is blocked before reaching server
   ```

4. **Contact Cloudflare Support**
   - Provide: URL, timestamp of blocked request, Xendit IP
   - Ask them to check why it's being blocked

---

## Final Notes

- **Recommended**: Use Solution 1 (WAF Exception) as it's most secure
- **Quick Fix**: Use Solution 4 (Page Rules) if you need immediate access
- **Production**: Always verify security rules don't expose vulnerabilities
- **Monitor**: Check Cloudflare Events regularly for suspicious activity

---

## Update Xendit Webhook URL

After fixing, update Xendit:
1. URL: `https://dev.thepusaka.id/api/payments/webhook/xendit`
2. Events: `invoice.paid`, `invoice.expired`, `invoice.settled`
3. Callback Token: Use your `XENDIT_WEBHOOK_VERIFICATION_TOKEN`
