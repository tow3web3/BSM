import { Bot, Context, session, SessionFlavor } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { generateAuthMessage } from './bsc-auth';

const prisma = new PrismaClient();

// Session data structure
interface SessionData {
  step?: 'awaiting_wallet' | 'awaiting_signature';
  tempWallet?: string;
}

type MyContext = Context & SessionFlavor<SessionData>;

// Initialize bot (will be set in initBot function)
let bot: Bot<MyContext> | null = null;

export function initBot(token: string) {
  if (bot) return bot;

  bot = new Bot<MyContext>(token);

  // Use sessions for conversation state
  bot.use(session({ initial: (): SessionData => ({}) }));

  // Start command
  bot.command('start', async (ctx) => {
    await ctx.reply(
      `🚀 *Welcome to Binance Smart Mail Bot!*\n\n` +
      `I'll help you get notifications for your BSM messages.\n\n` +
      `*Available Commands:*\n` +
      `/link - Link your BSC wallet to receive notifications\n` +
      `/status - Check your connection status\n` +
      `/inbox - View your recent messages\n` +
      `/help - Show all commands\n\n` +
      `💡 *Get started:* Use /link to connect your wallet!`,
      { parse_mode: 'Markdown' }
    );
  });

  // Help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📚 *BSM Bot Commands*\n\n` +
      `/link - Link your BSC wallet\n` +
      `/unlink - Unlink your wallet\n` +
      `/status - Check connection status\n` +
      `/inbox - View recent messages\n` +
      `/notifications on/off - Toggle notifications\n` +
      `/help - Show this message\n\n` +
      `Need help? Visit https://bsm.center`,
      { parse_mode: 'Markdown' }
    );
  });

  // Link wallet command
  bot.command('link', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    // Check if already linked
    const existingUser = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (existingUser) {
      await ctx.reply(
        `✅ You're already linked to wallet:\n` +
        `\`${existingUser.walletAddress}\`\n\n` +
        `To link a different wallet, use /unlink first.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    await ctx.reply(
      `🔗 *Link Your Wallet*\n\n` +
      `To link your BSC wallet, please send me your wallet address.\n\n` +
      `Example: \`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\`\n\n` +
      `⚠️ Make sure this is YOUR wallet address!`,
      { parse_mode: 'Markdown' }
    );

    ctx.session.step = 'awaiting_wallet';
  });

  // Unlink wallet command
  bot.command('unlink', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.reply(`❌ No wallet is currently linked to this account.`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: null,
        telegramUsername: null
      }
    });

    await ctx.reply(
      `✅ Successfully unlinked wallet \`${user.walletAddress}\`\n\n` +
      `You will no longer receive notifications. Use /link to link again.`,
      { parse_mode: 'Markdown' }
    );
  });

  // Status command
  bot.command('status', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.reply(
        `❌ *Not Linked*\n\n` +
        `You haven't linked a wallet yet. Use /link to get started!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const messageCount = await prisma.message.count({
      where: { toWallet: user.walletAddress }
    });

    await ctx.reply(
      `✅ *Connected*\n\n` +
      `🔗 Wallet: \`${user.walletAddress}\`\n` +
      `📬 Messages: ${messageCount}\n` +
      `🔔 Notifications: ${user.notificationsEnabled ? 'ON' : 'OFF'}\n\n` +
      `Use /notifications to toggle notifications.`,
      { parse_mode: 'Markdown' }
    );
  });

  // Inbox command
  bot.command('inbox', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      await ctx.reply(`❌ Please link your wallet first using /link`);
      return;
    }

    const messages = await prisma.message.findMany({
      where: { toWallet: user.walletAddress },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (messages.length === 0) {
      await ctx.reply(
        `📭 *No Messages*\n\n` +
        `Your inbox is empty. Share your wallet address to receive messages!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let reply = `📬 *Recent Messages* (${messages.length})\n\n`;
    
    messages.forEach((msg, index) => {
      const date = new Date(msg.createdAt).toLocaleString();
      const fromShort = `${msg.fromWallet.slice(0, 6)}...${msg.fromWallet.slice(-4)}`;
      reply += `${index + 1}. From: \`${fromShort}\`\n   📅 ${date}\n\n`;
    });

    reply += `🌐 View full messages at https://bsm.center`;

    await ctx.reply(reply, { parse_mode: 'Markdown' });
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
      await ctx.reply(
        `Current status: ${user.notificationsEnabled ? '🔔 ON' : '🔕 OFF'}\n\n` +
        `Usage: /notifications on or /notifications off`
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
        ? `🔔 Notifications enabled! You'll receive alerts for new messages.`
        : `🔕 Notifications disabled. You can turn them back on anytime.`
    );
  });

  // Handle wallet address input
  bot.on('message:text', async (ctx) => {
    // Skip if it's a command
    if (ctx.message.text.startsWith('/')) return;

    if (ctx.session.step === 'awaiting_wallet') {
      const walletAddress = ctx.message.text.trim();
      
      // Basic validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        await ctx.reply(
          `❌ Invalid wallet address format.\n\n` +
          `Please send a valid BSC wallet address starting with 0x`
        );
        return;
      }

      // Check if wallet already linked to another Telegram
      const existingUser = await prisma.user.findUnique({
        where: { walletAddress }
      });

      if (existingUser && existingUser.telegramChatId) {
        await ctx.reply(
          `❌ This wallet is already linked to another Telegram account.\n\n` +
          `Each wallet can only be linked to one Telegram account.`
        );
        ctx.session.step = undefined;
        return;
      }

      const chatId = ctx.chat.id.toString();
      const username = ctx.from?.username || '';

      // Create or update user
      await prisma.user.upsert({
        where: { walletAddress },
        update: {
          telegramChatId: chatId,
          telegramUsername: username
        },
        create: {
          walletAddress,
          telegramChatId: chatId,
          telegramUsername: username
        }
      });

      await ctx.reply(
        `✅ *Wallet Linked Successfully!*\n\n` +
        `🔗 Wallet: \`${walletAddress}\`\n` +
        `🔔 You'll now receive notifications for new messages!\n\n` +
        `📱 Use /status to check your connection\n` +
        `📬 Use /inbox to view recent messages`,
        { parse_mode: 'Markdown' }
      );

      ctx.session.step = undefined;
    }
  });

  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  return bot;
}

export { bot };

