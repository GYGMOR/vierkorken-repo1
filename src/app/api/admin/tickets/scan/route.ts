/**
 * Ticket Scanner API
 * POST /api/admin/tickets/scan - Scan and validate ticket QR code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.role === 'ADMIN';
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { qrCode } = body;

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'QR code is required',
        },
        { status: 400 }
      );
    }

    console.log('🎫 Scanning ticket:', qrCode);

    // Find ticket by QR code
    const ticket = await prisma.eventTicket.findUnique({
      where: { qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ticket) {
      console.log('❌ Ticket not found');
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Ticket nicht gefunden',
        message: 'Ungültiger QR-Code',
      });
    }

    // Check ticket status
    if (ticket.status === 'CANCELLED') {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Ticket storniert',
        message: 'Dieses Ticket wurde storniert',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event.title,
          holder: `${ticket.user.firstName} ${ticket.user.lastName}`,
        },
      });
    }

    if (ticket.status === 'REFUNDED') {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Ticket erstattet',
        message: 'Dieses Ticket wurde erstattet',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event.title,
          holder: `${ticket.user.firstName} ${ticket.user.lastName}`,
        },
      });
    }

    if (ticket.status === 'CHECKED_IN') {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Bereits eingecheckt',
        message: `Bereits eingecheckt am ${new Date(ticket.checkedInAt!).toLocaleString('de-CH')}`,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event.title,
          holder: `${ticket.user.firstName} ${ticket.user.lastName}`,
          checkedInAt: ticket.checkedInAt,
        },
      });
    }

    // Check event status
    if (ticket.event.status === 'CANCELLED') {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Event abgesagt',
        message: 'Dieses Event wurde abgesagt',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event.title,
          holder: `${ticket.user.firstName} ${ticket.user.lastName}`,
        },
      });
    }

    // Check if event has started (allow check-in 1 hour before)
    const now = new Date();
    const eventStart = new Date(ticket.event.startDateTime);
    const checkInAllowedFrom = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 hour before

    if (now < checkInAllowedFrom) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Zu früh',
        message: `Check-in ab ${checkInAllowedFrom.toLocaleString('de-CH')} möglich`,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event.title,
          holder: `${ticket.user.firstName} ${ticket.user.lastName}`,
          startDateTime: ticket.event.startDateTime,
        },
      });
    }

    // Check if event has ended (allow check-in until 2 hours after end)
    const eventEnd = new Date(ticket.event.endDateTime);
    const checkInAllowedUntil = new Date(eventEnd.getTime() + 2 * 60 * 60 * 1000); // 2 hours after

    if (now > checkInAllowedUntil) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Event beendet',
        message: 'Check-in für dieses Event nicht mehr möglich',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event.title,
          holder: `${ticket.user.firstName} ${ticket.user.lastName}`,
          endDateTime: ticket.event.endDateTime,
        },
      });
    }

    // All checks passed - mark as checked in
    const session = await getServerSession(authOptions);
    const adminId = session?.user?.id || 'ADMIN';

    const updatedTicket = await prisma.eventTicket.update({
      where: { id: ticket.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedInBy: adminId,
      },
      include: {
        event: {
          select: {
            title: true,
            startDateTime: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log('✅ Ticket checked in successfully');

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'Ticket gültig - Willkommen!',
      ticket: {
        ticketNumber: updatedTicket.ticketNumber,
        event: updatedTicket.event.title,
        holder: `${updatedTicket.user.firstName} ${updatedTicket.user.lastName}`,
        holderEmail: updatedTicket.user.email,
        startDateTime: updatedTicket.event.startDateTime,
        checkedInAt: updatedTicket.checkedInAt,
      },
    });
  } catch (error: any) {
    console.error('❌ Error scanning ticket:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
