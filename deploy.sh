#!/bin/bash

echo "🚀 Production Deployment Script for Pusaka Newsletter"
echo "=================================================="

# Stop the current PM2 process
echo "Stopping current PM2 process..."
pm2 stop pusaka-dev 2>/dev/null || echo "Process not running"
pm2 delete pusaka-dev 2>/dev/null || echo "Process not found"

# Navigate to project directory
cd /home/sfadmin/pusaka-newsletter

# Pull latest changes
echo "Pulling latest changes from git..."
git pull origin dev

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Run database migrations (if needed)
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Show PM2 status
pm2 list

echo "✅ Deployment complete!"
echo "📋 Check logs with: pm2 logs pusaka-dev"
echo "🔄 Restart with: pm2 restart pusaka-dev"
