import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSignature, isValidAddress } from '@/lib/bsc-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, signature, message } = body;

    if (!publicKey || !signature || !message) {
      return NextResponse.json(
        { error: 'Wallet address, signature and message required' },
        { status: 400 }
      );
    }

    // Verify that the address is valid (BSC format)
    if (!isValidAddress(publicKey)) {
      return NextResponse.json(
        { error: 'Invalid BSC wallet address' },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = verifyAuthSignature(publicKey, message, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Generate session token (in production, use JWT with secret)
    const sessionToken = Buffer.from(`${publicKey}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      sessionToken,
      walletAddress: publicKey,
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
