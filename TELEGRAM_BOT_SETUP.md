# 🤖 Telegram Bot Setup Guide

## Overview
The BSM Telegram bot allows users to receive real-time notifications for new messages and manage their BSM account directly from Telegram.

## Features
- ✅ Real-time message notifications
- ✅ Link BSC wallet to Telegram account
- ✅ View recent messages
- ✅ Check connection status
- ✅ Toggle notifications on/off

## Setup Instructions

### 1. Get Your Bot Token
You should have already created your bot with @BotFather. Copy the bot token.

### 2. Add Token to Environment Variables

**For Local Development:**
Create/update `.env.local`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**For Production (Render):**
Add environment variable in Render dashboard:
- Key: `TELEGRAM_BOT_TOKEN`
- Value: Your bot token from BotFather

### 3. Set Up Webhook

Once your app is deployed, set the webhook URL:

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `https://your-domain.com` with your actual domain

**For local testing with ngrok:**
```bash
# Start ngrok
ngrok http 3000

# Set webhook with ngrok URL
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"}'
```

### 4. Verify Webhook

Check if webhook is set:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## Bot Commands

### User Commands
- `/start` - Welcome message and introduction
- `/help` - Show all available commands
- `/link` - Link your BSC wallet to Telegram
- `/unlink` - Unlink your wallet
- `/status` - Check connection status and stats
- `/inbox` - View your 5 most recent messages
- `/notifications on|off` - Toggle notifications

## How It Works

### 1. Linking Wallet
1. User sends `/link` command
2. Bot asks for wallet address
3. User sends their BSC wallet address (0x...)
4. Bot stores the association in database
5. User starts receiving notifications!

### 2. Message Notifications
When someone sends a BSM message:
1. Message is saved to database
2. Bot checks if recipient has Telegram linked
3. If linked and notifications enabled, sends notification:
   ```
   🔔 New BSM Message!
   📨 From: 0x1234...5678
   🌐 Read on BSM: https://bsm.center
   ```

### 3. Security
- Each wallet can only be linked to ONE Telegram account
- Messages are NOT decrypted in Telegram (security!)
- Users must visit BSM web app to read full messages
- Wallet verification through database linkage

## Database Schema

```prisma
model User {
  id                    String   @id @default(cuid())
  walletAddress         String   @unique
  telegramChatId        String?  @unique
  telegramUsername      String?
  notificationsEnabled  Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## API Endpoints

### Webhook Endpoint
- **URL**: `POST /api/telegram/webhook`
- **Purpose**: Receive updates from Telegram
- **Authentication**: Handled by Telegram via webhook secret

### Health Check
- **URL**: `GET /api/telegram/webhook`
- **Response**: Bot configuration status

## Testing

### Test Bot Commands
1. Find your bot on Telegram
2. Send `/start`
3. Try `/link` with a test wallet address
4. Send a BSM message to that wallet
5. Check if you receive Telegram notification!

### Test Notification System
```typescript
// In your code or API route
import { sendMessageNotification } from '@/lib/telegram-bot';

await sendMessageNotification(
  '0xYourWalletAddress',
  '0xSenderWalletAddress'
);
```

## Troubleshooting

### Bot Not Responding
1. Check if bot token is set in environment
2. Verify webhook is set correctly: `/getWebhookInfo`
3. Check server logs for errors
4. Ensure bot is started (automatic on server start)

### Notifications Not Working
1. Verify user linked wallet with `/status`
2. Check if notifications are enabled
3. Verify webhook is receiving updates
4. Check server logs for notification errors

### Webhook Issues
- Make sure URL is HTTPS (required by Telegram)
- For local dev, use ngrok
- Check if firewall is blocking webhook requests

## Production Checklist

- [ ] Bot token added to Render environment variables
- [ ] Webhook set to production URL
- [ ] Database migrated (User model exists)
- [ ] Test bot commands work
- [ ] Test notification delivery
- [ ] Monitor logs for errors

## Future Enhancements

Potential features to add:
- Quick reply from Telegram
- Contact management via bot
- Message search
- Daily digest of messages
- Multi-language support
- Rich message previews (when decrypted)

## Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Website: https://bsm.center
- Twitter: @bsmartmail

