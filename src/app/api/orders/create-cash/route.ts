import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { items, deliveryMethod, shippingMethod, paymentMethod, shippingData, giftOptions, couponCode } = body;

    console.log('💰 Cash order request:', { deliveryMethod, shippingMethod, couponCode });

    // Validate
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Keine Artikel im Warenkorb' }, { status: 400 });
    }

    if (paymentMethod !== 'cash') {
      return NextResponse.json({ error: 'Ungültige Zahlungsmethode' }, { status: 400 });
    }

    if (deliveryMethod !== 'pickup') {
      return NextResponse.json(
        { error: 'Barzahlung nur bei Abholung möglich' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 0; // Pickup = free
    const giftWrapCost = giftOptions?.giftWrap ? 5.0 : 0;

    // Validate and apply coupon
    let coupon = null;
    let discountAmount = 0;

    if (couponCode) {
      try {
        coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() }
        });

        if (coupon && coupon.isActive) {
          const now = new Date();

          // Check validity
          if (coupon.validFrom <= now && (!coupon.validUntil || coupon.validUntil >= now)) {
            // Check usage limits
            if (!coupon.maxUses || coupon.currentUses < coupon.maxUses) {
              // Check per-user limit
              let canUse = true;
              if (session?.user?.id && coupon.maxUsesPerUser) {
                const userUsageCount = await prisma.order.count({
                  where: {
                    userId: session.user.id,
                    couponId: coupon.id
                  }
                });
                if (userUsageCount >= coupon.maxUsesPerUser) {
                  canUse = false;
                }
              }

              if (canUse) {
                // Check minimum order amount
                if (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount)) {
                  // Calculate discount
                  if (coupon.type === 'PERCENTAGE') {
                    discountAmount = (subtotal * Number(coupon.value)) / 100;
                    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                      discountAmount = Number(coupon.maxDiscount);
                    }
                  } else if (coupon.type === 'FIXED_AMOUNT' || coupon.type === 'GIFT_CARD') {
                    discountAmount = Number(coupon.value);
                    if (discountAmount > subtotal) {
                      discountAmount = subtotal;
                    }
                  }

                  console.log('✅ Coupon applied:', coupon.code, '- Discount:', discountAmount);
                } else {
                  console.log('⚠️ Coupon minimum order amount not met');
                  coupon = null;
                }
              } else {
                console.log('⚠️ Coupon usage limit exceeded for user');
                coupon = null;
              }
            } else {
              console.log('⚠️ Coupon usage limit exceeded');
              coupon = null;
            }
          } else {
            console.log('⚠️ Coupon not valid at this time');
            coupon = null;
          }
        } else {
          console.log('⚠️ Coupon not found or not active');
        }
      } catch (couponError) {
        console.error('❌ Error validating coupon:', couponError);
      }
    }

    const subtotalAfterDiscount = Math.max(0, subtotal + shippingCost + giftWrapCost - discountAmount);
    const taxAmount = subtotalAfterDiscount * 0.081;
    const total = subtotalAfterDiscount + taxAmount;

    // Generate order number
    const orderNumber = `VK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare address data
    const pickupAddress = {
      firstName: shippingData?.firstName || 'Abholung',
      lastName: shippingData?.lastName || 'Kunde',
      street: 'Weinlounge',
      streetNumber: '1',
      postalCode: '8000',
      city: 'Zürich',
      country: 'CH',
      phone: shippingData?.phone || '',
    };

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        ...(session?.user?.id && {
          user: {
            connect: {
              id: session.user.id,
            },
          },
        }),

        // Customer info
        customerEmail: shippingData?.email || session?.user?.email || 'gast@vierkorken.ch',
        customerFirstName: shippingData?.firstName || 'Gast',
        customerLastName: shippingData?.lastName || 'Kunde',
        customerPhone: shippingData?.phone || null,

        // Addresses (both same for pickup)
        shippingAddress: pickupAddress,
        billingAddress: pickupAddress,

        // Pricing
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        total,

        // Payment
        paymentMethod: 'cash',
        paymentStatus: 'PENDING', // Will be paid on pickup

        // Fulfillment
        status: 'CONFIRMED',
        deliveryMethod: 'PICKUP',
        shippingMethod: null, // Not applicable for pickup

        // Coupon
        ...(coupon && {
          couponId: coupon.id,
          couponCode: coupon.code,
        }),

        // Customer note
        customerNote: giftOptions?.giftMessage || null,

        // Create order items
        items: {
          create: items.map((item: any) => ({
            variantId: item.variantId || null,
            wineName: item.name,
            winery: item.winery || item.type || '',
            vintage: item.vintage || null,
            bottleSize: item.bottleSize || 0.75,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            isGift: giftOptions?.isGift || false,
            giftMessage: giftOptions?.giftMessage || null,
            giftWrap: giftOptions?.giftWrap || false,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Increment coupon usage count
    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      });
      console.log('✅ Coupon usage incremented:', coupon.code);
    }

    // Send confirmation email
    try {
      console.log('📧 Sending cash order confirmation email to:', order.customerEmail);

      const orderData = {
        orderNumber: order.orderNumber,
        customerFirstName: order.customerFirstName,
        customerLastName: order.customerLastName,
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        items: order.items,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        taxAmount: order.taxAmount,
        total: order.total,
        billingAddress: pickupAddress,
        shippingAddress: pickupAddress,
      };

      await sendOrderConfirmationEmail(order.customerEmail, order.id, orderData);
      console.log('✅ Cash order confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send cash order confirmation email:', emailError);
      // Continue with order creation even if email fails
    }

    // Notify admin about new cash order
    try {
      console.log('📧 Sending admin notification for cash order:', order.orderNumber);
      await sendNewOrderNotificationToAdmin(order.id, orderData);
      console.log('✅ Admin notification sent successfully');
    } catch (adminEmailError) {
      console.error('❌ Failed to send admin notification:', adminEmailError);
      // Continue - admin email is non-critical
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Bestellung erfolgreich erstellt. Bitte bezahlen Sie bei Abholung in bar.',
    });
  } catch (error: any) {
    console.error('Error creating cash order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bestellung', details: error.message },
      { status: 500 }
    );
  }
}
