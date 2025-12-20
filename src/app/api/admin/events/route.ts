import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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

    // Validate required fields
    if (!slug || !title || !description || !eventType || !venue || !startDateTime || !endDateTime || !maxCapacity || !price) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        slug,
        title,
        subtitle: subtitle || null,
        description,
        eventType,
        venue,
        venueAddress: venueAddress || {},
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
