import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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
        console.log('✅ Logged-in user already verified, skipping...');
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          verificationId: user.identityVerificationId,
        });
      }
    }

    // PROFESSIONAL: Also check if guest email belongs to verified user
    if (!session?.user?.id && customerEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail },
        select: {
          identityVerified: true,
          identityVerificationId: true,
          identityVerifiedAt: true,
        },
      });

      if (existingUser?.identityVerified && existingUser.identityVerifiedAt) {
        console.log('✅ Email belongs to verified user, skipping...');
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          verificationId: existingUser.identityVerificationId,
        });
      }
    }

    // PROFESSIONAL: Generate secure state token
    const stateToken = crypto.randomUUID();
    console.log('🎫 Generated state token:', stateToken);

    // Create return URL with state token
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/checkout/verify-complete?state=${stateToken}`;
    console.log('📍 Return URL:', returnUrl);
    console.log('📧 Customer Email:', customerEmail);

    // Create Stripe Identity Verification Session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: session?.user?.id || 'guest',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
        stateToken: stateToken,
      },
      options: {
        document: {
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_matching_selfie: true,
        },
      },
      return_url: returnUrl,
    });

    console.log('✅ Verification Session created:', verificationSession.id);
    console.log('🔗 Verification URL:', verificationSession.url);

    // Store verification session in database with state token
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await prisma.verificationSession.create({
      data: {
        stateToken: stateToken,
        verificationSessionId: verificationSession.id,
        userId: session?.user?.id || null,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
        status: 'PENDING',
        expiresAt: expiresAt,
      },
    });
    console.log('💾 Verification session stored in database');

    // If user is logged in, also update user profile
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
      stateToken: stateToken,
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
