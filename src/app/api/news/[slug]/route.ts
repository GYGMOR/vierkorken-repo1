import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { notifyNewsletterSubscribers } from '@/lib/newsletter';
import { PostStatus } from '@prisma/client';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// GET /api/news/[slug] - Get single news by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const news = await prisma.news.findUnique({
      where: { slug },
    });

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: 'News nicht gefunden',
        },
        { status: 404 }
      );
    }

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

// PUT /api/news/[slug] - Update news (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;
    const body = await request.json();
    const { title, excerpt, content, featuredImage, status, publishedAt, isPinned, sortOrder } = body;

    // Fetch original news to check if status changed
    const originalNews = await prisma.news.findUnique({
      where: { slug },
    });

    const news = await prisma.news.update({
      where: { slug },
      data: {
        title,
        excerpt,
        content,
        featuredImage,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        isPinned,
        sortOrder,
      },
    });

    // Send newsletter notifications if status changed from DRAFT to PUBLISHED
    if (
      originalNews &&
      originalNews.status !== PostStatus.PUBLISHED &&
      news.status === PostStatus.PUBLISHED &&
      news.publishedAt &&
      news.publishedAt <= new Date()
    ) {
      console.log(`📰 News status changed to PUBLISHED - triggering newsletter notifications for: ${news.title}`);
      // Send notifications asynchronously (don't block response)
      notifyNewsletterSubscribers({
        title: news.title,
        excerpt: news.excerpt || undefined,
        slug: news.slug,
        featuredImage: news.featuredImage || undefined,
        content: news.content,
      }).catch(err => console.error('❌ Failed to send newsletter notifications:', err));
    } else {
      console.log(`ℹ️  News update - no newsletter sent. Status: ${originalNews?.status} → ${news.status}, Published: ${news.publishedAt}`);
    }

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren der News',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[slug] - Delete news (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;
    await prisma.news.delete({
      where: { slug },
    });

    return NextResponse.json({
      success: true,
      message: 'News erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen der News',
      },
      { status: 500 }
    );
  }
}
