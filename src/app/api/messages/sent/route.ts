import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Récupérer les messages envoyés par ce wallet
    const sentMessages = await prisma.message.findMany({
      where: {
        fromWallet: wallet
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fromWallet: true,
        toWallet: true,
        ciphertext: true,
        nonce: true,
        ephPub: true,
        createdAt: true
      }
    });

    return NextResponse.json(sentMessages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    return NextResponse.json({ error: 'Failed to fetch sent messages' }, { status: 500 });
  }
}
