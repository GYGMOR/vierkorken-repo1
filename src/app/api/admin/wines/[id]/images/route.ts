/**
 * Admin Wine Images API
 *
 * GET  /api/admin/wines/[id]/images - List all images for wine
 * POST /api/admin/wines/[id]/images - Add new image to wine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const images = await prisma.wineImage.findMany({
      where: { wineId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error: any) {
    console.error('Wine Images GET Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, altText, title, imageType, sortOrder } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Check if wine exists
    const wine = await prisma.wine.findUnique({
      where: { id: id },
    });

    if (!wine) {
      return NextResponse.json(
        { error: 'Wine not found' },
        { status: 404 }
      );
    }

    // Get max sort order if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const maxImage = await prisma.wineImage.findFirst({
        where: { wineId: id },
        orderBy: { sortOrder: 'desc' },
      });
      finalSortOrder = maxImage ? maxImage.sortOrder + 1 : 0;
    }

    const image = await prisma.wineImage.create({
      data: {
        wineId: id,
        url,
        altText: altText || `${wine.name} - ${wine.winery}`,
        title: title || wine.name,
        imageType: imageType || 'PRODUCT',
        sortOrder: finalSortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error: any) {
    console.error('Wine Images POST Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
