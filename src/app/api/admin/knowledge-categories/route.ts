import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const categories = await prisma.knowledgeCategory.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json({ success: true, categories });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, icon } = await request.json();

        const category = await prisma.knowledgeCategory.create({
            data: {
                title,
                description,
                icon: icon || 'grape',
                sortOrder: 0,
            },
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
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

        await prisma.knowledgeCategory.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
    }
}
