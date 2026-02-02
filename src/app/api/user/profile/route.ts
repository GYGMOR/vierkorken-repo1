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
        profileImage: true,
        role: true,
        loyaltyPoints: true,
        loyaltyLevel: true,
        totalSpent: true,
        createdAt: true,
        identityVerified: true,
        identityVerificationId: true,
        identityVerifiedAt: true,
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
        profileImage: user.profileImage || '',
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyLevel: user.loyaltyLevel,
        totalSpent: Number(user.totalSpent),
        totalOrders: user._count.orders,
        memberSince: user.createdAt.toISOString(),
        identityVerified: user.identityVerified,
        identityVerificationId: user.identityVerificationId,
        identityVerifiedAt: user.identityVerifiedAt?.toISOString(),
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

export async function PATCH(req: NextRequest) {
  try {
    // Apply rate limiting: 20 updates per minute
    const rateLimitResponse = await applyRateLimit(req, 20, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { profileImage } = body;

    // Validate profileImage URL if provided
    if (profileImage && typeof profileImage !== 'string') {
      return NextResponse.json(
        { error: 'Invalid profile image URL' },
        { status: 400 }
      );
    }

    // Update user profile
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        profileImage: profileImage || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        role: true,
        loyaltyPoints: true,
        loyaltyLevel: true,
        totalSpent: true,
        createdAt: true,
      },
    });

    logSecurityEvent('Profile updated', { email: session.user.email, hasImage: !!profileImage }, 'low');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyLevel: user.loyaltyLevel,
        totalSpent: Number(user.totalSpent),
        memberSince: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    logSecurityEvent('Error updating user profile', { error: String(error) }, 'medium');
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Profils' },
      { status: 500 }
    );
  }
}
