import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');

        const posts = await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json({ success: true, posts });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        // Simplified for quick editorial creation
        const { title, content, excerpt, featuredImage, status } = body;

        // Auto-generate slug from title if not provided
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness
                content,
                excerpt,
                featuredImage,
                status: status || 'PUBLISHED',
                publishedAt: new Date(),
                tags: [],
            },
        });

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
    }
}
