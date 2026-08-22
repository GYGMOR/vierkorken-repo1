import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { sendEventNotificationEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 });
    }

    // 1. Fetch recipients
    const subscribedUsers = await prisma.user.findMany({
      where: { newsletterSubscribed: true, email: { not: undefined } },
      select: { email: true, firstName: true }
    });

    const newsletterSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, firstName: true }
    });

    const maintenanceSubscribers = await prisma.maintenanceModeSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    // Combine and deduplicate
    const emailMap = new Map<string, { email: string; firstName?: string }>();
    subscribedUsers.forEach((u: any) => {
      if (u.email) emailMap.set(u.email, { email: u.email, firstName: u.firstName || undefined });
    });
    newsletterSubscribers.forEach((s: any) => {
      if (s.email && !emailMap.has(s.email)) emailMap.set(s.email, { email: s.email, firstName: s.firstName || undefined });
    });
    maintenanceSubscribers.forEach((s: any) => {
      if (s.email && !emailMap.has(s.email)) emailMap.set(s.email, { email: s.email, firstName: undefined });
    });

    const allEmails = Array.from(emailMap.values());
    console.log(`📧 Manual send: Found ${allEmails.length} recipients for event "${event.title}"`);

    // 2. Send emails in chunks
    const chunkSize = 10;
    let sentCount = 0;
    for (let i = 0; i < allEmails.length; i += chunkSize) {
      const chunk = allEmails.slice(i, i + chunkSize);
      await Promise.all(chunk.map((emailObj) => sendEventNotificationEmail(emailObj.email, event, emailObj.firstName)));
      sentCount += chunk.length;
    }

    // 3. Update sent metadata in venueAddress JSON
    const currentVenueAddress = (event.venueAddress as any) || {};
    const currentCount = Number(currentVenueAddress.newsletterSentCount || 0);
    const updatedCount = currentCount + 1;
    const nowIso = new Date().toISOString();

    const updatedVenueAddress = {
      ...currentVenueAddress,
      newsletterSentCount: updatedCount,
      lastNewsletterSentAt: nowIso,
    };

    await prisma.event.update({
      where: { id },
      data: {
        venueAddress: updatedVenueAddress,
      },
    });

    return NextResponse.json({
      success: true,
      recipientCount: allEmails.length,
      newsletterSentCount: updatedCount,
      lastNewsletterSentAt: nowIso,
      message: `Newsletter wurde erfolgreich an ${allEmails.length} Empfänger versendet.`,
    });
  } catch (error: any) {
    console.error('Error sending event newsletter:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden des Newsletters', details: error.message },
      { status: 500 }
    );
  }
}
