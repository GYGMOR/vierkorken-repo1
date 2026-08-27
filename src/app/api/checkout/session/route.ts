import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID fehlt' },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    // Try to find matching order in database by orderId metadata or paymentIntent
    let orderNumber = null;
    if (session.metadata?.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: session.metadata.orderId },
        select: { orderNumber: true }
      });
      if (order) orderNumber = order.orderNumber;
    }

    if (!orderNumber && session.payment_intent) {
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent.id;
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentIntentId: paymentIntentId },
            { paymentIntentId: session.id },
          ],
        },
        select: { orderNumber: true }
      });
      if (order) orderNumber = order.orderNumber;
    }

    return NextResponse.json({
      id: session.id,
      orderNumber: orderNumber || session.metadata?.orderNumber || session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email || session.customer_email,
      line_items: session.line_items,
    });
  } catch (error: any) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { error: 'Ungültige Session oder Fehler beim Abrufen', details: error.message },
      { status: 400 }
    );
  }
}
