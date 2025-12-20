/**
 * KLARA Import API - Import products from KLARA to database
 *
 * POST /api/admin/klara/import - Import all KLARA products as wines
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { fetchKlaraArticles } from '@/lib/klara/api-client';
import slugify from 'slugify';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articles: selectedArticles } = body;

    console.log('🔄 Starting KLARA import...');
    console.log(`📦 Importing ${selectedArticles?.length || 0} selected articles`);

    // Use selected articles or fetch all
    const klaraArticles = selectedArticles || await fetchKlaraArticles();

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    // Create sync record
    const sync = await prisma.klaraSync.create({
      data: {
        syncType: 'products',
        status: 'RUNNING',
        recordsProcessed: 0,
      },
    });

    for (const article of klaraArticles) {
      try {
        // Check if wine with klaraId already exists
        let wine: any = await prisma.wine.findUnique({
          where: { klaraId: article.id },
          include: { variants: true },
        });

        const wineData = {
          name: article.name,
          winery: article.name.split(' ')[0] || 'KLARA', // Extract first word as winery
          region: 'Schweiz',
          country: 'CH',
          grapeVarieties: [],
          wineType: 'RED' as const, // Default
          description: article.description,
          isActive: true,
          isFeatured: false,
          certifications: [],
          allergens: ['sulfites'],
          aromaProfile: [],
          foodPairings: [],
        };

        if (wine) {
          // Update existing wine
          wine = await prisma.wine.update({
            where: { id: wine.id },
            data: wineData,
            include: { variants: true },
          });

          updated++;
        } else {
          // Create new wine with unique slug
          let slug = slugify(article.name, { lower: true, strict: true });
          let slugExists = await prisma.wine.findUnique({ where: { slug } });
          let counter = 1;
          while (slugExists) {
            slug = `${slugify(article.name, { lower: true, strict: true })}-${counter}`;
            slugExists = await prisma.wine.findUnique({ where: { slug } });
            counter++;
          }

          wine = await prisma.wine.create({
            data: {
              ...wineData,
              slug,
              klaraId: article.id,
              winerySlug: slugify(wineData.winery, { lower: true, strict: true }),
            },
            include: { variants: true },
          });

          created++;
        }

        // Create or update variant
        if (!wine) continue; // Should never happen, but for TypeScript
        const variant = wine.variants.find((v: any) => v.klaraVariantId === article.id);

        const variantData = {
          price: article.price,
          stockQuantity: article.stock,
          isAvailable: article.stock > 0,
        };

        if (variant) {
          // Update existing variant
          await prisma.wineVariant.update({
            where: { id: variant.id },
            data: variantData,
          });
        } else {
          // Create new variant with unique SKU
          let sku = `KLARA-${article.articleNumber}`;
          let skuExists = await prisma.wineVariant.findUnique({ where: { sku } });
          let counter = 1;
          while (skuExists) {
            sku = `KLARA-${article.articleNumber}-${counter}`;
            skuExists = await prisma.wineVariant.findUnique({ where: { sku } });
            counter++;
          }

          await prisma.wineVariant.create({
            data: {
              wineId: wine.id,
              klaraVariantId: article.id,
              sku,
              bottleSize: 0.75, // Default 750ml
              price: article.price,
              stockQuantity: article.stock,
              isAvailable: article.stock > 0,
            },
          });
        }
      } catch (error: any) {
        console.error(`❌ Error importing article ${article.id}:`, error);
        errors++;
        errorMessages.push(`${article.name}: ${error.message}`);
      }
    }

    // Update sync record
    await prisma.klaraSync.update({
      where: { id: sync.id },
      data: {
        status: errors === klaraArticles.length ? 'FAILED' : 'COMPLETED',
        recordsProcessed: klaraArticles.length,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsFailed: errors,
        errorLog: errorMessages.length > 0 ? errorMessages : undefined,
        completedAt: new Date(),
      },
    });

    console.log(`✅ KLARA import completed: ${created} created, ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      stats: {
        total: klaraArticles.length,
        created,
        updated,
        errors,
        errorMessages,
      },
    });
  } catch (error: any) {
    console.error('KLARA Import Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
