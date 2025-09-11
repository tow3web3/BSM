import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PublicKey } from '@solana/web3.js';

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

    // Vérifier que l'adresse est valide
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
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
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
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

    // Vérifier que les adresses sont valides
    try {
      new PublicKey(fromWallet);
      new PublicKey(toWallet);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet addresses' },
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

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
