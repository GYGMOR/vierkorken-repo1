import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * POST /api/checkout/create-verification
 *
 * Creates a Stripe Identity Verification Session for age verification
 * Required for Swiss compliance (18+ for alcohol purchases)
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🔐 Creating Identity Verification Session...');

    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { customerEmail, customerName } = body;

    // Check if user is logged in and already verified
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          identityVerified: true,
          identityVerificationId: true,
          identityVerifiedAt: true,
        },
      });

      if (user?.identityVerified && user.identityVerifiedAt) {
        console.log('✅ User already verified, skipping...');
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          verificationId: user.identityVerificationId,
        });
      }
    }

    // Create return URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/checkout/verify-complete`;

    console.log('📍 Return URL:', returnUrl);
    console.log('📧 Customer Email:', customerEmail);

    // Create Stripe Identity Verification Session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'verification_flow',
      metadata: {
        userId: session?.user?.id || 'guest',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
      },
      return_url: returnUrl,
    });

    console.log('✅ Verification Session created:', verificationSession.id);
    console.log('🔗 Verification URL:', verificationSession.url);

    // If user is logged in, save the verification session ID to database
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          identityVerificationId: verificationSession.id,
        },
      });
      console.log('💾 Verification ID saved to user profile');
    }

    return NextResponse.json({
      success: true,
      verificationId: verificationSession.id,
      url: verificationSession.url,
      clientSecret: verificationSession.client_secret,
    });

  } catch (error: any) {
    console.error('❌ Error creating verification session:', error);
    console.error('❌ Error details:', error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Fehler beim Erstellen der Identitätsprüfung',
      },
      { status: 500 }
    );
  }
}
