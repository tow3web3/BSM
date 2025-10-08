import { NextRequest, NextResponse } from 'next/server';
import { webhookCallback } from 'grammy';
import { initBot } from '@/lib/telegram-bot';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set');
}

let bot: ReturnType<typeof initBot> | null = null;

// Initialize bot if token is available
if (token) {
  bot = initBot(token);
}

export async function POST(req: NextRequest) {
  if (!bot || !token) {
    return NextResponse.json(
      { error: 'Bot not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    
    // Handle the update using Grammy's webhook callback
    const callback = webhookCallback(bot, 'std/http');
    
    // Convert Next.js request to standard Request
    const response = await callback(
      new Request(req.url, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify(body)
      })
    );

    return response;
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'Bot webhook endpoint',
    configured: !!bot
  });
}

