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

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

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

    const { email, password, firstName, lastName, subscribeNewsletter } = body;

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

    // Calculate initial loyalty points (50 for newsletter signup)
    const initialPoints = subscribeNewsletter === true ? 50 : 0;

    // Create user with sanitized data
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'CUSTOMER',
        loyaltyPoints: initialPoints,
        loyaltyLevel: 1,
        totalSpent: 0,
        // Newsletter subscription
        newsletterSubscribed: subscribeNewsletter === true,
        newsletterSubscribedAt: subscribeNewsletter === true ? new Date() : null,
        // Consent tracking
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });

    // Handle newsletter subscription
    if (subscribeNewsletter === true) {
      // Check if email exists in NewsletterSubscriber table
      const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingSubscriber) {
        // Link existing subscriber to user
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { userId: user.id },
        });
      } else {
        // Create new NewsletterSubscriber record
        await prisma.newsletterSubscriber.create({
          data: {
            email: email.toLowerCase(),
            firstName,
            lastName,
            source: 'registration',
            userId: user.id,
            isActive: true,
            subscribedAt: new Date(),
          },
        });
      }

      // Create loyalty transaction for newsletter signup bonus
      await prisma.loyaltyTransaction.create({
        data: {
          userId: user.id,
          points: 50,
          reason: 'Newsletter Subscription',
          balanceBefore: 0,
          balanceAfter: 50,
        },
      });
    }

    logSecurityEvent('User registered successfully', { userId: user.id, email: user.email, newsletterSubscribed: subscribeNewsletter }, 'low');

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
