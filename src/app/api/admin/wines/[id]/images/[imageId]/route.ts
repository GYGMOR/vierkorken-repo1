/**
 * Admin Wine Image Management API - Single Image
 *
 * PATCH  /api/admin/wines/[id]/images/[imageId] - Update image
 * DELETE /api/admin/wines/[id]/images/[imageId] - Delete image
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
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const image = await prisma.wineImage.update({
      where: { id: imageId },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error: any) {
    console.error('Wine Image PATCH Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.wineImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Wine Image DELETE Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
