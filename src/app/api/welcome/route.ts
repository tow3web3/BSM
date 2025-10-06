import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toWallet } = body;

    if (!toWallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const welcomeMessage = {
      fromWallet: 'Binance Smart Mail System',
      toWallet: toWallet,
      ciphertext: Buffer.from(`Welcome to Binance Smart Mail! 🚀

Your wallet is now your secure email address. Here's what you can do:

🔐 **End-to-End Encryption**: All messages are encrypted with your wallet signature
📧 **Universal Messaging**: Send messages to any BSC wallet address
🔒 **Privacy First**: Only you can read your messages
⚡ **Fast & Secure**: Built on Binance Smart Chain's reliable network
💰 **Low Fees**: Benefit from BSC's low gas costs

**Getting Started:**
• Share your wallet address with friends to receive messages
• Use the "Compose" button to send encrypted messages
• Your inbox keeps all your conversations organized

**Security Features:**
• Wallet-based authentication (no passwords needed)
• Military-grade encryption
• Messages stored securely in database
• MetaMask & Trust Wallet integration

**$BSM Token:**
• Get $BSM tokens for premium features
• Enhanced messaging capabilities
• Priority support

Ready to revolutionize your messaging experience? Start by sending a test message to yourself or share your wallet address with friends!

Happy messaging! ✨

- The Binance Smart Mail Team`).toString('base64'),
      nonce: Buffer.from('welcome-nonce-' + Date.now()).toString('base64'),
      ephPub: Buffer.from('welcome-key-' + Date.now()).toString('base64')
    };

    // Vérifier si un message de bienvenue existe déjà
    const existingWelcome = await prisma.message.findFirst({
      where: {
        fromWallet: 'Binance Smart Mail System',
        toWallet: toWallet,
      },
    });

    if (existingWelcome) {
      return NextResponse.json({
        success: true,
        message: 'Welcome message already exists',
      });
    }

    // Créer le message de bienvenue
    const message = await prisma.message.create({
      data: welcomeMessage,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating welcome message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
