/**
 * Admin Wine Management API
 *
 * GET    /api/admin/wines - List all wines with filters
 * POST   /api/admin/wines - Create new wine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { isValidLength, sanitizeString, isValidNumber } from '@/lib/security';
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
 * GET /api/admin/wines - List all wines
 */
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const wineType = searchParams.get('wineType') || '';
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const klaraId = searchParams.get('klaraId');

    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { winery: { contains: search } },
        { region: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (wineType) {
      where.wineType = wineType;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    if (klaraId) {
      where.klaraId = klaraId;
    }

    // Fetch wines with variants and images
    const [wines, total] = await Promise.all([
      prisma.wine.findMany({
        where,
        skip,
        take: limit,
        include: {
          variants: {
            orderBy: { price: 'asc' },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              variants: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.wine.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: wines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin Wines GET Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/wines - Create new wine
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      winery,
      region,
      subRegion,
      country,
      grapeVarieties,
      vintage,
      wineType,
      category,
      classification,
      alcoholContent,
      residualSugar,
      acidity,
      dryness,
      bodyLevel,
      acidityLevel,
      tanninLevel,
      tastingNotes,
      aromaProfile,
      foodPairings,
      drinkingWindow,
      servingTemp,
      decanting,
      storagePotential,
      description,
      winemaker,
      vinification,
      terroir,
      awards,
      isBio,
      isDemeter,
      isVegan,
      certifications,
      allergens,
      isActive,
      isFeatured,
      availableFrom,
      availableUntil,
      metaTitle,
      metaDescription,
      imageUrl,
      klaraId,
    } = body;

    // Input validation
    const errors: string[] = [];

    if (!name || !isValidLength(name, 1, 200)) {
      errors.push('Wine name required (1-200 characters)');
    }
    if (!winery || !isValidLength(winery, 1, 200)) {
      errors.push('Winery required (1-200 characters)');
    }
    if (region && !isValidLength(region, 0, 200)) {
      errors.push('Region must be less than 200 characters');
    }
    if (vintage && !isValidNumber(vintage, 1900, new Date().getFullYear() + 2)) {
      errors.push('Invalid vintage year');
    }
    if (alcoholContent && !isValidNumber(alcoholContent, 0, 25)) {
      errors.push('Alcohol content must be between 0-25%');
    }
    if (description && description.length > 5000) {
      errors.push('Description too long (max 5000 characters)');
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    let slugExists = await prisma.wine.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
      slugExists = await prisma.wine.findUnique({ where: { slug } });
      counter++;
    }

    // Create wine
    const wine = await prisma.wine.create({
      data: {
        name,
        slug,
        winery,
        winerySlug: slugify(winery, { lower: true, strict: true }),
        region,
        subRegion,
        country: country || 'CH',
        grapeVarieties: grapeVarieties || [],
        vintage: vintage ? parseInt(vintage) : null,
        wineType: wineType || 'RED',
        category,
        classification,
        alcoholContent: alcoholContent ? parseFloat(alcoholContent) : null,
        residualSugar: residualSugar ? parseFloat(residualSugar) : null,
        acidity: acidity ? parseFloat(acidity) : null,
        dryness: dryness ? parseInt(dryness) : null,
        body: bodyLevel ? parseInt(bodyLevel) : null,
        acidityLevel: acidityLevel ? parseInt(acidityLevel) : null,
        tanninLevel: tanninLevel ? parseInt(tanninLevel) : null,
        tastingNotes,
        aromaProfile: aromaProfile || [],
        foodPairings: foodPairings || [],
        drinkingWindow,
        servingTemp,
        decanting,
        storagePotential,
        description,
        winemaker,
        vinification,
        terroir,
        awards: awards || null,
        isBio: isBio || false,
        isDemeter: isDemeter || false,
        isVegan: isVegan || false,
        certifications: certifications || [],
        allergens: allergens || [],
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        metaTitle,
        metaDescription,
        klaraId,
      },
    });

    // Add image if provided
    if (imageUrl) {
      await prisma.wineImage.create({
        data: {
          wineId: wine.id,
          url: imageUrl,
          altText: `${wine.name} - ${wine.winery}`,
          title: wine.name,
          imageType: 'PRODUCT',
          sortOrder: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: wine,
    });
  } catch (error: any) {
    console.error('Admin Wines POST Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
