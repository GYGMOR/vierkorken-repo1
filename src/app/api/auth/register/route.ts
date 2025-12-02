/**
 * User Registration API
 * 🔒 SECURITY: Rate limiting + Password strength validation + Input sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  applyRateLimit,
  validateRegistrationInput,
  logSecurityEvent,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 5 registration attempts per hour per IP
    const rateLimitResponse = await applyRateLimit(request, 5, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();

    // Validate and sanitize input
    const { valid, errors } = validateRegistrationInput(body);
    if (!valid) {
      logSecurityEvent('Invalid registration attempt', { errors }, 'low');
      return NextResponse.json(
        { error: 'Validierungsfehler', errors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      logSecurityEvent('Registration with existing email', { email }, 'low');
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser E-Mail existiert bereits' },
        { status: 400 }
      );
    }

    // Hash password with strong work factor
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with sanitized data
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'CUSTOMER',
        loyaltyPoints: 0,
        loyaltyLevel: 1,
        totalSpent: 0,
      },
    });

    logSecurityEvent('User registered successfully', { userId: user.id, email: user.email }, 'low');

    return NextResponse.json(
      {
        message: 'Konto erfolgreich erstellt',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    logSecurityEvent('Registration error', { error: String(error) }, 'medium');
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
