import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

/**
 * Check if a gift card coupon is active
 * Used by the success page to verify the payment was processed
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        isActive: true,
        type: true,
        value: true,
        validUntil: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        found: false,
        isActive: false,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      isActive: coupon.isActive,
      value: Number(coupon.value),
      validUntil: coupon.validUntil,
    });
  } catch (error) {
    console.error('Error checking gift card status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
