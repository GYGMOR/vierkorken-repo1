import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch User and their latest loyaltyLevel
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { loyaltyLevel: true, loyaltyPoints: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Fetch all levels up to the user's current level
        const loyaltyLevels = await prisma.loyaltyLevel.findMany({
            where: { level: { lte: user.loyaltyLevel } },
            orderBy: { level: 'asc' },
            include: { gifts: true }
        });

        // Now, find all gifts they have claimed
        const claims = await prisma.userLevelGiftClaim.findMany({
            where: { userId }
        });
        const claimedLevels = new Set(claims.map(c => c.level));

        // Let's identify which levels they STILL need to claim a gift for
        const unclaimedGiftsFullDetails = [];

        // Also, fetch validity settings globally
        const settings = await prisma.settings.findMany({
            where: { key: 'loyalty_gift_validity_days' }
        });
        const validityDaysStr = settings[0]?.value || '14';
        const validityDays = parseInt(validityDaysStr, 10) || 14;

        for (const lvl of loyaltyLevels) {
            if (!claimedLevels.has(lvl.level) && lvl.gifts.length > 0) {
                // If they haven't claimed a gift for this level, calculate the deadline.
                // We'll approximate the 'earned date' to now if it isn't recorded explicitly,
                // but actually, we should just say they are available.
                // For simplicity, we just list the gifts that are pending.

                // Because we don't have an explicit 'levelEarnedAt' timestamp in User, 
                // we'll provide the global validity days as context, or we can just list them.
                unclaimedGiftsFullDetails.push({
                    level: lvl.level,
                    levelName: lvl.name,
                    gifts: lvl.gifts,
                    validityDays: validityDays
                });
            }
        }

        return NextResponse.json({
            success: true,
            unclaimedGiftLevels: unclaimedGiftsFullDetails,
            validityDays
        });

    } catch (error) {
        console.error('Error fetching unclaimed gifts:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
