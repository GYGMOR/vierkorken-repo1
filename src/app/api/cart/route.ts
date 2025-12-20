import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


/**
 * GET /api/cart
 * Get cart for current session or user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('cart_session')?.value;
    // TODO: Get userId from auth session

    if (!sessionId) {
      return NextResponse.json({ cart: null, items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                wine: {
                  include: {
                    images: {
                      where: { imageType: 'PRODUCT' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ cart: null, items: [] });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = parseFloat(item.variant.price.toString());
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity = 1, isGift = false, giftMessage, giftWrap = false } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID required' },
        { status: 400 }
      );
    }

    // Get or create cart session
    let sessionId = request.cookies.get('cart_session')?.value;

    if (!sessionId) {
      sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          isGift,
          giftMessage,
          giftWrap,
        },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
          isGift,
          giftMessage,
          giftWrap,
        },
      });
    }

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Clear cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    await prisma.cart.delete({
      where: { sessionId },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete('cart_session');

    return response;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
