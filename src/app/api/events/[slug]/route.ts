import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if event is published or user is admin
    if (event.status !== 'PUBLISHED') {
      const session = await getServerSession(authOptions);
      const isAdmin = session?.user?.role === 'ADMIN';

      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Event ist nicht verfügbar' },
          { status: 404 }
        );
      }
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
        includeTax: event.includeTax,
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
