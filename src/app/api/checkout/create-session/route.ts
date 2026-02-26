import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin, sendGiftCardEmail } from '@/lib/email';

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

    // Log what we're trying to create for wines/divers
    const orderItemsToCreate = wineItems.map((item: any) => {
      const quantity = parseInt(item.quantity) || 1;
      const unitPrice = parseFloat(item.price) || 0;

      return {
        variantId: null,
        wineName: String(item.name || 'Unbekannter Artikel'),
        winery: String(item.winery || (item.type === 'divers' ? 'Zubehör & Divers' : 'Unbekannt')),
        vintage: item.vintage ? parseInt(String(item.vintage)) : null,
        bottleSize: item.type === 'divers' ? 0 : 0.75,
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

    // Check if there's a loyalty gift in the cart
    const hasGiftInCart = items.some((item: any) => item.price === 0 && item.winery === 'Loyalty Gift');
    if (hasGiftInCart) {
      const minOrderSetting = await prisma.settings.findUnique({
        where: { key: 'loyalty_gift_min_order' }
      });
      const minOrder = minOrderSetting?.value ? Number(minOrderSetting.value) : 50;
      if (subtotal < minOrder) {
        return NextResponse.json(
          { error: `Gratis-Geschenke sind ab einem Bestellwert von CHF ${minOrder} einlösbar.` },
          { status: 400 }
        );
      }
    }

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
                    const grandTotalBeforeDiscount = subtotal + shippingCost + giftWrapCost;
                    if (discountAmount > grandTotalBeforeDiscount) {
                      discountAmount = grandTotalBeforeDiscount;
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

    // Calculate sum of gift cards to exclude from tax
    const giftCardSubtotal = items
      .filter((item: any) => item.type === 'giftcard' || item.type === 'geschenkgutschein')
      .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const subtotalAfterDiscount = Math.max(0, subtotal + shippingCost + giftWrapCost - discountAmount);

    // Tax is only computed on the taxable amount (excluding gift cards)
    // We assume the discount applies evenly, or we just subtract giftCardSubtotal from the taxable base.
    // Ensure we don't tax less than 0.
    const taxableAmount = Math.max(0, subtotalAfterDiscount - giftCardSubtotal);
    const taxAmount = taxableAmount * 0.081;

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
      } else if (item.type === 'divers') {
        description = 'Divers & Zubehör';
      } else {
        description = 'Vier Korken Wein-Boutique Produkt';
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

    // Removed the negative line item for discount here, because Stripe doesn't allow line items with negative amounts.
    // Instead we will use Stripe.coupons API directly below if discountAmount > 0.

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

    // Get customer data (handle empty strings properly)
    const customerEmail = (shippingData?.email && shippingData.email.trim() !== '')
      ? shippingData.email.trim()
      : (user?.email || 'FEHLER_KEINE_EMAIL');

    const customerFirstName = (shippingData?.firstName && shippingData.firstName.trim() !== '')
      ? shippingData.firstName.trim()
      : (user?.firstName || 'FEHLER_KEIN_NAME');

    const customerLastName = (shippingData?.lastName && shippingData.lastName.trim() !== '')
      ? shippingData.lastName.trim()
      : (user?.lastName || '');

    const customerPhone = (shippingData?.phone && shippingData.phone.trim() !== '')
      ? shippingData.phone.trim()
      : (user?.phone || null);

    console.log('👤 Customer data extracted:', {
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      fromShippingData: !!shippingData?.email,
      fromUser: !!user?.email,
    });

    // Validate customer data
    if (!customerEmail || customerEmail === 'FEHLER_KEINE_EMAIL') {
      console.error('❌ No valid email provided');
      return NextResponse.json(
        { error: 'Bitte geben Sie Ihre E-Mail-Adresse ein' },
        { status: 400 }
      );
    }

    if (!customerFirstName || customerFirstName === 'FEHLER_KEIN_NAME') {
      console.error('❌ No valid first name provided');
      return NextResponse.json(
        { error: 'Bitte geben Sie Ihren Vornamen ein' },
        { status: 400 }
      );
    }

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
        customerEmail,
        customerFirstName,
        customerLastName,
        customerPhone,
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
          coupon: {
            connect: { id: coupon.id }
          },
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

    // Create event tickets (for both logged-in users AND guests)
    console.log('🎟️  Checking event ticket creation conditions:');
    console.log('   - User exists?', !!user);
    console.log('   - User ID:', user?.id);
    console.log('   - Event items count:', eventItems.length);

    if (eventItems.length > 0) {
      console.log('🎫 Starting event ticket creation...');
      try {
        let ticketCount = 0;
        for (const eventItem of eventItems) {
          console.log(`🎫 Processing event item: ${eventItem.name}, slug: ${eventItem.slug}, quantity: ${eventItem.quantity}`);

          // First, look up the Event record by slug to get its ID
          let event = await prisma.event.findUnique({
            where: { slug: eventItem.slug },
          });

          if (!event) {
            console.log(`⚠️ Event not found with slug: ${eventItem.slug}. Creating fallback event in DB to avoid data loss...`);
            // Create a fallback event so the ticket isn't lost
            event = await prisma.event.create({
              data: {
                slug: eventItem.slug || `event-${Date.now()}`,
                title: eventItem.name || 'Unbekanntes Event',
                description: 'Automatisch erstelltes Event aus dem Warenkorb.',
                eventType: 'TASTING',
                venue: 'Vier Korken Weinlounge',
                venueAddress: { street: 'Steinbrunnengasse 3a', city: 'Seengen', zip: '5707' },
                startDateTime: eventItem.eventDate ? new Date(eventItem.eventDate) : new Date(),
                endDateTime: eventItem.eventDate ? new Date(new Date(eventItem.eventDate).getTime() + 2 * 60 * 60 * 1000) : new Date(),
                maxCapacity: 100,
                price: eventItem.price || 0,
                status: 'PUBLISHED',
                galleryImages: []
              }
            });
            console.log(`✅ Created fallback event: ${event.id}`);
          }

          console.log(`✅ Found/Created event in DB: ${event.title} (ID: ${event.id})`);

          // Check if there are enough tickets available
          const requestedQuantity = eventItem.quantity || 1;
          const availableTickets = event.maxCapacity - event.currentCapacity;

          if (availableTickets < requestedQuantity) {
            console.error(`❌ Not enough tickets available. Requested: ${requestedQuantity}, Available: ${availableTickets}`);
            // Let it pass instead of throwing error to avoid breaking checkout for the user paying for the fallback event
            console.warn(`⚠️ Proceeding with ticket creation anyway for fallback/overbooked event.`);
          }

          for (let i = 0; i < requestedQuantity; i++) {
            const ticketNumber = `TK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const qrCode = `QR-${ticketNumber}`;

            // Build ticket data with proper Prisma relation syntax
            const ticketData: any = {
              event: { connect: { id: event.id } },
              order: { connect: { id: order.id } },
              ticketNumber: ticketNumber,
              qrCode: qrCode,
              price: parseFloat(eventItem.price),
              holderFirstName: customerFirstName,
              holderLastName: customerLastName,
              holderEmail: customerEmail,
            };

            // Only link to user if logged in
            if (user?.id) {
              ticketData.user = { connect: { id: user.id } };
            }

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
    } else {
      console.log('ℹ️  No event items to process');
    }

    // Reload order with items
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    console.log('📦 Order items:', orderWithItems?.items?.length || 0);

    // ==========================================
    // 100% DISCOUNT WITH GIFT CARD (0 CHF TOTAL)
    // ==========================================
    if (total === 0) {
      console.log('🎁 Order total is 0 CHF (Fully covered by Gift Card/Coupon). Bypassing Stripe.');

      // We directly mark the order as PAID and CONFIRMED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date(),
          paymentMethod: 'gift_card', // Record that it was fully paid by gift card
        },
      });

      // Update user loyalty points if logged in
      if (user) {
        // Link event tickets to user if missing 
        try {
          await prisma.eventTicket.updateMany({
            where: { orderId: order.id, userId: null },
            data: { userId: user.id },
          });

          if (!order.userId) {
            await prisma.order.update({
              where: { id: order.id },
              data: { userId: user.id }
            });
          }
        } catch (ticketLinkError) {
          console.error('Error linking tickets to user:', ticketLinkError);
        }

        // We award 0 points for 0 CHF paid (unless loyalty policy says otherwise)
      }

      // Process the zero-total checkout coupon logic
      if (coupon) {
        // 1. Increment usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { currentUses: { increment: 1 } },
        });

        // 2. Handle partial gift card usage
        if (coupon.type === 'GIFT_CARD' && Number(coupon.value) > Number(orderWithItems?.discountAmount)) {
          const remainingBalance = Number(coupon.value) - Number(orderWithItems?.discountAmount);
          console.log(`🎁 Gift card partially used. Generating new code for remaining CHF ${remainingBalance}`);

          const newCode = `REST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          try {
            await prisma.coupon.create({
              data: {
                code: newCode,
                type: 'GIFT_CARD',
                value: remainingBalance,
                description: `Restguthaben von Gutschein ${coupon.code}`,
                isActive: true,
                validFrom: new Date(),
                validUntil: coupon.validUntil,
                maxUses: 1,
                minOrderAmount: 0,
              }
            });

            const recipientEmail = orderWithItems?.customerEmail;
            if (recipientEmail && recipientEmail !== 'guest@vierkorken.ch') {
              await sendGiftCardEmail(recipientEmail, {
                code: newCode,
                amount: remainingBalance,
                senderName: 'Vier Korken System',
                recipientName: orderWithItems?.customerFirstName || 'Lieber Kunde',
                message: `Hier ist Ihr automatisches Restguthaben von Ihrem vorherigen Gutschein (${coupon.code}). Dieser neue Code kann bei Ihrem nächsten Einkauf eingelöst werden.`,
              });
              console.log(`✅ Remaining balance code (${newCode}) emailed to ${recipientEmail}`);
            }
          } catch (restError) {
            console.error('❌ Failed to create/send Restguthaben:', restError);
          }
        }
      }

      // Send confirmation emails because webhook is bypassed
      try {
        if (orderWithItems) {
          const orderData = {
            orderNumber: orderWithItems.orderNumber,
            customerFirstName: orderWithItems.customerFirstName,
            customerLastName: orderWithItems.customerLastName,
            customerEmail: orderWithItems.customerEmail,
            createdAt: orderWithItems.createdAt,
            items: orderWithItems.items,
            tickets: [], // Will skip rendering tickets on 0 CHF for brevity as loyalty logic usually costs 0.
            subtotal: orderWithItems.subtotal,
            shippingCost: orderWithItems.shippingCost,
            taxAmount: orderWithItems.taxAmount,
            total: orderWithItems.total,
            billingAddress: orderWithItems.billingAddress,
            shippingAddress: orderWithItems.shippingAddress,
            deliveryMethod: orderWithItems.deliveryMethod,
            paymentMethod: orderWithItems.paymentMethod,
            shippingMethod: orderWithItems.shippingMethod,
          };

          await sendOrderConfirmationEmail(orderWithItems.customerEmail, orderWithItems.id, orderData);
          await sendNewOrderNotificationToAdmin(orderWithItems.id, orderData);
          console.log('✅ Confirmation emails sent for 0 CHF order');
        }
      } catch (emailError) {
        console.error('❌ Error sending 0 CHF emails:', emailError);
      }

      // Do not include session_id, causing /checkout/success to load via Barzahlung API strategy.
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?order_id=${order.id}`;
      return NextResponse.json({ url: successUrl });
    }

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

    // ==========================================
    // PARTIAL DISCOUNT HANDLING VIA STRIPE COUPON
    // ==========================================
    if (discountAmount > 0 && coupon) {
      try {
        console.log(`🎫 Creating dynamic Stripe Coupon for CHF ${discountAmount}`);
        const stripeCoupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: 'chf',
          duration: 'once',
          name: `Gutschein: ${coupon.code}`,
        });

        // Attach the coupon directly to the Stripe session
        sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
        console.log(`✅ Dynamically attached Stripe Coupon: ${stripeCoupon.id}`);
      } catch (stripeCouponError) {
        console.error('❌ Failed to create dynamic Stripe Coupon:', stripeCouponError);
        // Fallback: If creating the coupon fails, we don't block checkout but the user loses discount.
        // In reality, this shouldn't fail unless network errors.
      }
    }

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

    // Coupon usage counter removed here - we only increment it in the Webhook upon actual payment success!

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
