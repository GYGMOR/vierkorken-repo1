'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const GiftSchema = z.object({
    loyaltyLevelId: z.coerce.number().min(1).max(7),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    image: z.string().url('Invalid image URL').optional().or(z.literal('')),
    variantId: z.string().optional(),
});

export async function createGift(formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    // Find LoyaltyLevel ID by level number
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
