'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function getUserByScannerId(userId: string) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return { error: 'Nicht autorisiert' };
        }
        
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            return { error: 'Nicht autorisiert (Admin Rechte erforderlich)' };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                loyaltyPoints: true,
            }
        });

        if (!user) {
            return { error: 'Kunde nicht gefunden' };
        }

        return { user };
    } catch (error) {
        console.error('Failed to get user by scanner id:', error);
        return { error: 'Interner Server Fehler' };
    }
}
