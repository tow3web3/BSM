import { prisma } from './prisma';

// Simple notification sender without requiring the full bot instance
export async function sendTelegramMessage(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

// Send message notification to user
export async function notifyNewMessage(walletAddress: string, fromWallet: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user || !user.telegramChatId || !user.notificationsEnabled) {
      return; // User not linked or notifications disabled
    }

    const fromShort = `${fromWallet.slice(0, 6)}...${fromWallet.slice(-4)}`;
    const message =
      `🔔 *New Message Received!*\n\n` +
      `📨 From: \`${fromShort}\`\n` +
      `⏰ ${new Date().toLocaleTimeString()}\n\n` +
      `🔓 [Read Message on BSM](https://bsm.center)\n\n` +
      `🔕 To disable notifications: /notifications off`;

    await sendTelegramMessage(user.telegramChatId, message);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// Send link success notification
export async function notifyLinkSuccess(chatId: string, walletAddress: string) {
  const walletShort = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  
  const message =
    `🎉 *Link Successful!*\n\n` +
    `✅ Your wallet is now linked:\n` +
    `\`${walletShort}\`\n\n` +
    `🔔 You'll receive instant notifications when you get new messages!\n\n` +
    `*Quick Commands:*\n` +
    `/status - Check your account\n` +
    `/inbox - View messages\n` +
    `/notifications - Manage alerts`;

  await sendTelegramMessage(chatId, message);
}

