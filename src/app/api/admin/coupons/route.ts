import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error loading coupons:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validUntil,
      maxUses,
      maxUsesPerUser,
      description,
    } = body;

    // Validate required fields
    if (!code || !type || !value || !validFrom) {
      return NextResponse.json(
        { error: 'Code, Typ, Wert und Gültig-ab sind erforderlich' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Dieser Gutscheincode existiert bereits' },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : 1,
        isActive: true,
        description: description || null,
      },
    });

    console.log('Gutschein erstellt:', coupon.code);

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Gutscheins', details: error.message },
      { status: 500 }
    );
  }
}
