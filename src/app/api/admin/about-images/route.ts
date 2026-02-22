import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET all about page images
export async function GET() {
    try {
        const images = await prisma.aboutPageImage.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ success: true, images });
    } catch (error) {
        console.error('Error fetching about page images:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// POST new about page image
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { url, side, order } = body;

        if (!url || !side) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const image = await prisma.aboutPageImage.create({
            data: {
                url,
                side,
                order: order || 0,
            },
        });

        return NextResponse.json({ success: true, image });
    } catch (error) {
        console.error('Error creating about page image:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE about page image
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

        await prisma.aboutPageImage.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting about page image:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
