import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/checkout/verify-status?state=xxx
 *
 * PROFESSIONAL: Validates state token and checks verification status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stateToken = searchParams.get('state');

    if (!stateToken) {
      return NextResponse.json(
        { success: false, error: 'State token is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking verification for state:', stateToken);

    // Load from database
    const verificationRecord = await prisma.verificationSession.findUnique({
      where: { stateToken: stateToken },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification session' },
        { status: 404 }
      );
    }

    // Check expiry
    if (new Date() > verificationRecord.expiresAt) {
      await prisma.verificationSession.update({
        where: { id: verificationRecord.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { success: false, error: 'Session expired', status: 'EXPIRED' },
        { status: 400 }
      );
    }

    // Already verified
    if (verificationRecord.status === 'VERIFIED') {
      return NextResponse.json({
        success: true,
        verified: true,
        status: 'VERIFIED',
      });
    }

    // Check Stripe
    const verificationSession = await stripe.identity.verificationSessions.retrieve(
      verificationRecord.verificationSessionId
    );

    console.log('📊 Stripe Status:', verificationSession.status);

    const isVerified = verificationSession.status === 'verified';
    const session = await getServerSession(authOptions);

    if (isVerified) {
      await prisma.verificationSession.update({
        where: { id: verificationRecord.id },
        data: { status: 'VERIFIED', completedAt: new Date() },
      });

      if (verificationRecord.userId && session?.user?.id === verificationRecord.userId) {
        await prisma.user.update({
          where: { id: verificationRecord.userId },
          data: {
            identityVerified: true,
            identityVerificationId: verificationRecord.verificationSessionId,
            identityVerifiedAt: new Date(),
          },
        });
      }
    } else if (verificationSession.status !== 'requires_input') {
      await prisma.verificationSession.update({
        where: { id: verificationRecord.id },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({
      success: true,
      verified: isVerified,
      status: verificationSession.status,
      lastError: verificationSession.last_error,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

