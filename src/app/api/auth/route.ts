import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSignature, generateAuthMessage } from '@/lib/solana-auth';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, signature, message } = body;

    if (!publicKey || !signature || !message) {
      return NextResponse.json(
        { error: 'Public key, signature and message required' },
        { status: 400 }
      );
    }

    // Vérifier que l'adresse publique est valide
    let walletPublicKey: PublicKey;
    try {
      walletPublicKey = new PublicKey(publicKey);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Vérifier la signature
    const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));
    const isValid = verifyAuthSignature(walletPublicKey, message, signatureBytes);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Générer un token de session simple (en production, utilisez JWT)
    const sessionToken = Buffer.from(
      `${publicKey}:${Date.now()}:${Math.random()}`
    ).toString('base64');

    return NextResponse.json({
      success: true,
      sessionToken,
      wallet: {
        publicKey: publicKey,
      },
    });
  } catch (err) {
    console.error('Erreur lors de l\'authentification:', err);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

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
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Générer un message d'authentification
    const publicKey = new PublicKey(walletAddress);
    const authMessage = generateAuthMessage(publicKey);

    return NextResponse.json({
      success: true,
      message: authMessage,
    });
  } catch (err) {
    console.error('Erreur lors de la génération du message d\'auth:', err);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
