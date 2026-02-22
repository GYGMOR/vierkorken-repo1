import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Default sections if none exist in DB
const DEFAULT_SECTIONS = [
    { identifier: 'new-arrivals', title: 'Entdecke neue Schätze', sortOrder: 1, isVisible: true },
    { identifier: 'news', title: 'Aus den Weinbergen', sortOrder: 2, isVisible: true },
    { identifier: 'categories', title: 'Entdecke unsere Weinwelt', sortOrder: 3, isVisible: true },
    { identifier: 'discounted', title: 'Sale', sortOrder: 4, isVisible: true },
    { identifier: 'loyalty', title: 'Treue wird belohnt', sortOrder: 5, isVisible: true },
    { identifier: 'gift-cards', title: 'Geschenke & Zubehör', sortOrder: 6, isVisible: true },
];

export async function GET() {
    try {
        let sections = await prisma.homepageSection.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        // Seed if empty
        if (sections.length === 0) {
            for (const s of DEFAULT_SECTIONS) {
                await prisma.homepageSection.create({ data: s });
            }
            sections = await prisma.homepageSection.findMany({
                orderBy: { sortOrder: 'asc' },
            });
        }

        return NextResponse.json({ success: true, sections });
    } catch (error) {
        console.error('Error fetching homepage sections:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { sections } = await request.json();

        if (!Array.isArray(sections)) {
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        // Process updates in a transaction
        await prisma.$transaction(
            sections.map((section: any) =>
                prisma.homepageSection.upsert({
                    where: { identifier: section.identifier },
                    update: {
                        title: section.title,
                        isVisible: section.isVisible,
                        sortOrder: section.sortOrder,
                    },
                    create: {
                        identifier: section.identifier,
                        title: section.title,
                        isVisible: section.isVisible ?? true,
                        sortOrder: section.sortOrder ?? 0,
                    },
                })
            )
        );

        const updatedSections = await prisma.homepageSection.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ success: true, sections: updatedSections });
    } catch (error) {
        console.error('Error updating homepage sections:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
