/**
 * Admin Wine Management API - Single Wine
 *
 * GET    /api/admin/wines/[id] - Get single wine
 * PATCH  /api/admin/wines/[id] - Update wine
 * DELETE /api/admin/wines/[id] - Delete wine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// Admin authentication check
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return false;
  }
  return true;
}

/**
 * GET /api/admin/wines/[id] - Get single wine with all details
 */
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

    const wine = await prisma.wine.findUnique({
      where: { id: id },
      include: {
        variants: {
          orderBy: { price: 'asc' },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            variants: true,
            reviews: true,
          },
        },
      },
    });

    if (!wine) {
      return NextResponse.json(
        { error: 'Wine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: wine,
    });
  } catch (error: any) {
    console.error('Admin Wine GET Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/wines/[id] - Update wine
 */
export async function PATCH(
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

    // Check if wine exists
    const existingWine = await prisma.wine.findUnique({
      where: { id: id },
    });

    if (!existingWine) {
      return NextResponse.json(
        { error: 'Wine not found' },
        { status: 404 }
      );
    }

    // Handle slug update if name changed
    let slug = existingWine.slug;
    if (body.name && body.name !== existingWine.name) {
      slug = slugify(body.name, { lower: true, strict: true });
      let slugExists = await prisma.wine.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      let counter = 1;
      while (slugExists) {
        slug = `${slugify(body.name, { lower: true, strict: true })}-${counter}`;
        slugExists = await prisma.wine.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        });
        counter++;
      }
    }

    // Update wine
    const updateData: any = {
      slug,
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.winery !== undefined) {
      updateData.winery = body.winery;
      updateData.winerySlug = slugify(body.winery, { lower: true, strict: true });
    }
    if (body.region !== undefined) updateData.region = body.region;
    if (body.subRegion !== undefined) updateData.subRegion = body.subRegion;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.grapeVarieties !== undefined) updateData.grapeVarieties = body.grapeVarieties;
    if (body.vintage !== undefined) updateData.vintage = body.vintage ? parseInt(body.vintage) : null;
    if (body.wineType !== undefined) updateData.wineType = body.wineType;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.classification !== undefined) updateData.classification = body.classification;
    if (body.alcoholContent !== undefined) updateData.alcoholContent = body.alcoholContent ? parseFloat(body.alcoholContent) : null;
    if (body.residualSugar !== undefined) updateData.residualSugar = body.residualSugar ? parseFloat(body.residualSugar) : null;
    if (body.acidity !== undefined) updateData.acidity = body.acidity ? parseFloat(body.acidity) : null;
    if (body.dryness !== undefined) updateData.dryness = body.dryness ? parseInt(body.dryness) : null;
    if (body.bodyLevel !== undefined) updateData.body = body.bodyLevel ? parseInt(body.bodyLevel) : null;
    if (body.acidityLevel !== undefined) updateData.acidityLevel = body.acidityLevel ? parseInt(body.acidityLevel) : null;
    if (body.tanninLevel !== undefined) updateData.tanninLevel = body.tanninLevel ? parseInt(body.tanninLevel) : null;
    if (body.tastingNotes !== undefined) updateData.tastingNotes = body.tastingNotes;
    if (body.aromaProfile !== undefined) updateData.aromaProfile = body.aromaProfile;
    if (body.foodPairings !== undefined) updateData.foodPairings = body.foodPairings;
    if (body.drinkingWindow !== undefined) updateData.drinkingWindow = body.drinkingWindow;
    if (body.servingTemp !== undefined) updateData.servingTemp = body.servingTemp;
    if (body.decanting !== undefined) updateData.decanting = body.decanting;
    if (body.storagePotential !== undefined) updateData.storagePotential = body.storagePotential;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.winemaker !== undefined) updateData.winemaker = body.winemaker;
    if (body.vinification !== undefined) updateData.vinification = body.vinification;
    if (body.terroir !== undefined) updateData.terroir = body.terroir;
    if (body.awards !== undefined) updateData.awards = body.awards;
    if (body.isBio !== undefined) updateData.isBio = body.isBio;
    if (body.isDemeter !== undefined) updateData.isDemeter = body.isDemeter;
    if (body.isVegan !== undefined) updateData.isVegan = body.isVegan;
    if (body.certifications !== undefined) updateData.certifications = body.certifications;
    if (body.allergens !== undefined) updateData.allergens = body.allergens;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.availableFrom !== undefined) updateData.availableFrom = body.availableFrom ? new Date(body.availableFrom) : null;
    if (body.availableUntil !== undefined) updateData.availableUntil = body.availableUntil ? new Date(body.availableUntil) : null;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.klaraId !== undefined) updateData.klaraId = body.klaraId;

    const wine = await prisma.wine.update({
      where: { id: id },
      data: updateData,
      include: {
        variants: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: wine,
    });
  } catch (error: any) {
    console.error('Admin Wine PATCH Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/wines/[id] - Delete wine
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if wine exists
    const wine = await prisma.wine.findUnique({
      where: { id: id },
      include: {
        variants: true,
      },
    });

    if (!wine) {
      return NextResponse.json(
        { error: 'Wine not found' },
        { status: 404 }
      );
    }

    // Check if wine has variants with orders
    const variantIds = wine.variants.map(v => v.id);
    if (variantIds.length > 0) {
      const orderItems = await prisma.orderItem.count({
        where: {
          variantId: { in: variantIds },
        },
      });

      if (orderItems > 0) {
        return NextResponse.json(
          { error: 'Cannot delete wine with existing orders. Consider deactivating instead.' },
          { status: 400 }
        );
      }
    }

    // Delete wine (will cascade to variants, images, reviews)
    await prisma.wine.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Wine deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin Wine DELETE Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
