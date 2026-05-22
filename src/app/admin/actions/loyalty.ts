'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const GiftSchema = z.object({
    loyaltyLevelId: z.coerce.number().min(1).max(7),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    image: z.string().optional().or(z.literal('')),
    variantId: z.string().optional(),
    pointCost: z.coerce.number().min(1, 'Mindestens 1 Punkt'),
});

function generateRedeemCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'PTS-';
    for (let i = 0; i < 6; i++) {
        code += chars[randomBytes(1)[0] % chars.length];
    }
    return code;
}

export async function createGift(formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    const levelNumber = parseInt(data.level as string);
    const loyaltyLevel = await prisma.loyaltyLevel.findUnique({
        where: { level: levelNumber },
    });

    if (!loyaltyLevel) {
        return { error: 'Invalid loyalty level' };
    }

    const validatedFields = GiftSchema.safeParse({
        loyaltyLevelId: loyaltyLevel.id,
        name: data.name,
        description: data.description,
        image: data.image,
        variantId: data.variantId === 'none' ? undefined : data.variantId,
        pointCost: data.pointCost,
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.levelGift.create({
            data: {
                loyaltyLevelId: loyaltyLevel.id,
                name: validatedFields.data.name,
                description: validatedFields.data.description,
                image: validatedFields.data.image || null,
                variantId: validatedFields.data.variantId,
                pointCost: validatedFields.data.pointCost,
            },
        });

        revalidatePath('/admin/loyalty');
        return { success: true };
    } catch (error) {
        console.error('Failed to create gift:', error);
        return { error: 'Failed to create gift' };
    }
}

export async function deleteGift(giftId: string) {
    try {
        await prisma.levelGift.delete({
            where: { id: giftId },
        });

        revalidatePath('/admin/loyalty');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete gift:', error);
        return { error: 'Failed to delete gift' };
    }
}

export async function updateGift(giftId: string, formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    const validatedFields = GiftSchema.partial().safeParse({
        name: data.name,
        description: data.description,
        image: data.image,
        variantId: data.variantId === 'none' ? undefined : data.variantId,
        pointCost: data.pointCost,
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.levelGift.update({
            where: { id: giftId },
            data: {
                name: validatedFields.data.name,
                description: validatedFields.data.description,
                image: validatedFields.data.image || null,
                variantId: validatedFields.data.variantId,
                ...(validatedFields.data.pointCost !== undefined && { pointCost: validatedFields.data.pointCost }),
            },
        });

        revalidatePath('/admin/loyalty');
        return { success: true };
    } catch (error) {
        console.error('Failed to update gift:', error);
        return { error: 'Failed to update gift' };
    }
}

// User-facing actions

export async function getUnclaimedGifts(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                giftClaims: true,
            },
        });

        if (!user) return { error: 'User not found' };

        // Get all levels up to user's current level
        const passedLevels = Array.from({ length: user.loyaltyLevel }, (_, i) => i + 1).filter(l => l > 1); // Start from level 2

        // Filter levels that haven't been claimed
        const unclaimedLevels = passedLevels.filter(
            (level) => !user.giftClaims.some((claim) => claim.level === level)
        );

        if (unclaimedLevels.length === 0) return { gifts: [] };

        // Fetch gifts for unclaimed levels
        const gifts = await prisma.levelGift.findMany({
            where: {
                loyaltyLevelId: { in: unclaimedLevels },
            },
            include: {
                loyaltyLevel: true,
            },
        });

        // Enhance gifts with variant data if available
        const enhancedGifts = await Promise.all(gifts.map(async (gift) => {
            let productDetails = null;
            let displayImage = gift.image;

            if (gift.variantId) {
                const variant = await prisma.wineVariant.findUnique({
                    where: { id: gift.variantId },
                    include: {
                        wine: {
                            include: { images: true }
                        }
                    }
                });
                if (variant) {
                    productDetails = {
                        slug: variant.wine.slug,
                        winery: variant.wine.winery,
                        vintage: variant.wine.vintage || variant.vintage,
                        bottleSize: variant.bottleSize,
                        cartName: `${variant.wine.name} (${variant.wine.vintage || 'NV'})`,
                    };

                    // Fallback to wine image if gift image is missing
                    if (!displayImage && variant.wine.images.length > 0) {
                        // Find primary PRODUCT image or just take the first one
                        const primaryImage = variant.wine.images.find(img => img.imageType === 'PRODUCT') || variant.wine.images[0];
                        displayImage = primaryImage.url;
                    }
                }
            }
            return { ...gift, image: displayImage, productDetails };
        }));

        // Group by level
        const giftsByLevel = unclaimedLevels.map(level => ({
            level,
            gifts: enhancedGifts.filter(g => g.loyaltyLevel.level === level)
        })).filter(group => group.gifts.length > 0);

        return { giftsByLevel };
    } catch (error) {
        console.error('Failed to get unclaimed gifts:', error);
        return { error: 'Failed to fetch gifts' };
    }
}

export async function getUnclaimedGiftsWithValidity(userId: string) {
    try {
        const baseResult = await getUnclaimedGifts(userId);
        if ('error' in baseResult || !baseResult.giftsByLevel || baseResult.giftsByLevel.length === 0) {
            return baseResult;
        }

        const validitySetting = await prisma.settings.findUnique({
            where: { key: 'loyalty_gift_validity_days' }
        });
        const validityDays = validitySetting?.value ? Number(validitySetting.value) : 14;

        // In a real app we'd track EXACTLY when the user reached the level. 
        // For now, we'll approximate expiration relative to today or the user's last update.
        // Or simply report the validity days for the frontend to display relative to a recent event. 
        // For this requirement, we'll return an expiration date calculated from today (or user update time).
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { updatedAt: true } });
        const baseDate = user?.updatedAt || new Date();
        const expiresAt = new Date(baseDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

        return {
            ...baseResult,
            expiresAt: expiresAt.toISOString(),
            validityDays
        };

    } catch (error) {
        console.error('Failed to get unclaimed gifts with validity:', error);
        return { error: 'Failed to fetch gifts' };
    }
}

export async function createGiftActivation(userId: string, giftId: string) {
    try {
        const gift = await prisma.levelGift.findUnique({
            where: { id: giftId },
        });
        if (!gift) return { error: 'Prämie nicht gefunden' };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: 'Benutzer nicht gefunden' };

        const pointCost = gift.pointCost;
        if (user.loyaltyPoints < pointCost) {
            return { error: 'Nicht genügend Punkte' };
        }

        // Return existing active activation if one exists
        const existing = await prisma.giftActivation.findFirst({
            where: { userId, giftId, redeemedAt: null, expiresAt: { gt: new Date() } }
        });
        if (existing) return { token: existing.token, redeemCode: existing.redeemCode };

        // Deduct points immediately
        const newBalance = user.loyaltyPoints - pointCost;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h for online use

        let redeemCode = generateRedeemCode();
        // Ensure unique
        while (await prisma.giftActivation.findUnique({ where: { redeemCode } })) {
            redeemCode = generateRedeemCode();
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { loyaltyPoints: { decrement: pointCost } }
            }),
            prisma.loyaltyTransaction.create({
                data: {
                    userId,
                    points: -pointCost,
                    reason: `Prämie aktiviert: ${gift.name}`,
                    balanceBefore: user.loyaltyPoints,
                    balanceAfter: newBalance,
                }
            }),
        ]);

        const activation = await prisma.giftActivation.create({
            data: { userId, giftId, pointCost, expiresAt, redeemCode }
        });

        return { token: activation.token, redeemCode: activation.redeemCode };
    } catch (error) {
        console.error('Failed to create gift activation:', error);
        return { error: 'Fehler beim Aktivieren der Prämie' };
    }
}

export async function redeemGiftActivation(token: string) {
    try {
        const activation = await prisma.giftActivation.findUnique({
            where: { token },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, loyaltyPoints: true } },
                gift: true,
            }
        });

        if (!activation) return { error: 'Ungültiger QR-Code' };
        if (activation.redeemedAt) return { error: 'Dieser Code wurde bereits eingelöst' };
        if (activation.expiresAt < new Date()) return { error: 'QR-Code ist abgelaufen' };

        // Points already deducted on activate — just mark as redeemed
        await prisma.giftActivation.update({
            where: { token },
            data: { redeemedAt: new Date() }
        });

        return {
            success: true,
            customerName: `${activation.user.firstName} ${activation.user.lastName}`,
            giftName: activation.gift.name,
            pointsDeducted: activation.pointCost,
            newBalance: activation.user.loyaltyPoints,
        };
    } catch (error) {
        console.error('Failed to redeem gift activation:', error);
        return { error: 'Fehler beim Einlösen' };
    }
}

export async function claimGift(userId: string, level: number, giftId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { giftClaims: true }
        });

        if (!user) return { error: 'User not found' };
        if (user.loyaltyLevel < level) return { error: 'Level not reached' };

        const existingClaim = user.giftClaims.find(c => c.level === level);
        if (existingClaim) return { error: 'Gift already claimed for this level' };

        await prisma.userLevelGiftClaim.create({
            data: {
                userId,
                level,
                giftId,
            }
        });

        revalidatePath('/club'); // Revalidate relevant pages
        return { success: true };
    } catch (error) {
        console.error('Failed to claim gift:', error);
        return { error: 'Failed to claim gift' };
    }
}

// ─── Member Deals ────────────────────────────────────────────

export async function getMemberDeals() {
    try {
        const deals = await prisma.memberDeal.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
        return { deals };
    } catch (error) {
        console.error('Failed to get member deals:', error);
        return { error: 'Failed to fetch deals' };
    }
}

export async function getAllMemberDeals() {
    try {
        const deals = await prisma.memberDeal.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
        return { deals };
    } catch (error) {
        return { error: 'Failed to fetch deals' };
    }
}

export async function createMemberDeal(formData: FormData) {
    const data = Object.fromEntries(formData.entries());
    try {
        await prisma.memberDeal.create({
            data: {
                title: data.title as string,
                description: (data.description as string) || null,
                image: (data.image as string) || null,
                originalPrice: parseFloat(data.originalPrice as string),
                dealPrice: parseFloat(data.dealPrice as string),
                dealLabel: (data.dealLabel as string) || 'Mitglieder-Angebot',
                variantId: data.variantId && data.variantId !== 'none' ? data.variantId as string : null,
                isActive: true,
            }
        });
        revalidatePath('/admin/loyalty');
        revalidatePath('/club');
        return { success: true };
    } catch (error) {
        console.error('Failed to create member deal:', error);
        return { error: 'Failed to create deal' };
    }
}

export async function updateMemberDeal(id: string, formData: FormData) {
    const data = Object.fromEntries(formData.entries());
    try {
        await prisma.memberDeal.update({
            where: { id },
            data: {
                title: data.title as string,
                description: (data.description as string) || null,
                image: (data.image as string) || null,
                originalPrice: parseFloat(data.originalPrice as string),
                dealPrice: parseFloat(data.dealPrice as string),
                dealLabel: (data.dealLabel as string) || 'Mitglieder-Angebot',
                variantId: data.variantId && data.variantId !== 'none' ? data.variantId as string : null,
                isActive: data.isActive === 'true',
            }
        });
        revalidatePath('/admin/loyalty');
        revalidatePath('/club');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update deal' };
    }
}

export async function deleteMemberDeal(id: string) {
    try {
        await prisma.memberDeal.delete({ where: { id } });
        revalidatePath('/admin/loyalty');
        revalidatePath('/club');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete deal' };
    }
}
