/**
 * Admin Newsletter Import API
 * Adds email addresses as newsletter-only subscribers (no customer account),
 * either a single manually entered address or many from a CSV/Excel import.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { isValidEmail, sanitizeString } from '@/lib/security';

export const runtime = 'nodejs';

const MAX_ENTRIES = 5000;

interface ImportEntry {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
}

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.role === 'ADMIN';
}

// POST /api/admin/newsletter/import - body: { entries: [{ email, firstName?, lastName? }], source?: 'admin-manual' | 'admin-import' }
export async function POST(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entries: ImportEntry[] = Array.isArray(body.entries) ? body.entries : [];
    const source = body.source === 'admin-manual' ? 'admin-manual' : 'admin-import';

    if (entries.length === 0) {
      return NextResponse.json({ success: false, error: 'Keine E-Mail-Adressen übermittelt.' }, { status: 400 });
    }

    if (entries.length > MAX_ENTRIES) {
      return NextResponse.json(
        { success: false, error: `Maximal ${MAX_ENTRIES} Adressen pro Import. Bitte die Datei aufteilen.` },
        { status: 400 }
      );
    }

    // Existing addresses (compared lowercase)
    const [users, newsletterSubscribers, maintenanceSubscribers] = await Promise.all([
      prisma.user.findMany({ select: { email: true } }),
      prisma.newsletterSubscriber.findMany({ select: { email: true, isActive: true } }),
      prisma.maintenanceModeSubscriber.findMany({ select: { email: true, isActive: true } }),
    ]);

    const accountEmails = new Set(users.map(u => u.email.toLowerCase()));
    const activeEmails = new Set<string>();
    const unsubscribedEmails = new Set<string>();
    [...newsletterSubscribers, ...maintenanceSubscribers].forEach(s => {
      const email = s.email.toLowerCase();
      if (s.isActive) activeEmails.add(email);
      else unsubscribedEmails.add(email);
    });

    const result = {
      added: [] as string[],
      alreadySubscribed: [] as string[],
      hasAccount: [] as string[],
      unsubscribed: [] as string[],
      invalid: [] as string[],
      duplicateInFile: [] as string[],
    };

    const seen = new Set<string>();
    const toCreate: { email: string; firstName: string | null; lastName: string | null; source: string }[] = [];

    for (const entry of entries) {
      const rawEmail = typeof entry.email === 'string' ? entry.email : '';
      const email = sanitizeString(rawEmail, 255).toLowerCase();

      if (!email || !isValidEmail(email)) {
        if (rawEmail.trim()) result.invalid.push(rawEmail.trim());
        continue;
      }
      if (seen.has(email)) {
        result.duplicateInFile.push(email);
        continue;
      }
      seen.add(email);

      if (accountEmails.has(email)) {
        result.hasAccount.push(email);
      } else if (activeEmails.has(email)) {
        result.alreadySubscribed.push(email);
      } else if (unsubscribedEmails.has(email)) {
        // Person has unsubscribed before – do not re-subscribe without their consent
        result.unsubscribed.push(email);
      } else {
        const firstName = typeof entry.firstName === 'string' ? sanitizeString(entry.firstName, 100) : '';
        const lastName = typeof entry.lastName === 'string' ? sanitizeString(entry.lastName, 100) : '';
        toCreate.push({ email, firstName: firstName || null, lastName: lastName || null, source });
        result.added.push(email);
      }
    }

    if (toCreate.length > 0) {
      await prisma.newsletterSubscriber.createMany({
        data: toCreate.map(s => ({ ...s, isActive: true, subscribedAt: new Date() })),
        skipDuplicates: true,
      });
    }

    console.log(`📥 Newsletter import (${source}): ${result.added.length} added, ${result.alreadySubscribed.length} existing, ${result.hasAccount.length} with account, ${result.unsubscribed.length} unsubscribed, ${result.invalid.length} invalid`);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error importing newsletter subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Import', details: error.message },
      { status: 500 }
    );
  }
}
