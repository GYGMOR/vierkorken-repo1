/**
 * User Profile API
 * 🔒 SECURITY: Authentication required + Rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  applyRateLimit,
  requireAuth,
  logSecurityEvent,
} from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting: 100 requests per minute
    const rateLimitResponse = await applyRateLimit(req, 100, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    // Get user with orders count
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        loyaltyPoints: true,
        loyaltyLevel: true,
        totalSpent: true,
        createdAt: true,
        _count: {
          select: {
            orders: {
              where: {
                paymentStatus: 'PAID',
              },
            },
          },
        },
      },
    });

    if (!user) {
      logSecurityEvent('Profile not found for authenticated user', { email: session.user.email }, 'medium');
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyLevel: user.loyaltyLevel,
        totalSpent: Number(user.totalSpent),
        totalOrders: user._count.orders,
        memberSince: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    logSecurityEvent('Error fetching user profile', { error: String(error) }, 'medium');
    return NextResponse.json(
      { error: 'Fehler beim Laden des Profils' },
      { status: 500 }
    );
  }
}
