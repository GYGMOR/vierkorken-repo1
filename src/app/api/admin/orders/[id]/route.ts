import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// GET: Fetch single order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Fetch order with all relations
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                wine: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellung', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, trackingNumber } = body;

    // Get current order before update
    const currentOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    const oldStatus = currentOrder.status;

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(status === 'SHIPPED' && !currentOrder.shippedAt && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && !currentOrder.deliveredAt && { deliveredAt: new Date() }),
      },
    });

    // Send email notification if status changed
    if (status !== oldStatus) {
      try {
        const {
          sendOrderProcessingEmail,
          sendOrderShippedEmail,
          sendOrderDeliveredEmail,
          sendOrderCancelledEmail,
        } = await import('@/lib/email');

        const customerEmail = order.customerEmail;
        const customerFirstName = order.customerFirstName;
        const orderNumber = order.orderNumber;

        switch (status) {
          case 'PROCESSING':
            await sendOrderProcessingEmail(customerEmail, orderNumber, customerFirstName);
            console.log(`✅ Processing email sent to ${customerEmail}`);
            break;

          case 'SHIPPED':
            await sendOrderShippedEmail(
              customerEmail,
              orderNumber,
              customerFirstName,
              trackingNumber || undefined
            );
            console.log(`✅ Shipping email sent to ${customerEmail} with tracking: ${trackingNumber || 'none'}`);
            break;

          case 'DELIVERED':
            await sendOrderDeliveredEmail(customerEmail, orderNumber, customerFirstName);
            console.log(`✅ Delivery email sent to ${customerEmail}`);
            break;

          case 'CANCELLED':
          case 'REFUNDED':
            await sendOrderCancelledEmail(customerEmail, orderNumber, customerFirstName);
            console.log(`✅ Cancellation email sent to ${customerEmail}`);
            break;

          default:
            console.log(`ℹ️ No email template for status: ${status}`);
        }
      } catch (emailError: any) {
        console.error('❌ Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Bestellung', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Delete order items first (due to foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Delete order
    await prisma.order.delete({
      where: { id },
    });

    console.log(`✅ Order ${order.orderNumber} deleted by admin`);

    return NextResponse.json({
      success: true,
      message: 'Bestellung wurde gelöscht',
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Bestellung', details: error.message },
      { status: 500 }
    );
  }
}
