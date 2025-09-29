import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contacts - Get all contacts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const contacts = await prisma.contact.findMany({
      where: { ownerWallet: wallet },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const { ownerWallet, address, name } = await request.json();

    if (!ownerWallet || !address || !name) {
      return NextResponse.json({ error: 'Owner wallet, address, and name are required' }, { status: 400 });
    }

    // Validate Solana address format (basic check)
    if (address.length < 32 || address.length > 44) {
      return NextResponse.json({ error: 'Invalid Solana address format' }, { status: 400 });
    }

    // Check if contact already exists
    const existingContact = await prisma.contact.findUnique({
      where: {
        ownerWallet_address: {
          ownerWallet,
          address
        }
      }
    });

    if (existingContact) {
      return NextResponse.json({ error: 'Contact already exists' }, { status: 409 });
    }

    const contact = await prisma.contact.create({
      data: {
        ownerWallet,
        address,
        name: name.trim()
      }
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
