import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
    try {
        const tips = await prisma.dailyTip.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, tips });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch tips' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, isActive } = body;

        const tip = await prisma.dailyTip.create({
            data: {
                title,
                content,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ success: true, tip });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create tip' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        await prisma.dailyTip.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete tip' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, content, isActive } = body;

        const tip = await prisma.dailyTip.update({
            where: { id },
            data: {
                title,
                content,
                isActive,
            },
        });

        return NextResponse.json({ success: true, tip });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update tip' }, { status: 500 });
    }
}
