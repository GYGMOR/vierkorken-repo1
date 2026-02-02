import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { applyRateLimit } from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  // Rate limiting: 30 validations per minute to prevent brute-force attacks
  const rateLimitResponse = await applyRateLimit(req, 30, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Gutscheincode erforderlich' },
        { status: 400 }
      );
    }

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json(
        { error: 'Bestellwert erforderlich' },
        { status: 400 }
      );
    }

    // Find coupon by code (case-insensitive)
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Ungültiger Gutscheincode' },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Dieser Gutscheincode ist nicht mehr aktiv' },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: 'Dieser Gutscheincode ist noch nicht gültig' },
        { status: 400 }
      );
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: 'Dieser Gutscheincode ist abgelaufen' },
        { status: 400 }
      );
    }

    // Check usage limits
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'Dieser Gutscheincode wurde bereits zu oft verwendet' },
        { status: 400 }
      );
    }

    // Check per-user usage limit (if user is logged in)
    const session = await getServerSession(authOptions);
    if (session?.user?.id && coupon.maxUsesPerUser) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId: session.user.id,
          couponId: coupon.id
        }
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json(
          { error: 'Sie haben diesen Gutscheincode bereits verwendet' },
          { status: 400 }
        );
      }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        {
          error: `Mindestbestellwert von CHF ${Number(coupon.minOrderAmount).toFixed(2)} nicht erreicht`
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(coupon.value)) / 100;

      // Apply max discount cap if specified
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.type === 'FIXED_AMOUNT' || coupon.type === 'GIFT_CARD') {
      discountAmount = Number(coupon.value);

      // Can't discount more than order amount
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
    }

    // Return coupon details and calculated discount
    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount: Number(discountAmount.toFixed(2)),
      description: coupon.description
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Fehler beim Validieren des Gutscheincodes' },
      { status: 500 }
    );
  }
}
