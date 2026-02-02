import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Fetch user's event tickets
    const tickets = await prisma.eventTicket.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format tickets for response
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      qrCode: ticket.qrCode,
      status: ticket.status,
      price: Number(ticket.price),
      holderFirstName: ticket.holderFirstName,
      holderLastName: ticket.holderLastName,
      holderEmail: ticket.holderEmail,
      checkedInAt: ticket.checkedInAt,
      createdAt: ticket.createdAt,
      event: ticket.event ? {
        id: ticket.event.id,
        title: ticket.event.title,
        subtitle: ticket.event.subtitle,
        eventType: ticket.event.eventType,
        venue: ticket.event.venue,
        startDateTime: ticket.event.startDateTime,
        endDateTime: ticket.event.endDateTime,
        duration: ticket.event.duration,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
    });
  } catch (error: any) {
    console.error('Error fetching user tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Tickets', details: error.message },
      { status: 500 }
    );
  }
}
