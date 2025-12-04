# Cloudflare Tunnel Setup Guide for Xendit Webhooks

This guide shows you how to set up **Cloudflare Tunnel** as a replacement for ngrok to receive Xendit webhooks in both development and production environments.

## Why Cloudflare Tunnel?

✅ **Free** - Unlike ngrok, no paid subscription required
✅ **Persistent URLs** - Same URL every time (unlike ngrok free tier)
✅ **No Timeouts** - Tunnel stays active as long as you want
✅ **Built-in DDoS Protection** - Cloudflare's security for free
✅ **Better for Production** - Can be used in production environments
✅ **Zero Configuration DNS** - Automatic subdomain setup

---

## Part 1: Development Setup

### Prerequisites
- A Cloudflare account (free tier is fine)
- A domain added to Cloudflare (or use Cloudflare's free subdomain)
- Your Next.js app running locally

### Step 1: Install Cloudflared

**For macOS:**
```bash
brew install cloudflared
```

**For Linux:**
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**For Windows:**
Download from: https://github.com/cloudflare/cloudflared/releases

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will:
1. Open your browser
2. Ask you to select your domain
3. Save credentials to `~/.cloudflared/cert.pem`

### Step 3: Create a Tunnel

```bash
# Create a named tunnel for development
cloudflared tunnel create pusaka-dev-tunnel

# You'll get output like:
# Tunnel credentials written to /Users/yourname/.cloudflared/UUID.json
# Created tunnel pusaka-dev-tunnel with id UUID
```

**Important:** Save the tunnel ID (UUID) - you'll need it!

### Step 4: Configure the Tunnel

Create a config file at `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR-TUNNEL-ID-HERE
credentials-file: /Users/yourname/.cloudflared/YOUR-TUNNEL-ID.json

ingress:
  # Route for your development webhook
  - hostname: pusaka-dev.yourdomain.com
    service: http://localhost:3000
  # Catch-all rule (required)
  - service: http_status:404
```

Replace:
- `YOUR-TUNNEL-ID-HERE` with your actual tunnel ID
- `/Users/yourname/.cloudflared/YOUR-TUNNEL-ID.json` with actual path
- `pusaka-dev.yourdomain.com` with your desired subdomain

### Step 5: Create DNS Record

```bash
cloudflared tunnel route dns pusaka-dev-tunnel pusaka-dev.yourdomain.com
```

This creates a CNAME record automatically in Cloudflare DNS.

### Step 6: Run the Tunnel

```bash
# Start your Next.js app
npm run dev

# In another terminal, start the tunnel
cloudflared tunnel run pusaka-dev-tunnel
```

**Your webhook URL is now:**
```
https://pusaka-dev.yourdomain.com/api/payments/webhook/xendit
```

### Step 7: Configure Xendit Webhook

1. Go to [Xendit Dashboard](https://dashboard.xendit.co/webhooks)
2. Click **"+ Add Webhook"**
3. Enter your tunnel URL:
   ```
   https://pusaka-dev.yourdomain.com/api/payments/webhook/xendit
   ```
4. Select events:
   - ✅ `invoice.paid`
   - ✅ `invoice.expired`
   - ✅ `invoice.settled`
5. Save

### Optional: Run Tunnel as Background Service

**Create systemd service (Linux) or launchd (macOS):**

For macOS, create `~/Library/LaunchAgents/com.cloudflare.tunnel.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
        <string>pusaka-dev-tunnel</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/cloudflared.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/cloudflared-error.log</string>
</dict>
</plist>
```

Then:
```bash
launchctl load ~/Library/LaunchAgents/com.cloudflare.tunnel.plist
```

---

## Part 2: Production Setup

### Option A: Using Your Domain (Recommended)

If you have `thepusaka.id` on Cloudflare:

#### Step 1: Create Production Tunnel

```bash
cloudflared tunnel create pusaka-prod-tunnel
```

#### Step 2: Configure Production Tunnel

Create/update `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR-PROD-TUNNEL-ID
credentials-file: /path/to/YOUR-PROD-TUNNEL-ID.json

ingress:
  - hostname: api.thepusaka.id
    service: http://localhost:3000
  - hostname: dev.thepusaka.id
    service: http://localhost:3001  # If you run dev on different port
  - service: http_status:404
```

#### Step 3: Route DNS

```bash
# For production API
cloudflared tunnel route dns pusaka-prod-tunnel api.thepusaka.id

# For dev environment
cloudflared tunnel route dns pusaka-prod-tunnel dev.thepusaka.id
```

#### Step 4: Deploy on Server

On your production server:

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Copy tunnel credentials
scp ~/.cloudflared/YOUR-TUNNEL-ID.json server:/etc/cloudflared/

# Create config on server
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Config file on server:
```yaml
tunnel: YOUR-TUNNEL-ID
credentials-file: /etc/cloudflared/YOUR-TUNNEL-ID.json

ingress:
  - hostname: api.thepusaka.id
    service: http://localhost:3000
  - service: http_status:404
```

#### Step 5: Run as System Service

```bash
# Install as service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

### Option B: Using Cloudflare's Free Subdomain

If you don't want to use your domain:

```bash
# Create tunnel
cloudflared tunnel create pusaka-webhook

# Use the auto-generated URL
cloudflared tunnel run pusaka-webhook
```

This gives you a URL like: `https://tunnel-id.cfargotunnel.com`

---

## Part 3: Docker Compose Integration

If you're using Docker, add cloudflared to your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    # ... other config

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    restart: unless-stopped
    depends_on:
      - app
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
```

Get your tunnel token:
```bash
cloudflared tunnel token pusaka-prod-tunnel
```

Add to `.env`:
```env
CLOUDFLARE_TUNNEL_TOKEN=your-token-here
```

---

## Part 4: Environment Configuration

Update your `.env.local` (development):

```env
# Xendit Configuration
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_WEBHOOK_VERIFICATION_TOKEN=No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg

# Your Cloudflare Tunnel URLs
NEXT_PUBLIC_APP_URL=https://pusaka-dev.yourdomain.com
WEBHOOK_URL=https://pusaka-dev.yourdomain.com/api/payments/webhook/xendit
```

Update your `.env` (production):

```env
# Xendit Configuration
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_WEBHOOK_VERIFICATION_TOKEN=No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg

# Production URLs
NEXT_PUBLIC_APP_URL=https://api.thepusaka.id
WEBHOOK_URL=https://api.thepusaka.id/api/payments/webhook/xendit
```

---

## Part 5: Testing Your Setup

### 1. Test Tunnel Connection

```bash
# Check if tunnel is running
cloudflared tunnel list

# Test connectivity
curl https://pusaka-dev.yourdomain.com/api/health

# Check tunnel logs
cloudflared tunnel info pusaka-dev-tunnel
```

### 2. Test Webhook Endpoint

```bash
# Test from command line
curl -X POST https://pusaka-dev.yourdomain.com/api/payments/webhook/xendit \
  -H "Content-Type: application/json" \
  -H "x-callback-token: No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg" \
  -d '{
    "id": "test-invoice-123",
    "status": "PAID",
    "payment_method": "CREDIT_CARD",
    "paid_at": "2025-12-05T10:00:00Z"
  }'
```

### 3. Monitor Webhook Traffic

Check your app logs:
```bash
# Development
npm run dev

# Production (if using PM2)
pm2 logs pusaka-newsletter
```

You should see:
```
Xendit webhook received: { id: 'test-invoice-123', status: 'PAID', ... }
```

---

## Part 6: Xendit Dashboard Configuration

### For Development
1. Go to [Xendit Dashboard](https://dashboard.xendit.co/webhooks)
2. Add webhook URL: `https://pusaka-dev.yourdomain.com/api/payments/webhook/xendit`
3. Select events: `invoice.paid`, `invoice.expired`, `invoice.settled`
4. Callback token: `No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg`

### For Production
1. Add webhook URL: `https://api.thepusaka.id/api/payments/webhook/xendit`
2. Same events and token as above

### Create Separate Webhooks
You can create **multiple webhooks** in Xendit:
- One for development: `https://pusaka-dev.yourdomain.com/...`
- One for production: `https://api.thepusaka.id/...`

This way both environments receive webhooks independently.

---

## Troubleshooting

### Tunnel Not Connecting

```bash
# Check tunnel status
cloudflared tunnel info pusaka-dev-tunnel

# Restart tunnel
cloudflared tunnel run pusaka-dev-tunnel

# Check logs
tail -f /tmp/cloudflared.log
```

### Webhook Not Received

1. **Check tunnel is running:**
   ```bash
   ps aux | grep cloudflared
   ```

2. **Verify DNS:**
   ```bash
   dig pusaka-dev.yourdomain.com
   ```

3. **Test endpoint:**
   ```bash
   curl -I https://pusaka-dev.yourdomain.com
   ```

4. **Check Xendit webhook logs:**
   - Go to Xendit Dashboard → Webhooks → View Logs
   - Check for delivery failures

### CORS Issues

If you encounter CORS issues, update your Next.js config:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/payments/webhook/xendit',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST' },
        ],
      },
    ]
  },
}
```

---

## Quick Reference Commands

```bash
# List all tunnels
cloudflared tunnel list

# Create tunnel
cloudflared tunnel create tunnel-name

# Run tunnel
cloudflared tunnel run tunnel-name

# Delete tunnel
cloudflared tunnel delete tunnel-name

# Route DNS
cloudflared tunnel route dns tunnel-name subdomain.domain.com

# Get tunnel info
cloudflared tunnel info tunnel-name

# Install as service
sudo cloudflared service install

# Uninstall service
sudo cloudflared service uninstall
```

---

## Comparison: Cloudflare Tunnel vs Ngrok

| Feature | Cloudflare Tunnel | Ngrok Free | Ngrok Paid |
|---------|------------------|------------|------------|
| **Price** | Free | Free | $8-20/mo |
| **URL Persistence** | ✅ Permanent | ❌ Changes | ✅ Permanent |
| **Custom Domain** | ✅ Yes | ❌ No | ✅ Yes |
| **Concurrent Tunnels** | ✅ Unlimited | 1 | Multiple |
| **Session Duration** | ✅ Unlimited | 2 hours | Unlimited |
| **DDoS Protection** | ✅ Included | ❌ No | Limited |
| **Production Ready** | ✅ Yes | ❌ No | ✅ Yes |

---

## Security Best Practices

1. **Always verify webhook signatures:**
   ```typescript
   const callbackToken = request.headers.get('x-callback-token')
   if (callbackToken !== process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

2. **Use environment variables:**
   - Never hardcode tokens
   - Use different tokens for dev/prod

3. **Enable Cloudflare security features:**
   - WAF (Web Application Firewall)
   - Rate limiting
   - IP whitelisting for Xendit

4. **Monitor webhook logs:**
   - Track successful/failed deliveries
   - Set up alerts for failures

---

## Summary

**For Development:**
```bash
cloudflared tunnel create pusaka-dev-tunnel
cloudflared tunnel route dns pusaka-dev-tunnel dev.thepusaka.id
cloudflared tunnel run pusaka-dev-tunnel
```

**For Production:**
```bash
cloudflared tunnel create pusaka-prod-tunnel
cloudflared tunnel route dns pusaka-prod-tunnel api.thepusaka.id
sudo cloudflared service install
```

**Xendit Webhook URLs:**
- Dev: `https://dev.thepusaka.id/api/payments/webhook/xendit`
- Prod: `https://api.thepusaka.id/api/payments/webhook/xendit`

That's it! You now have a reliable, free, and production-ready tunnel for receiving Xendit webhooks. 🚀
