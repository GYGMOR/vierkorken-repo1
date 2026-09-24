import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
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
      include: {
        event: {
          select: {
            slug: true,
            startDateTime: true,
            venue: true,
            price: true,
          }
        }
      }
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

    let newPublishedAt = publishedAt ? new Date(publishedAt) : undefined;
    if (status === PostStatus.PUBLISHED && originalNews?.status !== PostStatus.PUBLISHED && !publishedAt) {
      newPublishedAt = new Date();
    }

    const news = await prisma.news.update({
      where: { slug },
      data: {
        title,
        excerpt,
        content,
        featuredImage,
        status,
        ...(newPublishedAt && { publishedAt: newPublishedAt }),
        isPinned,
        sortOrder,
      },
    });

    // Newsletter wird nicht automatisch beim Veröffentlichen versendet, sondern manuell über
    // POST /api/admin/news/[id]/send-newsletter (Play-Button auf der News-Seite).

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
