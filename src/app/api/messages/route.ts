import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidAddress } from '@/lib/bsc-auth';
import { notifyNewMessage } from '@/lib/telegram-notify';

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

    // Verify that the address is valid (BSC format)
    if (!isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid BSC wallet address' },
        { status: 400 }
      );
    }

    // Récupérer les messages reçus par ce wallet
    const messages = await prisma.message.findMany({
      where: {
        toWallet: walletAddress,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        fromWallet: true,
        ciphertext: true,
        nonce: true,
        ephPub: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        fromWallet: msg.fromWallet,
        ciphertext: msg.ciphertext,
        nonce: msg.nonce,
        ephPub: msg.ephPub,
        createdAt: msg.createdAt,
      })),
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromWallet, toWallet, ciphertext, nonce, ephPub } = body;

    // Validation des données
    if (!fromWallet || !toWallet || !ciphertext || !nonce || !ephPub) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify that the addresses are valid (BSC format)
    if (!isValidAddress(fromWallet) || !isValidAddress(toWallet)) {
      return NextResponse.json(
        { error: 'Invalid BSC wallet addresses' },
        { status: 400 }
      );
    }

    // Enregistrer le message en base de données
    const message = await prisma.message.create({
      data: {
        fromWallet,
        toWallet,
        ciphertext,
        nonce,
        ephPub,
      },
    });

    // Send Telegram notification (non-blocking)
    notifyNewMessage(toWallet, fromWallet).catch(err => {
      console.error('Failed to send Telegram notification:', err);
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        createdAt: message.createdAt,
      },
    });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du message:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
