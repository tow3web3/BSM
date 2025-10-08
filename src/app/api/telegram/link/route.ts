import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyLinkSuccess } from '@/lib/telegram-notify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, verificationCode } = body;

    if (!walletAddress || !verificationCode) {
      return NextResponse.json(
        { error: 'Wallet address and verification code are required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Find verification code
    const verification = await prisma.telegramVerification.findUnique({
      where: { code: verificationCode }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 404 }
      );
    }

    // Check if code is expired
    if (new Date() > verification.expiresAt) {
      // Delete expired code
      await prisma.telegramVerification.delete({
        where: { id: verification.id }
      });
      
      return NextResponse.json(
        { error: 'Verification code expired. Please generate a new one in Telegram.' },
        { status: 410 }
      );
    }

    // Check if code was already used
    if (verification.used) {
      return NextResponse.json(
        { error: 'Verification code already used' },
        { status: 410 }
      );
    }

    // Check if this wallet is already linked to a different Telegram
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (existingUser && existingUser.telegramChatId && 
        existingUser.telegramChatId !== verification.telegramChatId) {
      return NextResponse.json(
        { error: 'This wallet is already linked to another Telegram account' },
        { status: 409 }
      );
    }

    // Link the wallet to Telegram
    await prisma.user.upsert({
      where: { walletAddress },
      update: {
        telegramChatId: verification.telegramChatId,
        telegramUsername: verification.telegramUsername
      },
      create: {
        walletAddress,
        telegramChatId: verification.telegramChatId,
        telegramUsername: verification.telegramUsername
      }
    });

    // Mark verification code as used
    await prisma.telegramVerification.update({
      where: { id: verification.id },
      data: { used: true }
    });

    // Send success notification to Telegram (non-blocking)
    notifyLinkSuccess(verification.telegramChatId, walletAddress).catch(err => {
      console.error('Failed to send link success notification:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram successfully linked! You will now receive notifications.',
      telegramUsername: verification.telegramUsername
    });

  } catch (error) {
    console.error('Error linking Telegram:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a wallet is linked
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    return NextResponse.json({
      linked: !!user?.telegramChatId,
      telegramUsername: user?.telegramUsername || null,
      notificationsEnabled: user?.notificationsEnabled || false
    });

  } catch (error) {
    console.error('Error checking Telegram link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

