#!/bin/bash

# Test Xendit Webhook Endpoint
# This script tests if the webhook endpoint is accessible

echo "🧪 Testing Xendit Webhook Endpoint"
echo "=================================="
echo ""

URL="https://dev.thepusaka.id/api/payments/webhook/xendit"
TOKEN="No7nCb8AfYcFXvSI7QNqzjLaxgqQG57sIhbFCYNvG00eu6gg"

# Test 1: GET Request (Health Check)
echo "📍 Test 1: GET Request (Health Check)"
echo "URL: $URL"
echo ""
curl -s -w "\nHTTP Status: %{http_code}\n\n" "$URL"

# Test 2: OPTIONS Request (CORS Preflight)
echo "📍 Test 2: OPTIONS Request (CORS Preflight)"
echo ""
curl -s -X OPTIONS -w "HTTP Status: %{http_code}\n" \
  -H "Origin: https://dashboard.xendit.co" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, x-callback-token" \
  "$URL"
echo ""

# Test 3: POST Request (Actual Webhook)
echo "📍 Test 3: POST Request (Simulated Webhook)"
echo ""
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-callback-token: $TOKEN" \
  -H "User-Agent: Xendit-Webhook" \
  -d '{
    "id": "test-invoice-'$(date +%s)'",
    "status": "PAID",
    "payment_method": "CREDIT_CARD",
    "paid_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
  }'

echo ""
echo ""
echo "=================================="
echo "✅ Tests completed!"
echo ""
echo "Expected Results:"
echo "  Test 1: HTTP Status: 200, JSON with status 'ok'"
echo "  Test 2: HTTP Status: 200"
echo "  Test 3: HTTP Status: 200 or 400/404 (if test invoice not found)"
echo ""
echo "If you see 403:"
echo "  ❌ Cloudflare is blocking the request"
echo "  📖 Check XENDIT_WEBHOOK_403_FIX.md for solutions"
echo ""
