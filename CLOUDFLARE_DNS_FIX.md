# Fix for Existing DNS Record Error

## Problem
You're getting this error when trying to create the tunnel route:
```
Failed to add route: code: 1003, reason: Failed to create record dev.thepusaka.id with err An A, AAAA, or CNAME record with that host already exists.
```

This means `dev.thepusaka.id` already has a DNS record pointing somewhere else.

## Solution: Delete the Existing DNS Record

### Step 1: Login to Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Select your domain: **thepusaka.id**
3. Click on **DNS** in the left sidebar

### Step 2: Find and Delete the Record

Look for a record with:
- **Name**: `dev` or `dev.thepusaka.id`
- **Type**: A, AAAA, or CNAME

**Delete this record** by clicking the **trash icon** or **Delete** button.

### Step 3: Create the Tunnel Route Again

After deleting the old record, run:

```bash
cloudflared tunnel route dns pusaka-dev-tunnel dev.thepusaka.id
```

You should see:
```
Added CNAME dev.thepusaka.id which will route to this tunnel tunnelID=a20ab40b-cb46-4b91-9725-2885138bb750
```

---

## Alternative: Use a Different Subdomain

If you want to keep the existing `dev.thepusaka.id` record for something else, use a different subdomain:

```bash
# Use webhook-dev instead
cloudflared tunnel route dns pusaka-dev-tunnel webhook-dev.thepusaka.id

# Or use api-dev
cloudflared tunnel route dns pusaka-dev-tunnel api-dev.thepusaka.id
```

Then your webhook URL would be:
```
https://webhook-dev.thepusaka.id/api/payments/webhook/xendit
```

---

## Next Steps After DNS is Fixed

### 1. Create the Config File

```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Add this content:

```yaml
tunnel: a20ab40b-cb46-4b91-9725-2885138bb750
credentials-file: /root/.cloudflared/a20ab40b-cb46-4b91-9725-2885138bb750.json

ingress:
  - hostname: dev.thepusaka.id
    service: http://localhost:3000
  - service: http_status:404
```

Save and exit (Ctrl+X, then Y, then Enter).

### 2. Test the Tunnel

```bash
# Test run (keep this terminal open)
cloudflared tunnel run pusaka-dev-tunnel
```

In another terminal, test if it works:

```bash
curl https://dev.thepusaka.id
```

You should see your Next.js app response.

### 3. Install as System Service

Once the test works, install it as a service so it runs automatically:

```bash
# Stop the test run (Ctrl+C)

# Install as service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

### 4. Configure Xendit Webhook

1. Go to: https://dashboard.xendit.co/webhooks
2. Click **"+ Add Webhook"** or **"Create New Webhook"**
3. Enter webhook URL: `https://dev.thepusaka.id/api/payments/webhook/xendit`
4. Select events:
   - ✅ `invoice.paid`
   - ✅ `invoice.expired`
   - ✅ `invoice.settled`
5. Set callback token: `No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg`
6. Click **Save**

### 5. Test the Webhook

```bash
# Test webhook from command line
curl -X POST https://dev.thepusaka.id/api/payments/webhook/xendit \
  -H "Content-Type: application/json" \
  -H "x-callback-token: No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg" \
  -d '{
    "id": "test-invoice-123",
    "status": "PAID",
    "payment_method": "CREDIT_CARD",
    "paid_at": "2025-12-05T10:00:00Z"
  }'
```

Check your app logs to see if webhook was received:

```bash
# If using PM2
pm2 logs pusaka-newsletter

# If using npm
npm run dev
```

---

## Troubleshooting Commands

```bash
# Check tunnel status
cloudflared tunnel list

# View tunnel info
cloudflared tunnel info pusaka-dev-tunnel

# Check service status
sudo systemctl status cloudflared

# View service logs
sudo journalctl -u cloudflared -f

# Restart service
sudo systemctl restart cloudflared

# Stop service
sudo systemctl stop cloudflared
```

---

## Your Tunnel Information

**Tunnel ID:** `a20ab40b-cb46-4b91-9725-2885138bb750`  
**Credentials File:** `/root/.cloudflared/a20ab40b-cb46-4b91-9725-2885138bb750.json`  
**Config File:** `/etc/cloudflared/config.yml`  
**Webhook URL:** `https://dev.thepusaka.id/api/payments/webhook/xendit`

---

## Summary

1. ✅ Delete existing DNS record for `dev.thepusaka.id` in Cloudflare Dashboard
2. ✅ Run: `cloudflared tunnel route dns pusaka-dev-tunnel dev.thepusaka.id`
3. ✅ Create config file at `/etc/cloudflared/config.yml`
4. ✅ Install as service: `sudo cloudflared service install`
5. ✅ Start service: `sudo systemctl start cloudflared && sudo systemctl enable cloudflared`
6. ✅ Configure Xendit webhook with: `https://dev.thepusaka.id/api/payments/webhook/xendit`

That's it! Your Cloudflare Tunnel will be ready to receive Xendit webhooks. 🚀
