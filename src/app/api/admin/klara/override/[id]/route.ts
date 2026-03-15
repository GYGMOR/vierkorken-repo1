/**
 * KLARA Product Override API
 * Manage custom edits for KLARA products
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


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

/**
 * GET - Fetch override for a specific KLARA article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!await checkAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }


    const override = await prisma.klaraProductOverride.findUnique({
      where: { klaraArticleId: id },
    });

    return NextResponse.json({
      success: true,
      data: override,
    });

  } catch (error: any) {
    console.error('Error fetching KLARA override:', error);
    return NextResponse.json(
      { error: 'Failed to fetch override', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Create or update override for a KLARA article
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!await checkAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      customName,
      customDescription,
      customPrice,
      customImages,
      customData,
      isActive,
    } = body;

    // Upsert (create or update)
    const override = await prisma.klaraProductOverride.upsert({
      where: { klaraArticleId: id },
      create: {
        klaraArticleId: id,
        customName,
        customDescription,
        customPrice,
        customImages: customImages || [],
        customData,
        isActive: isActive !== undefined ? isActive : true,
      },
      update: {
        customName,
        customDescription,
        customPrice,
        customImages: customImages || [],
        customData,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: override,
      message: 'Override saved successfully',
    });

  } catch (error: any) {
    console.error('Error saving KLARA override:', error);
    return NextResponse.json(
      { error: 'Failed to save override', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove override for a KLARA article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!await checkAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }


    await prisma.klaraProductOverride.delete({
      where: { klaraArticleId: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Override deleted successfully',
    });

  } catch (error: any) {
    // If override doesn't exist, that's fine
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: true,
        message: 'Override not found (already deleted)',
      });
    }

    console.error('Error deleting KLARA override:', error);
    return NextResponse.json(
      { error: 'Failed to delete override', details: error.message },
      { status: 500 }
    );
  }
}
