import { Bot, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper Functions
const formatWalletAddress = (address: string, short = true): string => {
  if (short) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Initialize bot (will be set in initBot function)
let bot: Bot | null = null;

export function initBot(token: string) {
  if (bot) return bot;

  bot = new Bot(token);

  // Start command with inline keyboard
  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('🔗 Link Wallet', 'link_wallet')
      .text('📚 Help', 'help').row()
      .url('🌐 Visit BSM', 'https://bsm.center');

    const userName = ctx.from?.first_name || 'there';
    
    await ctx.reply(
      `👋 *Welcome ${userName}!*\n\n` +
      `🔔 Get instant notifications when someone sends you a message on *Binance Smart Mail*\n\n` +
      `✨ *Features:*\n` +
      `• Real-time message alerts\n` +
      `• Check your inbox from Telegram\n` +
      `• Manage notifications\n` +
      `• View message stats\n\n` +
      `🚀 *Ready to start?* Link your BSC wallet below!`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  // Help command with inline keyboard
  bot.command('help', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('🔗 Link Wallet', 'link_wallet')
      .text('📊 Status', 'check_status').row()
      .text('📬 Inbox', 'view_inbox')
      .url('🌐 BSM Web', 'https://bsm.center');

    await ctx.reply(
      `📚 *BSM Bot - Command Guide*\n\n` +
      `*Account Management:*\n` +
      `/link - Link your BSC wallet\n` +
      `/unlink - Unlink your wallet\n` +
      `/status - Check connection & stats\n\n` +
      `*Messages:*\n` +
      `/inbox - View recent messages (last 10)\n` +
      `/notifications on|off - Toggle alerts\n\n` +
      `*Info:*\n` +
      `/help - Show this guide\n` +
      `/start - Welcome message\n\n` +
      `💡 *Tip:* Use the buttons below for quick access!`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  // Link wallet command - Generate verification code (SECURE)
  bot.command('link', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    // Check if already linked
    const existingUser = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (existingUser) {
      const keyboard = new InlineKeyboard()
        .text('📊 View Status', 'check_status')
        .text('📬 Inbox', 'view_inbox').row()
        .text('🔓 Unlink', 'unlink_wallet');

      await ctx.reply(
        `✅ *Already Linked!*\n\n` +
        `🔗 Wallet: \`${existingUser.walletAddress}\`\n` +
        `🔔 Notifications: ${existingUser.notificationsEnabled ? 'ON' : 'OFF'}\n\n` +
        `To link a different wallet, unlink first.`,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      return;
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing unused codes for this chat
    await prisma.telegramVerification.deleteMany({
      where: {
        telegramChatId: chatId,
        used: false
      }
    });

    // Create new verification code
    await prisma.telegramVerification.create({
      data: {
        code: verificationCode,
        telegramChatId: chatId,
        telegramUsername: ctx.from?.username || '',
        expiresAt
      }
    });

    const keyboard = new InlineKeyboard()
      .url('🌐 Open BSM Website', 'https://bsm.center');

    await ctx.reply(
      `🔐 *Secure Wallet Linking*\n\n` +
      `Your verification code:\n\n` +
      `╔═══════════╗\n` +
      `║  \`${verificationCode}\`  ║\n` +
      `╚═══════════╝\n\n` +
      `⏰ *Expires in 10 minutes*\n\n` +
      `📋 *Next Steps:*\n` +
      `1️⃣ Click the button below to open BSM\n` +
      `2️⃣ Connect your wallet on BSM\n` +
      `3️⃣ Enter this code when prompted\n` +
      `4️⃣ Done! You'll get notifications 🔔\n\n` +
      `⚠️ Keep this code private!`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  // Status command
  bot.command('status', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      const keyboard = new InlineKeyboard()
        .text('🔗 Link Wallet Now', 'link_wallet')
        .url('🌐 Visit BSM', 'https://bsm.center');

      await ctx.reply(
        `❌ *Not Linked*\n\n` +
        `You haven't linked a BSC wallet yet.\n\n` +
        `Click the button below to get started! 👇`,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      return;
    }

    const [totalMessages, unreadCount] = await Promise.all([
      prisma.message.count({ where: { toWallet: user.walletAddress } }),
      prisma.message.count({ 
        where: { 
          toWallet: user.walletAddress,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const keyboard = new InlineKeyboard()
      .text('📬 View Inbox', 'view_inbox')
      .text(user.notificationsEnabled ? '🔕 Mute' : '🔔 Unmute', 'toggle_notifications').row()
      .text('🔓 Unlink Wallet', 'unlink_wallet');

    const statusEmoji = user.notificationsEnabled ? '🟢' : '🟠';
    const linkedDate = formatTimeAgo(new Date(user.createdAt));

    await ctx.reply(
      `${statusEmoji} *Account Status*\n\n` +
      `👤 *Telegram:* @${ctx.from?.username || 'N/A'}\n` +
      `🔗 *Wallet:* \`${formatWalletAddress(user.walletAddress)}\`\n` +
      `📬 *Total Messages:* ${totalMessages}\n` +
      `🆕 *Last 24h:* ${unreadCount} messages\n` +
      `🔔 *Notifications:* ${user.notificationsEnabled ? 'Enabled ✅' : 'Disabled 🔕'}\n` +
      `📅 *Linked:* ${linkedDate}\n\n` +
      `🌐 View full address on [BSM Web](https://bsm.center)`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  // Unlink command
  bot.command('unlink', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.reply(`❌ No wallet is currently linked to your Telegram account.`);
      return;
    }

    const keyboard = new InlineKeyboard()
      .text('✅ Yes, Unlink', 'confirm_unlink')
      .text('❌ Cancel', 'cancel_unlink');

    await ctx.reply(
      `⚠️ *Confirm Unlink*\n\n` +
      `Are you sure you want to unlink this wallet?\n\n` +
      `🔗 \`${formatWalletAddress(user.walletAddress)}\`\n\n` +
      `You will stop receiving notifications until you link again.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  // Inbox command
  bot.command('inbox', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      const keyboard = new InlineKeyboard()
        .text('🔗 Link Wallet', 'link_wallet');
      
      await ctx.reply(
        `❌ Please link your wallet first to view your inbox!`,
        { reply_markup: keyboard }
      );
      return;
    }

    const messages = await prisma.message.findMany({
      where: { toWallet: user.walletAddress },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (messages.length === 0) {
      const keyboard = new InlineKeyboard()
        .url('🌐 Open BSM', 'https://bsm.center');

      await ctx.reply(
        `📭 *Inbox Empty*\n\n` +
        `No messages yet! Share your wallet address to start receiving encrypted messages.\n\n` +
        `🔗 Your wallet: \`${formatWalletAddress(user.walletAddress)}\``,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      return;
    }

    let reply = `📬 *Your Inbox* (${messages.length} ${messages.length === 10 ? '+ ' : ''}recent)\n\n`;
    
    messages.forEach((msg, index) => {
      const timeAgo = formatTimeAgo(new Date(msg.createdAt));
      const fromAddress = formatWalletAddress(msg.fromWallet);
      const icon = index === 0 ? '🆕' : '📧';
      
      reply += `${icon} *From:* \`${fromAddress}\`\n`;
      reply += `   ⏰ ${timeAgo}\n\n`;
    });

    const keyboard = new InlineKeyboard()
      .url('🔓 Read Messages', 'https://bsm.center')
      .text('🔄 Refresh', 'view_inbox');

    reply += `\n🔒 Messages are encrypted. Click "Read Messages" to view full content on BSM.`;

    await ctx.reply(reply, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  });

  // Notifications toggle
  bot.command('notifications', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const args = ctx.message?.text?.split(' ')[1];
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.reply(`❌ Please link your wallet first using /link`);
      return;
    }

    if (!args || !['on', 'off'].includes(args.toLowerCase())) {
      const keyboard = new InlineKeyboard()
        .text(user.notificationsEnabled ? '🔕 Turn OFF' : '🔔 Turn ON', 'toggle_notifications');

      await ctx.reply(
        `🔔 *Notification Status*\n\n` +
        `Current: ${user.notificationsEnabled ? '🟢 Enabled' : '🔴 Disabled'}\n\n` +
        `Toggle using the button below or:\n` +
        `/notifications on\n` +
        `/notifications off`,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      return;
    }

    const enabled = args.toLowerCase() === 'on';
    
    await prisma.user.update({
      where: { id: user.id },
      data: { notificationsEnabled: enabled }
    });

    await ctx.reply(
      enabled
        ? `🔔 *Notifications Enabled!*\n\nYou'll receive alerts for new BSM messages.`
        : `🔕 *Notifications Disabled*\n\nYou won't receive alerts. Turn them back on with /notifications on`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle unknown messages
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    
    // Skip if it's a command
    if (text.startsWith('/')) return;

    // If user sends random text, guide them
    const keyboard = new InlineKeyboard()
      .text('🔗 Link Wallet', 'link_wallet')
      .text('📚 Help', 'help');

    await ctx.reply(
      `👋 I didn't quite understand that!\n\n` +
      `Use the buttons below or type /help for available commands.`,
      { reply_markup: keyboard }
    );
  });

  // Callback query handlers for inline buttons
  bot.callbackQuery('link_wallet', async (ctx) => {
    await ctx.answerCallbackQuery();
    const chatId = ctx.chat!.id.toString();
    
    // Check if already linked
    const existingUser = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (existingUser) {
      const keyboard = new InlineKeyboard()
        .text('📊 Status', 'check_status')
        .text('📬 Inbox', 'view_inbox');

      await ctx.editMessageText(
        `✅ Already linked to \`${formatWalletAddress(existingUser.walletAddress)}\``,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      return;
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.telegramVerification.deleteMany({
      where: { telegramChatId: chatId, used: false }
    });

    await prisma.telegramVerification.create({
      data: {
        code: verificationCode,
        telegramChatId: chatId,
        telegramUsername: ctx.from?.username || '',
        expiresAt
      }
    });

    const keyboard = new InlineKeyboard()
      .url('🌐 Open BSM', 'https://bsm.center');

    await ctx.editMessageText(
      `🔐 *Secure Linking*\n\n` +
      `Your code:\n` +
      `╔═══════════╗\n` +
      `║  \`${verificationCode}\`  ║\n` +
      `╚═══════════╝\n\n` +
      `⏰ Expires in 10 min\n\n` +
      `1️⃣ Open BSM\n` +
      `2️⃣ Connect wallet\n` +
      `3️⃣ Enter code\n` +
      `4️⃣ Get notifications! 🔔`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  bot.callbackQuery('check_status', async (ctx) => {
    await ctx.answerCallbackQuery();
    const chatId = ctx.chat!.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.editMessageText(
        `❌ *Not Linked*\n\nPlease use /link to connect your wallet.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const [totalMessages, unreadCount] = await Promise.all([
      prisma.message.count({ where: { toWallet: user.walletAddress } }),
      prisma.message.count({ 
        where: { 
          toWallet: user.walletAddress,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const keyboard = new InlineKeyboard()
      .text('📬 View Inbox', 'view_inbox')
      .text(user.notificationsEnabled ? '🔕 Mute' : '🔔 Unmute', 'toggle_notifications').row()
      .text('🔓 Unlink', 'unlink_wallet');

    const statusEmoji = user.notificationsEnabled ? '🟢' : '🟠';

    await ctx.editMessageText(
      `${statusEmoji} *Account Status*\n\n` +
      `🔗 *Wallet:* \`${formatWalletAddress(user.walletAddress)}\`\n` +
      `📬 *Total Messages:* ${totalMessages}\n` +
      `🆕 *Last 24h:* ${unreadCount} new\n` +
      `🔔 *Notifications:* ${user.notificationsEnabled ? 'ON ✅' : 'OFF 🔕'}`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  bot.callbackQuery('view_inbox', async (ctx) => {
    await ctx.answerCallbackQuery();
    const chatId = ctx.chat!.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.editMessageText(`❌ Please link your wallet first!`);
      return;
    }

    const messages = await prisma.message.findMany({
      where: { toWallet: user.walletAddress },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (messages.length === 0) {
      const keyboard = new InlineKeyboard()
        .url('🌐 BSM Web', 'https://bsm.center');

      await ctx.editMessageText(
        `📭 *Inbox Empty*\n\n` +
        `No messages yet!\n\n` +
        `🔗 Wallet: \`${formatWalletAddress(user.walletAddress)}\``,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      return;
    }

    let reply = `📬 *Your Inbox* (${messages.length} recent)\n\n`;
    
    messages.forEach((msg, index) => {
      const timeAgo = formatTimeAgo(new Date(msg.createdAt));
      const fromAddress = formatWalletAddress(msg.fromWallet);
      const icon = index === 0 ? '🆕' : '📧';
      
      reply += `${icon} \`${fromAddress}\` • ${timeAgo}\n`;
    });

    const keyboard = new InlineKeyboard()
      .url('🔓 Read Messages', 'https://bsm.center')
      .text('🔄 Refresh', 'view_inbox');

    reply += `\n🔒 Click "Read Messages" to decrypt on BSM.`;

    await ctx.editMessageText(reply, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  });

  bot.callbackQuery('toggle_notifications', async (ctx) => {
    const chatId = ctx.chat!.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.answerCallbackQuery({ text: '❌ Not linked!' });
      return;
    }

    const newStatus = !user.notificationsEnabled;
    
    await prisma.user.update({
      where: { id: user.id },
      data: { notificationsEnabled: newStatus }
    });

    await ctx.answerCallbackQuery({ 
      text: newStatus ? '🔔 Notifications ON' : '🔕 Notifications OFF' 
    });

    // Refresh status view if available
    try {
      const keyboard = new InlineKeyboard()
        .text('📬 Inbox', 'view_inbox')
        .text(newStatus ? '🔕 Mute' : '🔔 Unmute', 'toggle_notifications').row()
        .text('🔓 Unlink', 'unlink_wallet');

      await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
    } catch {
      // Ignore if can't update markup
    }
  });

  bot.callbackQuery('unlink_wallet', async (ctx) => {
    const chatId = ctx.chat!.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.answerCallbackQuery({ text: '❌ Not linked!' });
      return;
    }

    const keyboard = new InlineKeyboard()
      .text('✅ Yes, Unlink', 'confirm_unlink')
      .text('❌ Cancel', 'cancel_unlink');

    await ctx.editMessageText(
      `⚠️ *Confirm Unlink*\n\n` +
      `Unlink wallet \`${formatWalletAddress(user.walletAddress)}\`?\n\n` +
      `You'll stop receiving notifications.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
    
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_unlink', async (ctx) => {
    const chatId = ctx.chat!.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.answerCallbackQuery({ text: '❌ Not linked!' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: null,
        telegramUsername: null
      }
    });

    const keyboard = new InlineKeyboard()
      .text('🔗 Link Again', 'link_wallet');

    await ctx.editMessageText(
      `✅ *Successfully Unlinked*\n\n` +
      `Wallet \`${formatWalletAddress(user.walletAddress)}\` has been unlinked.\n\n` +
      `You will no longer receive notifications.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );

    await ctx.answerCallbackQuery({ text: '✅ Wallet unlinked' });
  });

  bot.callbackQuery('cancel_unlink', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Cancelled' });
    await ctx.editMessageText(
      `✅ Action cancelled. Your wallet is still linked.`
    );
  });

  bot.callbackQuery('help', async (ctx) => {
    await ctx.answerCallbackQuery();
    
    const keyboard = new InlineKeyboard()
      .text('🔗 Link Wallet', 'link_wallet')
      .text('📊 Status', 'check_status').row()
      .text('📬 Inbox', 'view_inbox')
      .url('🌐 BSM Web', 'https://bsm.center');

    await ctx.editMessageText(
      `📚 *BSM Bot - Commands*\n\n` +
      `*Account:*\n` +
      `/link - Link BSC wallet\n` +
      `/unlink - Unlink wallet\n` +
      `/status - View stats\n\n` +
      `*Messages:*\n` +
      `/inbox - View messages\n` +
      `/notifications on|off\n\n` +
      `*Info:* /help • /start`,
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  });

  // Error handling
  bot.catch((err) => {
    console.error('❌ Bot error:', err);
  });

  return bot;
}

export { bot };
