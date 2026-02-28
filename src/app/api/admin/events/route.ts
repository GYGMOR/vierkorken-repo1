import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { sendEventNotificationEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// GET all events (for admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      orderBy: {
        startDateTime: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      events: events.map((event) => ({
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
        availableTickets: event.maxCapacity - event.currentCapacity,
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
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Events', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    // Check if user is admin
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
    } = body;

    const isDraft = status === 'DRAFT';

    // Validate required fields (stricter for PUBLISHED, looser for DRAFT)
    if (!slug || !title || !eventType || !startDateTime || !endDateTime || !maxCapacity || !price) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen (Titel, Slug, Datum, Kapazität, Preis)' },
        { status: 400 }
      );
    }

    if (!isDraft && (!venue || !description)) {
      return NextResponse.json(
        { error: 'Für veröffentlichte Events müssen Veranstaltungsort und Beschreibung eingegeben werden.' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        slug,
        title,
        subtitle: subtitle || null,
        description: description || '',
        eventType,
        venue: venue || '',
        venueAddress: venueAddress && Object.keys(venueAddress).length > 0 ? venueAddress : {},
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        duration: duration || null,
        maxCapacity: parseInt(maxCapacity),
        currentCapacity: 0,
        price: parseFloat(price),
        memberPrice: memberPrice ? parseFloat(memberPrice) : null,
        featuredImage: featuredImage || null,
        galleryImages: galleryImages || [],
        featuredWines: featuredWines || null,
        minLoyaltyLevel: minLoyaltyLevel || null,
        isPrivate: isPrivate || false,
        requiresApproval: requiresApproval || false,
        followUpOffer: followUpOffer || null,
        followUpDuration: followUpDuration || null,
        status: status || 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    // -------------------------------------------------------------
    // AUTOMATIC NEWS GENERATION & NOTIFICATION
    // -------------------------------------------------------------
    try {
      // 1. Create linked News Item
      console.log('📰 Creating automatic news item for event:', event.id);

      const newsSlug = `event-${slug}`;
      const newsTitle = title; // Same title
      // Create a short excerpt from description (first 150 chars)
      const newsExcerpt = description.length > 150
        ? description.substring(0, 150) + '...'
        : description;

      await prisma.news.create({
        data: {
          slug: newsSlug,
          title: newsTitle,
          excerpt: newsExcerpt,
          content: description, // Full description
          featuredImage: featuredImage,
          status: status as any, // Sync status with event
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
          type: 'EVENT', // New field
          eventId: event.id,
          isPinned: true, // Pin events by default? Or maybe not. Let's say yes for visibility.
        }
      });
      console.log('✅ News item created successfully');

      // 2. Send Email Notification (if PUBLISHED)
      if (status === 'PUBLISHED') {
        console.log('📧 Starting event notification distribution...');

        // Fetch recipients
        // A. Users with newsletter subscription
        const subscribedUsers = await prisma.user.findMany({
          where: { newsletterSubscribed: true, email: { not: undefined } },
          select: { email: true }
        });

        // B. Newsletter Subscribers (guests)
        const newsletterSubscribers = await prisma.newsletterSubscriber.findMany({
          where: { isActive: true },
          select: { email: true }
        });

        // Combine and dedup
        const allEmails = new Set([
          ...subscribedUsers.map(u => u.email),
          ...newsletterSubscribers.map(s => s.email)
        ].filter(Boolean));

        console.log(`📧 Found ${allEmails.size} unique recipients`);

        // Send emails (chunks of 10 to avoid overwhelming)
        const emailList = Array.from(allEmails);
        const chunkSize = 10;

        // We don't await the entire batching to return response faster? 
        // No, Vercel might kill it. We must await.
        // We'll process in background if possible, but here we just loop.

        // Optimize: Send to dev only if dev mode is handled in email.ts? 
        // Yes, email.ts has the safe guard. We just pass all emails.

        let sentCount = 0;
        for (let i = 0; i < emailList.length; i += chunkSize) {
          const chunk = emailList.slice(i, i + chunkSize);
          await Promise.all(chunk.map(email => sendEventNotificationEmail(email, event)));
          sentCount += chunk.length;
          console.log(`📧 Sent chunk ${i / chunkSize + 1} (${sentCount}/${emailList.length})`);
        }

        console.log('✅ All event notifications sent');
      }

    } catch (newsError) {
      console.error('⚠️ Error in automatic news/email generation:', newsError);
      // We don't fail the request because the event itself was created successfully
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
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Events', details: error.message },
      { status: 500 }
    );
  }
}
