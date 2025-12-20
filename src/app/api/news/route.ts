import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewsletterSubscribers } from '@/lib/newsletter';
import { PostStatus } from '@prisma/client';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// GET /api/news - Get all published news
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const where = includeUnpublished
      ? {}
      : {
          status: PostStatus.PUBLISHED,
          publishedAt: {
            lte: new Date(),
          },
        };

    const news = await prisma.news.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der News',
      },
      { status: 500 }
    );
  }
}

// POST /api/news - Create new news (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, featuredImage, status, publishedAt, isPinned, sortOrder } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Titel und Inhalt sind erforderlich',
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status: status || PostStatus.DRAFT,
        publishedAt: publishedAt ? new Date(publishedAt) : status === PostStatus.PUBLISHED ? new Date() : null,
        isPinned: isPinned || false,
        sortOrder: sortOrder || 0,
      },
    });

    // Send newsletter notifications if publishing immediately
    if (news.status === PostStatus.PUBLISHED && news.publishedAt && news.publishedAt <= new Date()) {
      // Send notifications asynchronously (don't block response)
      notifyNewsletterSubscribers({
        title: news.title,
        excerpt: news.excerpt || undefined,
        slug: news.slug,
        featuredImage: news.featuredImage || undefined,
        content: news.content,
      }).catch(err => console.error('Failed to send newsletter notifications:', err));
    }

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen der News',
      },
      { status: 500 }
    );
  }
}
