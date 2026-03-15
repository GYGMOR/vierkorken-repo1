import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
    try {
        const templates = await prisma.eventTemplate.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ success: true, templates });
    } catch (error) {
        console.error('Error fetching event templates:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, content, imageUrl, isActive, order } = body;

        const template = await prisma.eventTemplate.create({
            data: {
                title,
                description,
                content: content || '',
                imageUrl: imageUrl || null,
                isActive: isActive ?? true,
                order: order || 0,
            },
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('Error creating event template:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const { title, description, content, imageUrl, isActive, order } = body;

        const template = await prisma.eventTemplate.update({
            where: { id },
            data: {
                title,
                description,
                content,
                imageUrl,
                isActive,
                order,
            },
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('Error updating event template:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        await prisma.eventTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting event template:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
