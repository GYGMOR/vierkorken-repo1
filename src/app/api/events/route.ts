import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force Node.js runtime (required for Prisma)
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const where = includeUnpublished
      ? {}
      : {
        status: "PUBLISHED" as const,
        startDateTime: {
          gte: new Date(), // Only future events
        },
      };

    const events = await prisma.event.findMany({
      where,
      orderBy: [{ startDateTime: "asc" }],
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
        minLoyaltyLevel: event.minLoyaltyLevel,
        isPrivate: event.isPrivate,
        status: event.status,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Events", details: error.message },
      { status: 500 },
    );
  }
}
