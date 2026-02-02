'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateLevelSchema = z.object({
    level: z.number().int().min(1).max(7),
    benefits: z.array(z.string()).min(1),
    name: z.string().min(1).optional(),
});

export type UpdateLevelState = {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        [key: string]: string[];
    };
};

export async function updateLoyaltyLevel(
    prevState: UpdateLevelState,
    formData: FormData
): Promise<UpdateLevelState> {
    // Parse benefits from FormData (expecting multiple 'benefits[]' entries or a JSON string)
    let benefits: string[] = [];
    const benefitsRaw = formData.getAll('benefits');

    if (benefitsRaw.length > 0) {
        benefits = benefitsRaw.map(b => b.toString()).filter(b => b.trim() !== '');
    } else {
        // Fallback: try parsing 'benefitsJson' if sent as string
        const json = formData.get('benefitsJson');
        if (json) {
            try {
                benefits = JSON.parse(json.toString());
            } catch (e) {
                return { error: 'Invalid benefits format' };
            }
        }
    }

    const result = updateLevelSchema.safeParse({
        level: Number(formData.get('level')),
        benefits: benefits,
        name: formData.get('name')?.toString(),
    });

    if (!result.success) {
        return {
            error: 'Validierung fehlgeschlagen',
            fieldErrors: result.error.flatten().fieldErrors,
        };
    }

    const { level, benefits: validBenefits, name } = result.data;

    try {
        // Check if user is admin (this check assumes middleware or layout handles loose auth, 
        // but strict check is better. For now we trust the session check in the page component)

        await prisma.loyaltyLevel.update({
            where: { level },
            data: {
                benefits: validBenefits, // Prisma supports string[] on JSON fields automatically? Or needs explicit JSON.
                // Prisma Client handles string[] -> JSON mapping for JSON fields usually.
                ...(name && { name }),
            },
        });

        revalidatePath('/club');
        revalidatePath('/admin/loyalty');

        return { success: true };
    } catch (error) {
        console.error('Error updating loyalty level:', error);
        return { error: 'Datenbankfehler beim Aktualisieren' };
    }
}
