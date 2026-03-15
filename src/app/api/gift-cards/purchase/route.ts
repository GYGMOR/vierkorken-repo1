import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { amount, recipientEmail, recipientName, senderName, message } = body;

    // Validate
    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: 'Mindestbetrag ist CHF 10.-' },
        { status: 400 }
      );
    }

    if (!recipientEmail || !senderName) {
      return NextResponse.json(
        { error: 'Empfänger E-Mail und Absender Name sind erforderlich' },
        { status: 400 }
      );
    }

    // Generate unique coupon code
    const generateCouponCode = () => {
      const prefix = 'GESCHENK';
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}${randomPart}`;
    };

    let couponCode = generateCouponCode();

    // Ensure code is unique
    let existingCoupon = await prisma.coupon.findUnique({
      where: { code: couponCode }
    });

    while (existingCoupon) {
      couponCode = generateCouponCode();
      existingCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });
    }

    // Calculate prices
    const giftCardAmount = parseFloat(amount);
    const total = giftCardAmount;

    // Create coupon in database (inactive until payment is confirmed)
    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        type: 'GIFT_CARD',
        value: giftCardAmount,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
        maxUses: 1,
        maxUsesPerUser: 1,
        isActive: false, // Will be activated after payment
        description: `Geschenkgutschein im Wert von CHF ${giftCardAmount.toFixed(2)}`,
        internalNote: JSON.stringify({
          recipientEmail,
          recipientName,
          senderName,
          message,
          purchasedAt: new Date().toISOString(),
          purchasedBy: session?.user?.email || 'guest',
        }),
      },
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Geschenkgutschein',
              description: `Gutschein-Code: ${couponCode} - Wert: CHF ${giftCardAmount.toFixed(2)}`,
            },
            unit_amount: Math.round(total * 100), // Include tax
          },
          quantity: 1,
        },
      ],
      client_reference_id: session?.user?.email || 'guest',
      metadata: {
        source: 'gift-card-purchase',
        couponId: coupon.id,
        couponCode: coupon.code,
        recipientEmail,
        recipientName: recipientName || '',
        senderName,
        message: message || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/geschenkgutscheine/erfolg?code=${couponCode}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/geschenkgutscheine`,
      payment_method_types: ['card'],
    });

    console.log('✅ Gift card coupon created:', couponCode);
    console.log('📧 Recipient:', recipientEmail);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error purchasing gift card:', error);
    return NextResponse.json(
      { error: 'Fehler beim Kauf des Gutscheins', details: error.message },
      { status: 500 }
    );
  }
}
