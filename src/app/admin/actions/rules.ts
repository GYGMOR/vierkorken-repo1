'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateRuleSchema = z.object({
    identifier: z.string().min(1),
    name: z.string().min(1),
    points: z.string().min(1),
    description: z.string().optional(),
});

export type UpdateRuleState = {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        [key: string]: string[];
    };
};

export async function updateProgramRule(
    prevState: UpdateRuleState,
    formData: FormData
): Promise<UpdateRuleState> {
    const result = updateRuleSchema.safeParse({
        identifier: formData.get('identifier'),
        name: formData.get('name'),
        points: formData.get('points'),
        description: formData.get('description'),
    });

    if (!result.success) {
        return {
            error: 'Validierung fehlgeschlagen',
            fieldErrors: result.error.flatten().fieldErrors,
        };
    }

    const { identifier, name, points, description } = result.data;

    try {
        await prisma.loyaltyProgramRule.upsert({
            where: { identifier },
            update: {
                name,
                points,
                description,
            },
            create: {
                identifier,
                name,
                points,
                description,
                icon: identifier === 'purchase' ? 'cart' :
                    identifier === 'review' ? 'review' :
                        identifier === 'event' ? 'event' : 'referral', // Default icons
            },
        });

        revalidatePath('/club');
        revalidatePath('/konto');

        return { success: true };
    } catch (error) {
        console.error('Error updating rule:', error);
        return { error: 'Datenbankfehler beim Aktualisieren' };
    }
}
