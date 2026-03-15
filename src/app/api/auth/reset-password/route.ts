import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { applyRateLimit, isStrongPassword, logSecurityEvent } from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 requests per hour per IP
    const rateLimitResponse = await applyRateLimit(req, 5, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Passwort ist erforderlich' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Passwort ist nicht sicher genug', errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      logSecurityEvent(
        'Password reset attempted with invalid or expired token',
        { token: token.substring(0, 10) + '...' },
        'medium'
      );

      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token. Bitte fordern Sie einen neuen Link an.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    logSecurityEvent(
      'Password successfully reset',
      { userId: user.id, email: user.email },
      'low'
    );

    return NextResponse.json({
      message: 'Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    logSecurityEvent('Reset password error', { error: String(error) }, 'medium');

    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}
