import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/checkout/verify-status?sessionId=vs_xxx
 *
 * Checks the status of a Stripe Identity Verification Session
 * and updates the user's verification status in the database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationSessionId = searchParams.get('sessionId');

    if (!verificationSessionId) {
      return NextResponse.json(
        { success: false, error: 'Verification Session ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking verification status for:', verificationSessionId);

    // Retrieve the verification session from Stripe
    const verificationSession = await stripe.identity.verificationSessions.retrieve(
      verificationSessionId
    );

    console.log('📊 Verification Status:', verificationSession.status);
    console.log('📄 Last Verification Report:', verificationSession.last_verification_report);

    const isVerified = verificationSession.status === 'verified';
    const session = await getServerSession(authOptions);

    // If verified and user is logged in, update the database
    if (isVerified && session?.user?.id) {
      console.log('✅ Verification successful, updating user profile...');

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          identityVerified: true,
          identityVerificationId: verificationSessionId,
          identityVerifiedAt: new Date(),
        },
      });

      console.log('💾 User verification status updated in database');
    }

    return NextResponse.json({
      success: true,
      verified: isVerified,
      status: verificationSession.status,
      verificationSessionId: verificationSessionId,
      metadata: verificationSession.metadata,
      lastError: verificationSession.last_error,
    });

  } catch (error: any) {
    console.error('❌ Error checking verification status:', error);
    console.error('❌ Error details:', error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Fehler beim Prüfen der Verifizierung',
      },
      { status: 500 }
    );
  }
}
