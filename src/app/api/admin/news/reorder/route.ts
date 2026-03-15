import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * POST /api/admin/news/reorder
 * Expects { items: { id: string, sortOrder: number }[] }
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Keine Berechtigung' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { items } = body;

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Ungültiges Format, erwartete ein Array von items' },
                { status: 400 }
            );
        }

        // Update each item in a transaction
        await prisma.$transaction(
            items.map((item) =>
                prisma.news.update({
                    where: { id: item.id },
                    data: { sortOrder: item.sortOrder },
                })
            )
        );

        return NextResponse.json({ success: true, message: 'Reihenfolge erfolgreich gespeichert' });
    } catch (error) {
        console.error('Error reordering news:', error);
        return NextResponse.json(
            { success: false, error: 'Fehler beim Speichern der Reihenfolge' },
            { status: 500 }
        );
    }
}
