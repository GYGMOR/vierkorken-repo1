import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { applyRateLimit, sanitizeString, logSecurityEvent } from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const rateLimitResponse = await applyRateLimit(req, 3, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeString(email.toLowerCase(), 255);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Always return success message (even if user doesn't exist) for security
    // This prevents email enumeration attacks
    if (!user) {
      logSecurityEvent(
        'Password reset requested for non-existent user',
        { email: sanitizedEmail },
        'low'
      );

      return NextResponse.json({
        message:
          'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts gesendet.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: tokenExpiry,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/passwort-zuruecksetzen?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.firstName || '');

      logSecurityEvent(
        'Password reset email sent successfully',
        { userId: user.id, email: user.email },
        'low'
      );

      console.log('✅ Password reset email sent successfully to:', user.email);
    } catch (emailError: any) {
      // Log the email error but don't expose it to the user for security reasons
      console.error('❌ Failed to send password reset email:', emailError.message);
      logSecurityEvent(
        'Password reset email failed',
        { userId: user.id, email: user.email, error: emailError.message },
        'medium'
      );

      // Still return success message to prevent email enumeration
      // but the email won't be sent
    }

    return NextResponse.json({
      message:
        'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts gesendet.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    logSecurityEvent('Forgot password error', { error: String(error) }, 'medium');

    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}
