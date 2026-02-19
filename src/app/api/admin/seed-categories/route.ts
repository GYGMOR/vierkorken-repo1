import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const count = await prisma.knowledgeCategory.count();
        if (count > 0) {
            return NextResponse.json({ success: false, message: 'Categories already exist' });
        }

        const defaults = [
            {
                title: 'Rebsorten',
                description: 'Lernen Sie die Unterschiede zwischen Rotwein, Weisswein, Rosé und Schaumwein kennen.',
                icon: 'grape',
                sortOrder: 1,
            },
            {
                title: 'Weinregionen',
                description: 'Entdecken Sie die bedeutendsten Weinregionen der Welt und ihre Besonderheiten.',
                icon: 'storage', // Mapping to 'storage' based on icon usage in page.tsx
                sortOrder: 2,
            },
            {
                title: 'Verkostung',
                description: 'Die Kunst der Weinverkostung: Sehen, Riechen, Schmecken.',
                icon: 'nose',
                sortOrder: 3,
            },
            {
                title: 'Food Pairing',
                description: 'Welcher Wein passt zu welchem Essen? Wir verraten es Ihnen.',
                icon: 'food',
                sortOrder: 4,
            },
        ];

        for (const cat of defaults) {
            await prisma.knowledgeCategory.create({
                data: cat,
            });
        }

        return NextResponse.json({ success: true, message: 'Seeded categories' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: 'Failed to seed' }, { status: 500 });
    }
}
