#!/bin/bash

# Server Update Script
# Run this on the server after git pull

echo "📦 Installing dependencies..."
npm install

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Updating Database Schema..."
# For SQLite (dev.db), use db push
npx prisma db push

echo "🌱 Seeding Database (Resetting admin password)..."
# This will reset admin/password to default
npx tsx src/seed.ts

echo "✅ Update Complete! Please restart the server with PM2."
echo "Example: pm2 restart all"
