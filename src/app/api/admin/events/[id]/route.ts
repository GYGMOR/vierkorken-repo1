import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { sendEventNotificationEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// GET single event
export async function GET(
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

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        eventType: event.eventType,
        venue: event.venue,
        venueAddress: event.venueAddress,
        startDateTime: event.startDateTime.toISOString(),
        endDateTime: event.endDateTime.toISOString(),
        duration: event.duration,
        maxCapacity: event.maxCapacity,
        currentCapacity: event.currentCapacity,
        price: Number(event.price),
        memberPrice: event.memberPrice ? Number(event.memberPrice) : null,
        featuredImage: event.featuredImage,
        galleryImages: event.galleryImages,
        featuredWines: event.featuredWines,
        minLoyaltyLevel: event.minLoyaltyLevel,
        isPrivate: event.isPrivate,
        requiresApproval: event.requiresApproval,
        followUpOffer: event.followUpOffer,
        followUpDuration: event.followUpDuration,
        status: event.status,
        publishedAt: event.publishedAt?.toISOString(),
        timeDisplay: (event as any).timeDisplay || null,
        endTimeDisplay: (event as any).endTimeDisplay || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Events', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(
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

    const body = await req.json();
    const {
      slug,
      title,
      subtitle,
      description,
      eventType,
      venue,
      venueAddress,
      startDateTime,
      endDateTime,
      duration,
      maxCapacity,
      price,
      memberPrice,
      featuredImage,
      galleryImages,
      featuredWines,
      minLoyaltyLevel,
      isPrivate,
      requiresApproval,
      followUpOffer,
      followUpDuration,
      status,
      timeDisplay,
      endTimeDisplay,
    } = body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 });
    }

    // Check for slug uniqueness if it's being changed
    if (slug !== undefined && slug !== existingEvent.slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Dieser Slug wird bereits für ein anderes Event verwendet.' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle || null;
    if (description !== undefined) updateData.description = description;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (venue !== undefined) updateData.venue = venue;
    if (venueAddress !== undefined) updateData.venueAddress = venueAddress;
    if (startDateTime !== undefined) updateData.startDateTime = new Date(startDateTime);
    if (endDateTime !== undefined) updateData.endDateTime = new Date(endDateTime);
    if (duration !== undefined) updateData.duration = duration || null;
    if (maxCapacity !== undefined) updateData.maxCapacity = parseInt(maxCapacity);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (memberPrice !== undefined) updateData.memberPrice = memberPrice ? parseFloat(memberPrice) : null;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage || null;
    if (galleryImages !== undefined) updateData.galleryImages = galleryImages;
    if (featuredWines !== undefined) updateData.featuredWines = featuredWines;
    if (minLoyaltyLevel !== undefined) updateData.minLoyaltyLevel = minLoyaltyLevel || null;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (requiresApproval !== undefined) updateData.requiresApproval = requiresApproval;
    if (followUpOffer !== undefined) updateData.followUpOffer = followUpOffer;
    if (followUpDuration !== undefined) updateData.followUpDuration = followUpDuration;
    if (timeDisplay !== undefined) updateData.timeDisplay = timeDisplay || null;
    if (endTimeDisplay !== undefined) updateData.endTimeDisplay = endTimeDisplay || null;

    // Handle status changes
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt if publishing for the first time
      if (status === 'PUBLISHED' && !existingEvent.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    // -------------------------------------------------------------
    // AUTOMATIC NEWS SYNC & NOTIFICATION
    // -------------------------------------------------------------
    // We update the news item if the event is published (or becoming published)
    if (status === 'PUBLISHED' || event.status === 'PUBLISHED') {
      try {
        const newsSlug = `event-${event.slug}`;
        const currentDescription = description ?? event.description;
        const plainDesc = currentDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const newsExcerpt = plainDesc.length > 150 ? plainDesc.substring(0, 150) + '...' : plainDesc;

        await prisma.news.upsert({
          where: { slug: newsSlug },
          update: {
            title: event.title,
            excerpt: newsExcerpt,
            content: currentDescription,
            featuredImage: event.featuredImage,
            status: 'PUBLISHED',
            // Only update publishedAt if it wasn't already set on the news item
            type: 'EVENT',
            eventId: event.id,
            isPinned: true,
          },
          create: {
            slug: newsSlug,
            title: event.title,
            excerpt: newsExcerpt,
            content: currentDescription,
            featuredImage: event.featuredImage,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            type: 'EVENT',
            eventId: event.id,
            isPinned: true,
          },
        });

        // ONLY send newsletter if it's being published for the FIRST time
        const beingPublishedFirstTime = status === 'PUBLISHED' && existingEvent.status !== 'PUBLISHED';
        if (beingPublishedFirstTime) {
          const subscribedUsers = await prisma.user.findMany({
            where: { newsletterSubscribed: true, email: { not: undefined } },
            select: { email: true, firstName: true },
          });
          const newsletterSubscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            select: { email: true, firstName: true },
          });
          const maintenanceSubscribers = await prisma.maintenanceModeSubscriber.findMany({
            where: { isActive: true },
            select: { email: true },
          });

          const emailMap = new Map<string, { email: string; firstName?: string }>();
          subscribedUsers.forEach((u: any) => emailMap.set(u.email, { email: u.email, firstName: u.firstName || undefined }));
          newsletterSubscribers.forEach((s: any) => {
            if (!emailMap.has(s.email)) emailMap.set(s.email, { email: s.email, firstName: s.firstName || undefined });
          });
          maintenanceSubscribers.forEach((s: any) => {
            if (!emailMap.has(s.email)) emailMap.set(s.email, { email: s.email, firstName: undefined });
          });

          const allEmails = Array.from(emailMap.values());
          const chunkSize = 10;
          for (let i = 0; i < allEmails.length; i += chunkSize) {
            const chunk = allEmails.slice(i, i + chunkSize);
            await Promise.all(chunk.map((emailObj) => sendEventNotificationEmail(emailObj.email, event, emailObj.firstName)));
          }
          console.log(`✅ Newsletter sent to ${allEmails.length} recipients on first publish`);
        }

        console.log('✅ News synced successfully for event:', event.id);
      } catch (newsError) {
        console.error('⚠️ Error in news/newsletter sync:', newsError);
      }
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
      },
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Events', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE event
export async function DELETE(
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

    // Check if event has tickets
    const ticketCount = await prisma.eventTicket.count({
      where: { eventId: id },
    });

    if (ticketCount > 0) {
      return NextResponse.json(
        { error: 'Event kann nicht gelöscht werden, da bereits Tickets verkauft wurden' },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Event erfolgreich gelöscht',
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Events', details: error.message },
      { status: 500 }
    );
  }
}
