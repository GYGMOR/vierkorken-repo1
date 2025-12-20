import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { updateUserLoyaltyLevel } from '@/lib/loyalty';
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin } from '@/lib/email';

// WICHTIG: Next.js muss den rohen Body behalten für Stripe Signature Verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received from Stripe');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No stripe-signature header found');
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('⚠️  STRIPE_WEBHOOK_SECRET ist nicht gesetzt in .env.local');
      console.error('⚠️  Führe zuerst aus: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
      console.error('⚠️  Kopiere das whsec_... Secret in .env.local');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    console.log('🔐 Verifying signature with webhook secret...');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Signature verified successfully');
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('\n========================================');
        console.log('ZAHLUNG ERFOLGREICH!');
        console.log('========================================');
        console.log('Session ID:', session.id);
        console.log('Customer email:', session.customer_details?.email || 'N/A');
        console.log('Betrag total:', (session.amount_total || 0) / 100, session.currency?.toUpperCase());
        console.log('Client reference ID:', session.client_reference_id || 'N/A');
        console.log('Payment status:', session.payment_status);
        console.log('Metadata:', JSON.stringify(session.metadata, null, 2));
        console.log('========================================\n');

        // Check if this is a gift card purchase
        if (session.metadata?.source === 'gift-card-purchase' && session.metadata?.couponId) {
          console.log('Gift card purchase detected!');
          console.log('Coupon ID:', session.metadata.couponId);
          console.log('Coupon Code:', session.metadata.couponCode);

          // Activate the gift card coupon
          await prisma.coupon.update({
            where: { id: session.metadata.couponId },
            data: { isActive: true },
          });

          console.log('Gift card coupon activated:', session.metadata.couponCode);
          console.log('Recipient:', session.metadata.recipientEmail);

          // TODO: Send gift card email to recipient
          // This would include the coupon code and message

          return NextResponse.json({ received: true });
        }

        // Get line items from Stripe
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // Find user by email
        const userEmail = session.customer_details?.email || session.client_reference_id;
        let user = null;
        if (userEmail && userEmail !== 'guest') {
          user = await prisma.user.findUnique({
            where: { email: userEmail },
          });
        }

        // Generate order number
        const orderNumber = `VK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Calculate amounts
        const subtotal = (session.amount_subtotal || 0) / 100;
        const total = (session.amount_total || 0) / 100;
        const shippingCost = total - subtotal;

        // Create order in database - SIMPLIFIED without items for now
        const order = await prisma.order.create({
          data: {
            orderNumber: orderNumber,
            userId: user?.id,
            customerEmail: userEmail || 'guest@vierkorken.ch',
            customerFirstName: session.customer_details?.name?.split(' ')[0] || 'Gast',
            customerLastName: session.customer_details?.name?.split(' ').slice(1).join(' ') || '',
            customerPhone: session.customer_details?.phone || null,
            shippingAddress: session.shipping_details?.address ? {
              firstName: session.shipping_details.name?.split(' ')[0] || '',
              lastName: session.shipping_details.name?.split(' ').slice(1).join(' ') || '',
              street: session.shipping_details.address.line1 || '',
              streetNumber: session.shipping_details.address.line2 || '',
              postalCode: session.shipping_details.address.postal_code || '',
              city: session.shipping_details.address.city || '',
              country: session.shipping_details.address.country || '',
            } : {},
            billingAddress: session.customer_details?.address ? {
              firstName: session.customer_details.name?.split(' ')[0] || '',
              lastName: session.customer_details.name?.split(' ').slice(1).join(' ') || '',
              street: session.customer_details.address.line1 || '',
              streetNumber: session.customer_details.address.line2 || '',
              postalCode: session.customer_details.address.postal_code || '',
              city: session.customer_details.address.city || '',
              country: session.customer_details.address.country || '',
            } : {},
            subtotal: subtotal,
            shippingCost: shippingCost,
            taxAmount: 0,
            discountAmount: 0,
            total: total,
            pointsEarned: Math.floor(total * 1.2),
            pointsUsed: 0,
            cashbackAmount: 0,
            paymentMethod: 'stripe',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            paymentIntentId: session.payment_intent as string,
            status: 'CONFIRMED',
          },
        });

        // Update user loyalty points if logged in
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loyaltyPoints: {
                increment: Math.floor(total * 1.2),
              },
              totalSpent: {
                increment: total,
              },
            },
          });

          // Create loyalty transaction
          await prisma.loyaltyTransaction.create({
            data: {
              userId: user.id,
              points: Math.floor(total * 1.2),
              reason: 'Purchase',
              referenceId: order.id,
              balanceBefore: user.loyaltyPoints,
              balanceAfter: user.loyaltyPoints + Math.floor(total * 1.2),
            },
          });

          // Check and update loyalty level
          const levelUpdate = await updateUserLoyaltyLevel(user.id, prisma);
          if (levelUpdate.levelChanged) {
            console.log(`🎊 User leveled up from ${levelUpdate.oldLevel} to ${levelUpdate.newLevel}!`);
          }
        }

        console.log('✅ Order created:', order.orderNumber);
        console.log('📦 Order ID:', order.id);

        // Send order confirmation email to customer
        try {
          console.log('📧 Sending order confirmation email to:', order.customerEmail);

          const orderData = {
            orderNumber: order.orderNumber,
            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            customerEmail: order.customerEmail,
            createdAt: order.createdAt,
            items: [], // Stripe orders don't have items stored yet - simplified
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            taxAmount: order.taxAmount,
            total: order.total,
            billingAddress: order.billingAddress,
            shippingAddress: order.shippingAddress,
          };

          await sendOrderConfirmationEmail(order.customerEmail, order.id, orderData);
          console.log('✅ Order confirmation email sent successfully');

          // Send admin notification
          try {
            console.log('📧 Sending admin notification for Stripe order:', order.orderNumber);
            await sendNewOrderNotificationToAdmin(order.id, orderData);
            console.log('✅ Admin notification sent successfully');
          } catch (adminEmailError) {
            console.error('❌ Failed to send admin notification:', adminEmailError);
            // Continue - admin email is non-critical
          }
        } catch (emailError) {
          console.error('❌ Failed to send order confirmation email:', emailError);
          // Continue with webhook processing even if email fails
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('\n========================================');
        console.log('💰 PAYMENT INTENT SUCCEEDED (TWINT/Async Payment)');
        console.log('========================================');
        console.log('Payment Intent ID:', paymentIntent.id);
        console.log('Amount:', (paymentIntent.amount || 0) / 100, paymentIntent.currency?.toUpperCase());
        console.log('Payment Method Types:', paymentIntent.payment_method_types);
        console.log('========================================\n');

        // Find order by payment intent ID
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { paymentIntentId: paymentIntent.id },
              { paymentIntentId: { startsWith: 'cs_' } }, // Checkout session ID
            ],
          },
        });

        if (order) {
          console.log('✅ Found order:', order.orderNumber);

          // Update order status to PAID and CONFIRMED
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              paidAt: new Date(),
            },
          });

          console.log('✅ Order marked as PAID and CONFIRMED');

          // Update user loyalty points if user exists
          if (order.userId) {
            await prisma.user.update({
              where: { id: order.userId },
              data: {
                loyaltyPoints: { increment: order.pointsEarned },
              },
            });

            // Update loyalty level
            await updateUserLoyaltyLevel(order.userId, prisma);
            console.log('✅ Loyalty points awarded:', order.pointsEarned);
          }

          // Send confirmation emails
          try {
            // Reload order with items for email
            const orderWithItems = await prisma.order.findUnique({
              where: { id: order.id },
              include: {
                items: true,
                tickets: true,
              },
            });

            if (orderWithItems) {
              const orderData = {
                orderNumber: orderWithItems.orderNumber,
                customerFirstName: orderWithItems.customerFirstName,
                customerLastName: orderWithItems.customerLastName,
                customerEmail: orderWithItems.customerEmail,
                createdAt: orderWithItems.createdAt,
                items: orderWithItems.items,
                subtotal: orderWithItems.subtotal,
                shippingCost: orderWithItems.shippingCost,
                taxAmount: orderWithItems.taxAmount,
                total: orderWithItems.total,
                billingAddress: orderWithItems.billingAddress,
                shippingAddress: orderWithItems.shippingAddress,
                deliveryMethod: orderWithItems.deliveryMethod,
              };

              await sendOrderConfirmationEmail(orderWithItems.customerEmail, orderWithItems.id, orderData);
              await sendNewOrderNotificationToAdmin(orderWithItems.id, orderData);
              console.log('✅ Confirmation emails sent');
            }
          } catch (emailError) {
            console.error('❌ Error sending emails:', emailError);
          }
        } else {
          console.log('⚠️  Order not found for Payment Intent:', paymentIntent.id);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('\n========================================');
        console.log('❌ PAYMENT INTENT FAILED (TWINT/Async Payment)');
        console.log('========================================');
        console.log('Payment Intent ID:', paymentIntent.id);
        console.log('Last error:', paymentIntent.last_payment_error?.message || 'Unknown error');
        console.log('========================================\n');

        // Find order by payment intent ID
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { paymentIntentId: paymentIntent.id },
              { paymentIntentId: { startsWith: 'cs_' } },
            ],
          },
        });

        if (order) {
          console.log('📦 Found order:', order.orderNumber);

          // Update order status to FAILED
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
              cancelledAt: new Date(),
              cancellationReason: paymentIntent.last_payment_error?.message || 'Payment failed',
            },
          });

          console.log('✅ Order marked as FAILED and CANCELLED');
        } else {
          console.log('⚠️  Order not found for Payment Intent:', paymentIntent.id);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: err.message },
      { status: 500 }
    );
  }
}
