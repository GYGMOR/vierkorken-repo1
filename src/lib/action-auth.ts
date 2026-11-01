/**
 * Authorization helpers for server actions and API routes.
 * Server actions are publicly callable endpoints, so every action must check permissions itself.
 * (Intentionally not a 'use server' module – these helpers must not become callable actions.)
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

/** The logged-in user with id and role fresh from the database, or null. */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === 'ADMIN';
}

/** True if the logged-in user is `userId` itself or an admin. */
export async function canActForUser(userId: string): Promise<boolean> {
  const user = await getSessionUser();
  return !!user && (user.id === userId || user.role === 'ADMIN');
}
