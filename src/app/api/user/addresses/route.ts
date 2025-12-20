/**
 * User Addresses API
 * 🔒 SECURITY: Authentication required + Input validation + Sanitization + Rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  applyRateLimit,
  requireAuth,
  validateAddressInput,
  sanitizeString,
  logSecurityEvent,
} from '@/lib/security';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

// GET - Fetch user's addresses
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting: 100 requests per minute
    const rateLimitResponse = await applyRateLimit(req, 100, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' }, // Default first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    logSecurityEvent('Error fetching addresses', { error: String(error) }, 'low');
    return NextResponse.json(
      { error: 'Fehler beim Laden der Adressen' },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting: 20 address creations per hour
    const rateLimitResponse = await applyRateLimit(req, 20, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();

    // Validate and sanitize input
    const { valid, errors } = validateAddressInput(body);
    if (!valid) {
      logSecurityEvent('Invalid address input', { errors, userId: session.user.id }, 'low');
      return NextResponse.json(
        { error: 'Validierungsfehler', errors },
        { status: 400 }
      );
    }

    // Sanitize all string inputs
    const sanitizedData = {
      firstName: sanitizeString(body.firstName, 50),
      lastName: sanitizeString(body.lastName, 50),
      company: body.company ? sanitizeString(body.company, 100) : null,
      street: sanitizeString(body.street, 100),
      streetNumber: sanitizeString(body.streetNumber, 10),
      addressLine2: body.addressLine2 ? sanitizeString(body.addressLine2, 100) : null,
      postalCode: sanitizeString(body.postalCode, 20),
      city: sanitizeString(body.city, 100),
      state: body.state ? sanitizeString(body.state, 50) : null,
      country: body.country ? sanitizeString(body.country.toUpperCase(), 2) : 'CH',
      phone: body.phone ? sanitizeString(body.phone, 20) : null,
      isDefault: Boolean(body.isDefault),
      isBilling: Boolean(body.isBilling),
      isShipping: body.isShipping !== false, // Default to true
    };

    // If this should be default, unset other defaults
    if (sanitizedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        ...sanitizedData,
      },
    });

    logSecurityEvent('Address created', { addressId: address.id, userId: session.user.id }, 'low');

    return NextResponse.json({ address, message: 'Adresse erfolgreich erstellt' });
  } catch (error: any) {
    console.error('Error creating address:', error);
    logSecurityEvent('Error creating address', { error: String(error) }, 'medium');
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Adresse' },
      { status: 500 }
    );
  }
}
