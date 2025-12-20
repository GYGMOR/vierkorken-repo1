/**
 * Admin Ticket Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

export async function GET(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const eventId = searchParams.get('eventId');
  const status = searchParams.get('status');

  const where: any = {};
  if (eventId) where.eventId = eventId;
  if (status) where.status = status;

  const tickets = await prisma.eventTicket.findMany({
    where,
    include: {
      event: { select: { title: true, startDateTime: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: tickets });
}
