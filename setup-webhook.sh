#!/bin/bash

# Script to set up Telegram webhook for production
# Usage: ./setup-webhook.sh YOUR_BOT_TOKEN YOUR_DOMAIN

BOT_TOKEN=$1
DOMAIN=$2

if [ -z "$BOT_TOKEN" ] || [ -z "$DOMAIN" ]; then
    echo "❌ Usage: ./setup-webhook.sh YOUR_BOT_TOKEN YOUR_DOMAIN"
    echo "Example: ./setup-webhook.sh 123456:ABC-DEF https://bsm.onrender.com"
    exit 1
fi

echo "🔗 Setting up webhook for Telegram bot..."
echo "📡 Domain: $DOMAIN"

# Set the webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$DOMAIN/api/telegram/webhook\"}")

echo "$RESPONSE"

# Check webhook info
echo ""
echo "📊 Checking webhook status..."
curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" | json_pp

echo ""
echo "✅ Done! Your bot should now be active 24/7"
echo "🧪 Test it by sending /start to your bot on Telegram"

