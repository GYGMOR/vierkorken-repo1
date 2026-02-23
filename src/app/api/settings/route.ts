import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const keysParam = searchParams.get('keys'); // Comma-separated list of keys

        if (key) {
            const setting = await prisma.settings.findUnique({
                where: { key },
            });
            return NextResponse.json({ success: true, setting });
        } else if (keysParam) {
            const keys = keysParam.split(',');
            const settings = await prisma.settings.findMany({
                where: { key: { in: keys } },
            });
            return NextResponse.json({ success: true, settings });
        }

        // Get all settings if admin
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const allSettings = await prisma.settings.findMany();
        return NextResponse.json({ success: true, settings: allSettings });

    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { key, value, description } = await request.json();

        if (!key || typeof value === 'undefined') {
            return NextResponse.json({ success: false, error: 'Key and value are required' }, { status: 400 });
        }

        const setting = await prisma.settings.upsert({
            where: { key },
            update: {
                value: String(value),
                ...(description !== undefined && { description }),
                updatedBy: session.user.id,
            },
            create: {
                key,
                value: String(value),
                ...(description !== undefined && { description }),
                updatedBy: session.user.id,
            },
        });

        return NextResponse.json({ success: true, setting });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
