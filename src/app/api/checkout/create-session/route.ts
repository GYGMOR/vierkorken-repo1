import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    console.log('🚀 ========== STRIPE CHECKOUT SESSION START ==========');

    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || 'guest';
    console.log('👤 User:', userId);

    const body = await req.json();
    const { items, deliveryMethod, shippingMethod, paymentMethod, shippingData, billingData, giftOptions, couponCode } = body;

    console.log('📦 Request body received:', {
      itemsCount: items?.length,
      deliveryMethod,
      shippingMethod,
      paymentMethod,
      hasShippingData: !!shippingData,
      hasBillingData: !!billingData,
      hasGiftOptions: !!giftOptions,
      couponCode,
    });

    // Find user if logged in
    let user: any = null;
    if (userId && userId !== 'guest') {
      user = await prisma.user.findUnique({
        where: { email: userId },
        include: {
          addresses: {
            where: {
              isDefault: true,
            },
            take: 1,
          },
        },
      });
    }

    console.log('🛒 Cart items received:', JSON.stringify(items, null, 2));
    console.log('📦 Delivery method:', deliveryMethod);
    console.log('🚚 Shipping method:', shippingMethod);
    console.log('💳 Payment method:', paymentMethod);
    console.log('🎫 Coupon code:', couponCode);
    console.log('📬 Shipping data received:', JSON.stringify(shippingData, null, 2));
    console.log('📬 Billing data received:', JSON.stringify(billingData, null, 2));

    // Separate wine items and event items
    const wineItems = items.filter((item: any) => item.type !== 'event');
    const eventItems = items.filter((item: any) => item.type === 'event');

    console.log('🍷 Wine items:', wineItems.length);
    console.log('🎫 Event items:', eventItems.length);

    // Log what we're trying to create for wines
    const orderItemsToCreate = wineItems.map((item: any) => {
      const quantity = parseInt(item.quantity) || 1;
      const unitPrice = parseFloat(item.price) || 0;

      return {
        variantId: null,
        wineName: String(item.name || 'Unbekannter Wein'),
        winery: String(item.winery || 'Unbekannt'),
        vintage: item.vintage ? parseInt(String(item.vintage)) : null,
        bottleSize: 0.75,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: unitPrice * quantity,
        isGift: giftOptions?.isGift || false,
        giftWrap: giftOptions?.giftWrap || false,
        giftMessage: giftOptions?.giftMessage || null,
      };
    });

    console.log('📝 Order items (wines) we will create:', JSON.stringify(orderItemsToCreate, null, 2));
    console.log('🎫 Event items for tickets:', JSON.stringify(eventItems, null, 2));

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Keine Artikel im Warenkorb' },
        { status: 400 }
      );
    }

    // Calculate totals FIRST
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Calculate shipping cost based on delivery and shipping method
    // IMPORTANT: Based on subtotal BEFORE coupon discount
    let shippingCost = 0;
    if (deliveryMethod === 'pickup') {
      shippingCost = 0;
    } else {
      const freeShippingThreshold = 150;
      const isFreeShippingEligible = subtotal >= freeShippingThreshold;

      if (shippingMethod === 'express') {
        shippingCost = isFreeShippingEligible ? 9.90 : 19.90;
      } else {
        // standard
        shippingCost = isFreeShippingEligible ? 0 : 9.90;
      }
    }

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
              if (user && coupon.maxUsesPerUser) {
                const userUsageCount = await prisma.order.count({
                  where: {
                    userId: user.id,
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

    // Build line items for Stripe
    const lineItems = items.map((item: any) => {
      // For now, create price dynamically
      // In production, you would map to existing Stripe Price IDs

      // Only include images if they're valid URLs (Stripe requires full URLs, not relative paths)
      const hasValidImage = item.imageUrl && (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://'));

      // Build description - Stripe doesn't allow empty strings, so provide a fallback
      let description = '';
      if (item.type === 'wine') {
        const wineryPart = item.winery || '';
        const vintagePart = item.vintage || '';
        description = `${wineryPart} ${vintagePart}`.trim();

        // If still empty, use a default description
        if (!description) {
          description = 'Schweizer Wein';
        }
      } else if (item.type === 'event') {
        description = item.eventDate ? `Event am ${item.eventDate}` : 'Event-Ticket';
      } else {
        description = 'VIER KORKEN Produkt';
      }

      return {
        price_data: {
          currency: 'chf',
          product_data: {
            name: item.name || 'Produkt',
            description: description,
            images: hasValidImage ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: parseInt(item.quantity) || 1,
      };
    });

    // Add shipping as a line item if applicable
    if (shippingCost > 0) {
      const shippingLabel = shippingMethod === 'express' ? 'Express-Versand' : 'Standard-Versand';
      lineItems.push({
        price_data: {
          currency: 'chf',
          product_data: {
            name: `Versandkosten (${shippingLabel})`,
            description: shippingMethod === 'express' ? '1-2 Werktage' : '3-5 Werktage',
            images: [],
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add gift wrap if applicable
    if (giftWrapCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'chf',
          product_data: {
            name: 'Geschenkverpackung',
            description: 'Elegante Geschenkverpackung',
            images: [],
          },
          unit_amount: Math.round(giftWrapCost * 100),
        },
        quantity: 1,
      });
    }

    // Add discount as negative line item if applicable
    if (discountAmount > 0 && coupon) {
      lineItems.push({
        price_data: {
          currency: 'chf',
          product_data: {
            name: `Gutschein: ${coupon.code}`,
            description: coupon.description || 'Rabatt angewendet',
            images: [],
          },
          unit_amount: -Math.round(discountAmount * 100), // Negative amount
        },
        quantity: 1,
      });
    }

    // Add tax (MwSt.) as a line item
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'chf',
          product_data: {
            name: 'Mehrwertsteuer (8.1%)',
            description: 'Gesetzliche Schweizer MwSt.',
            images: [],
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    console.log('💳 Stripe line items:', JSON.stringify(lineItems, null, 2));
    console.log('💰 Total calculation: Subtotal CHF', subtotal, '+ Shipping CHF', shippingCost, '+ Gift Wrap CHF', giftWrapCost, '- Discount CHF', discountAmount, '+ Tax CHF', taxAmount, '= Total CHF', total);

    // Prepare addresses from user's default address or shippingData
    const defaultAddress = user?.addresses?.[0];

    let finalShippingAddress;
    if (deliveryMethod === 'pickup') {
      // For pickup, use store address
      finalShippingAddress = {
        firstName: shippingData?.firstName || user?.firstName || 'Abholung',
        lastName: shippingData?.lastName || user?.lastName || 'Kunde',
        street: 'Weinlounge',
        streetNumber: '1',
        postalCode: '8000',
        city: 'Zürich',
        country: 'CH',
        phone: shippingData?.phone || user?.phone || '',
      };
    } else {
      // For delivery, use provided shippingData or default address
      finalShippingAddress = shippingData || (defaultAddress ? {
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        company: defaultAddress.company,
        street: defaultAddress.street,
        streetNumber: defaultAddress.streetNumber,
        postalCode: defaultAddress.postalCode,
        city: defaultAddress.city,
        country: defaultAddress.country,
        phone: defaultAddress.phone,
      } : {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        street: '',
        streetNumber: '',
        postalCode: '',
        city: '',
        country: 'CH',
      });
    }

    // Billing address: use billingData if provided, otherwise same as shipping
    const billingAddress = billingData || finalShippingAddress;

    console.log('📍 Final Shipping Address:', JSON.stringify(finalShippingAddress, null, 2));
    console.log('📍 Final Billing Address:', JSON.stringify(billingAddress, null, 2));
    console.log('📦 Delivery Method:', deliveryMethod);

    // Generate order number
    const orderNumber = `VK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order in database IMMEDIATELY (with PENDING status)
    // First create order without items
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        ...(user?.id && {
          user: {
            connect: {
              id: user.id,
            },
          },
        }),
        customerEmail: shippingData?.email || userId || 'guest@vierkorken.ch',
        customerFirstName: shippingData?.firstName || user?.firstName || 'Gast',
        customerLastName: shippingData?.lastName || user?.lastName || '',
        customerPhone: shippingData?.phone || user?.phone || null,
        shippingAddress: finalShippingAddress,
        billingAddress: billingAddress,
        subtotal: subtotal,
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        total: total,
        pointsEarned: Math.floor(total * 1.2),
        pointsUsed: 0,
        cashbackAmount: 0,
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        deliveryMethod: deliveryMethod === 'pickup' ? 'PICKUP' : 'SHIPPING',
        shippingMethod: shippingMethod || 'standard',
        ...(coupon && {
          couponId: coupon.id,
          couponCode: coupon.code,
        }),
        customerNote: giftOptions?.giftMessage || null,
      },
    });

    console.log('✅ Order created (without items):', orderNumber, 'ID:', order.id);

    // Then try to add wine items separately
    try {
      let successCount = 0;
      for (let i = 0; i < orderItemsToCreate.length; i++) {
        const itemData = orderItemsToCreate[i];
        try {
          console.log(`Creating wine item ${i + 1}/${orderItemsToCreate.length}:`, JSON.stringify(itemData, null, 2));

          await prisma.orderItem.create({
            data: {
              ...itemData,
              orderId: order.id,
            },
          });

          successCount++;
          console.log(`✅ Wine item ${i + 1} created successfully`);
        } catch (singleItemError: any) {
          console.error(`❌ Error creating wine item ${i + 1}:`, singleItemError.message);
          console.error(`❌ Item data was:`, JSON.stringify(itemData, null, 2));
        }
      }
      console.log(`✅ Wine order items created: ${successCount}/${orderItemsToCreate.length}`);
    } catch (itemError: any) {
      console.error('❌ Error in items loop:', itemError);
      console.error('❌ Item error message:', itemError.message);
      // Order is still created, just without items
    }

    // Create event tickets
    console.log('🎟️  Checking event ticket creation conditions:');
    console.log('   - User exists?', !!user);
    console.log('   - User ID:', user?.id);
    console.log('   - Event items count:', eventItems.length);

    if (user && eventItems.length > 0) {
      console.log('🎫 Starting event ticket creation...');
      try {
        let ticketCount = 0;
        for (const eventItem of eventItems) {
          console.log(`🎫 Processing event item: ${eventItem.name}, slug: ${eventItem.slug}, quantity: ${eventItem.quantity}`);

          // First, look up the Event record by slug to get its ID
          const event = await prisma.event.findUnique({
            where: { slug: eventItem.slug },
          });

          if (!event) {
            console.error(`❌ Event not found with slug: ${eventItem.slug}`);
            continue;
          }

          console.log(`✅ Found event in DB: ${event.title} (ID: ${event.id})`);

          // Check if there are enough tickets available
          const requestedQuantity = eventItem.quantity || 1;
          const availableTickets = event.maxCapacity - event.currentCapacity;

          if (availableTickets < requestedQuantity) {
            console.error(`❌ Not enough tickets available. Requested: ${requestedQuantity}, Available: ${availableTickets}`);
            throw new Error(`Nicht genügend Tickets verfügbar für ${event.title}. Nur noch ${availableTickets} verfügbar.`);
          }

          for (let i = 0; i < requestedQuantity; i++) {
            const ticketNumber = `TK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const qrCode = `QR-${ticketNumber}`;

            const ticketData = {
              eventId: event.id, // Use the actual Event ID from database
              userId: user.id,
              ticketNumber: ticketNumber,
              qrCode: qrCode,
              price: parseFloat(eventItem.price),
              orderId: order.id,
              holderFirstName: user.firstName || '',
              holderLastName: user.lastName || '',
              holderEmail: user.email || '',
            };

            console.log(`🎫 Creating ticket ${i + 1}/${requestedQuantity}:`, JSON.stringify(ticketData, null, 2));

            try {
              await prisma.eventTicket.create({
                data: ticketData,
              });

              ticketCount++;
              console.log(`✅ Event ticket ${ticketCount} created: ${ticketNumber}`);
            } catch (ticketError: any) {
              console.error(`❌ Error creating event ticket:`, ticketError.message);
              console.error(`❌ Full error:`, ticketError);
            }
          }

          // Update event capacity
          await prisma.event.update({
            where: { id: event.id },
            data: {
              currentCapacity: {
                increment: requestedQuantity,
              },
            },
          });

          console.log(`✅ Event capacity updated: ${event.currentCapacity} -> ${event.currentCapacity + requestedQuantity}`);
        }
        console.log(`✅ Total event tickets created: ${ticketCount}`);
      } catch (eventError: any) {
        console.error('❌ Error creating event tickets:', eventError);
      }
    } else if (eventItems.length > 0) {
      console.log('⚠️  Event items present but no user - cannot create tickets');
      console.log('   User object:', user);
    } else {
      console.log('ℹ️  No event items to process');
    }

    // Reload order with items
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    console.log('📦 Order items:', orderWithItems?.items?.length || 0);
    console.log('📦 Items details:', JSON.stringify(orderWithItems?.items || [], null, 2));

    // Determine payment method types based on selected payment method
    const paymentMethodTypes = paymentMethod === 'twint'
      ? ['card', 'twint']  // TWINT enabled
      : ['card'];           // Card only

    console.log('💳 Stripe payment method types:', paymentMethodTypes);

    // Create Checkout Session with TWINT support
    const sessionConfig: any = {
      mode: 'payment',
      line_items: lineItems,
      client_reference_id: userId,
      metadata: {
        source: 'vierkorken-shop',
        userId: userId,
        orderId: order.id,
        orderNumber: orderNumber,
        paymentMethod: paymentMethod || 'card',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/warenkorb`,
      payment_method_types: paymentMethodTypes,
    };

    // TWINT requires explicit CHF currency
    if (paymentMethod === 'twint') {
      sessionConfig.currency = 'chf';
    }

    console.log('💳 Creating Stripe Checkout Session with config:', {
      mode: sessionConfig.mode,
      lineItemsCount: sessionConfig.line_items?.length,
      paymentMethodTypes: sessionConfig.payment_method_types,
      currency: sessionConfig.currency,
      successUrl: sessionConfig.success_url?.substring(0, 100) + '...',
      cancelUrl: sessionConfig.cancel_url,
    });

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);
    console.log('✅ Stripe session created:', checkoutSession.id);

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: checkoutSession.id,
      },
    });
    console.log('✅ Order updated with Stripe session ID');

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

    console.log('🎉 ========== STRIPE CHECKOUT SESSION SUCCESS ==========');
    console.log('🔗 Checkout URL:', checkoutSession.url);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('💥 ========== STRIPE CHECKOUT SESSION ERROR ==========');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    if (error.type === 'StripeInvalidRequestError') {
      console.error('❌ Stripe API Error - Invalid Request');
      console.error('❌ Stripe Error Details:', {
        type: error.type,
        statusCode: error.statusCode,
        param: error.param,
        code: error.code,
        rawMessage: error.raw?.message,
      });
    }

    console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen der Checkout-Session',
        details: error.message,
        type: error.type || error.constructor.name,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
