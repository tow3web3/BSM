// Simple bot server for deployment
import { initBot } from './src/lib/telegram-bot.js';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

console.log('🤖 Starting Telegram Bot in polling mode...');

const bot = initBot(token);
bot.start();

console.log('✅ Bot is running!');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Stopping bot...');
  bot.stop();
  process.exit(0);
});

