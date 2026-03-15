/**
 * Admin Wine Variants API
 *
 * GET  /api/admin/wines/[id]/variants - List all variants for wine
 * POST /api/admin/wines/[id]/variants - Create new variant
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

    const variants = await prisma.wineVariant.findMany({
      where: { wineId: id },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: variants,
    });
  } catch (error: any) {
    console.error('Wine Variants GET Error:', error);
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
    const {
      sku,
      bottleSize,
      vintage,
      price,
      compareAtPrice,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      isAvailable,
      preOrder,
      estimatedRestock,
      weight,
      barcode,
      klaraVariantId,
    } = body;

    if (!sku || !bottleSize || !price) {
      return NextResponse.json(
        { error: 'SKU, bottle size, and price are required' },
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

    // Check if SKU already exists
    const existingSku = await prisma.wineVariant.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    const variant = await prisma.wineVariant.create({
      data: {
        wineId: id,
        sku,
        bottleSize: parseFloat(bottleSize),
        vintage: vintage ? parseInt(vintage) : null,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 0,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 5,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        preOrder: preOrder || false,
        estimatedRestock: estimatedRestock ? new Date(estimatedRestock) : null,
        weight: weight ? parseFloat(weight) : null,
        barcode,
        klaraVariantId,
      },
    });

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    console.error('Wine Variants POST Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
