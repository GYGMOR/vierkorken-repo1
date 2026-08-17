/**
 * Admin User Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


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

export async function GET(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = (searchParams.get('search') || '').toLowerCase();
  const filterType = searchParams.get('type') || 'ALL'; // "ALL", "ACCOUNT", "NEWSLETTER", "ADMIN"

  // Fetch registered users, newsletter subscribers, and maintenance subscribers in parallel
  const [users, newsletterSubscribers, maintenanceSubscribers] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: { orders: true, reviews: true, eventTickets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    }),
    prisma.maintenanceModeSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    }),
  ]);

  // Set of registered user emails (lowercase)
  const registeredEmails = new Set(users.map(u => u.email.toLowerCase()));

  // Map registered users
  const mappedUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
    accountType: user.role === 'ADMIN' ? 'ADMIN' : 'ACCOUNT',
    loyaltyPoints: user.loyaltyPoints,
    loyaltyLevel: user.loyaltyLevel,
    totalSpent: Number(user.totalSpent),
    newsletterSubscribed: user.newsletterSubscribed,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    hasAccount: true,
    ordersCount: user._count.orders,
    ticketsCount: user._count.eventTickets,
    reviewsCount: user._count.reviews,
  }));

  // Map standalone newsletter subscribers (who don't have a registered user account)
  const standaloneNewsletter = newsletterSubscribers
    .filter(sub => !registeredEmails.has(sub.email.toLowerCase()))
    .map(sub => ({
      id: `newsletter-${sub.id}`,
      email: sub.email,
      firstName: sub.firstName || '',
      lastName: sub.lastName || '',
      role: 'SUBSCRIBER',
      accountType: 'NEWSLETTER',
      loyaltyPoints: 0,
      loyaltyLevel: 1,
      totalSpent: 0,
      newsletterSubscribed: sub.isActive,
      createdAt: sub.subscribedAt,
      lastLoginAt: null,
      hasAccount: false,
      ordersCount: 0,
      ticketsCount: 0,
      reviewsCount: 0,
    }));

  // Map standalone maintenance subscribers (who don't have an account or newsletter entry)
  const existingSubEmails = new Set([...registeredEmails, ...standaloneNewsletter.map(s => s.email.toLowerCase())]);
  const standaloneMaintenance = maintenanceSubscribers
    .filter(sub => !existingSubEmails.has(sub.email.toLowerCase()))
    .map(sub => ({
      id: `maint-${sub.id}`,
      email: sub.email,
      firstName: '',
      lastName: '',
      role: 'SUBSCRIBER',
      accountType: 'NEWSLETTER',
      loyaltyPoints: 0,
      loyaltyLevel: 1,
      totalSpent: 0,
      newsletterSubscribed: sub.isActive,
      createdAt: sub.subscribedAt,
      lastLoginAt: null,
      hasAccount: false,
      ordersCount: 0,
      ticketsCount: 0,
      reviewsCount: 0,
    }));

  let allUnifiedUsers = [...mappedUsers, ...standaloneNewsletter, ...standaloneMaintenance];

  // Search filtering
  if (search) {
    allUnifiedUsers = allUnifiedUsers.filter(u =>
      u.email.toLowerCase().includes(search) ||
      u.firstName.toLowerCase().includes(search) ||
      u.lastName.toLowerCase().includes(search)
    );
  }

  // Type filtering
  if (filterType === 'ACCOUNT') {
    allUnifiedUsers = allUnifiedUsers.filter(u => u.hasAccount && u.role !== 'ADMIN');
  } else if (filterType === 'NEWSLETTER') {
    allUnifiedUsers = allUnifiedUsers.filter(u => !u.hasAccount || u.accountType === 'NEWSLETTER');
  } else if (filterType === 'ADMIN') {
    allUnifiedUsers = allUnifiedUsers.filter(u => u.role === 'ADMIN');
  }

  const counts = {
    total: mappedUsers.length + standaloneNewsletter.length + standaloneMaintenance.length,
    accounts: mappedUsers.filter(u => u.role !== 'ADMIN').length,
    newsletterOnly: standaloneNewsletter.length + standaloneMaintenance.length,
    admins: mappedUsers.filter(u => u.role === 'ADMIN').length,
  };

  return NextResponse.json({
    success: true,
    data: allUnifiedUsers,
    counts,
  });
}
