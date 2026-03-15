/**
 * Admin Wine Variant Management API - Single Variant
 *
 * PATCH  /api/admin/wines/[id]/variants/[variantId] - Update variant
 * DELETE /api/admin/wines/[id]/variants/[variantId] - Delete variant
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle SKU uniqueness check if updating SKU
    if (body.sku) {
      const existingSku = await prisma.wineVariant.findFirst({
        where: {
          sku: body.sku,
          id: { not: variantId },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.bottleSize !== undefined) updateData.bottleSize = parseFloat(body.bottleSize);
    if (body.vintage !== undefined) updateData.vintage = body.vintage ? parseInt(body.vintage) : null;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.compareAtPrice !== undefined) updateData.compareAtPrice = body.compareAtPrice ? parseFloat(body.compareAtPrice) : null;
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice ? parseFloat(body.costPrice) : null;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = parseInt(body.stockQuantity);
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(body.lowStockThreshold);
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
    if (body.preOrder !== undefined) updateData.preOrder = body.preOrder;
    if (body.estimatedRestock !== undefined) updateData.estimatedRestock = body.estimatedRestock ? new Date(body.estimatedRestock) : null;
    if (body.weight !== undefined) updateData.weight = body.weight ? parseFloat(body.weight) : null;
    if (body.barcode !== undefined) updateData.barcode = body.barcode;
    if (body.klaraVariantId !== undefined) updateData.klaraVariantId = body.klaraVariantId;

    const variant = await prisma.wineVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    console.error('Wine Variant PATCH Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if variant has orders
    const orderItems = await prisma.orderItem.count({
      where: { variantId: variantId },
    });

    if (orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete variant with existing orders. Consider marking as unavailable instead.' },
        { status: 400 }
      );
    }

    await prisma.wineVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({
      success: true,
      message: 'Variant deleted successfully',
    });
  } catch (error: any) {
    console.error('Wine Variant DELETE Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
