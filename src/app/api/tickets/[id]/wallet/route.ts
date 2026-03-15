import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'apple' or 'google'

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Get ticket with event
    const ticket = await prisma.eventTicket.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket nicht gefunden' },
        { status: 404 }
      );
    }

    // Verify ticket belongs to user
    if (ticket.userId !== user.id) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    if (type === 'apple') {
      // Apple Wallet requires .pkpass file
      // This requires proper certificates and signing
      // For now, we return instructions
      return NextResponse.json({
        success: false,
        message: 'Apple Wallet Integration erfordert Server-Zertifikate. Bitte kontaktieren Sie den Support.',
        instructions: [
          '1. Laden Sie das Ticket als PDF herunter',
          '2. Öffnen Sie das PDF auf Ihrem iPhone',
          '3. Screenshot des QR-Codes erstellen',
          '4. QR-Code beim Check-in vorzeigen',
        ],
      });
    }

    if (type === 'google') {
      // Google Wallet Pass
      // This also requires Google Cloud Console setup
      const googleWalletData = {
        ticketNumber: ticket.ticketNumber,
        eventName: ticket.event.title,
        eventDate: ticket.event.startDateTime,
        venue: ticket.event.venue,
        qrCode: ticket.qrCode,
        holderName: `${ticket.holderFirstName} ${ticket.holderLastName}`,
      };

      return NextResponse.json({
        success: false,
        message: 'Google Wallet Integration erfordert Google Cloud Setup. Bitte kontaktieren Sie den Support.',
        data: googleWalletData,
        instructions: [
          '1. Laden Sie das Ticket als PDF herunter',
          '2. Öffnen Sie das PDF auf Ihrem Android-Gerät',
          '3. Screenshot des QR-Codes erstellen',
          '4. QR-Code beim Check-in vorzeigen',
        ],
      });
    }

    return NextResponse.json({
      error: 'Ungültiger Wallet-Typ. Verwenden Sie "apple" oder "google".',
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error generating wallet pass:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Wallet-Passes', details: error.message },
      { status: 500 }
    );
  }
}
