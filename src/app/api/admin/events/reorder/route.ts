import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/admin/events/reorder
 *
 * PROFESSIONAL: Bulk updates the sortOrder for multiple events
 * Only accessible by ADMIN users.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Session check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // 2. Parse payload
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        {
          success: false,
          error: "Expected an array of events with id and sortOrder",
        },
        { status: 400 },
      );
    }

    console.log(`🔄 Reordering ${events.length} events...`);

    // 3. Update all events in a transaction
    await prisma.$transaction(
      events.map((event) =>
        prisma.event.update({
          where: { id: event.id },
          data: { sortOrder: event.sortOrder },
        }),
      ),
    );

    console.log("✅ Events reordered successfully");

    return NextResponse.json({
      success: true,
      message: "Reordered successfully",
    });
  } catch (error: any) {
    console.error("❌ Error reordering events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reorder events",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
