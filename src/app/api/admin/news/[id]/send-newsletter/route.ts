import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { notifyNewsletterSubscribers } from '@/lib/newsletter';
import { PostStatus } from '@prisma/client';

export const runtime = 'nodejs';

// POST /api/admin/news/[id]/send-newsletter - Manually send a news newsletter (can be triggered multiple times)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json({ error: 'News nicht gefunden' }, { status: 404 });
    }

    if (news.status !== PostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Nur veröffentlichte News können als Newsletter versendet werden.' },
        { status: 400 }
      );
    }

    console.log(`📧 Manual send: news newsletter for "${news.title}"`);

    const result = await notifyNewsletterSubscribers({
      id: news.id,
      title: news.title,
      excerpt: news.excerpt || undefined,
      slug: news.slug,
      featuredImage: news.featuredImage || undefined,
      content: news.content,
      type: news.type,
    });

    const failedInfo = result.failed > 0 ? ` (${result.failed} fehlgeschlagen)` : '';

    return NextResponse.json({
      success: true,
      recipientCount: result.total,
      sentCount: result.success,
      failedCount: result.failed,
      message: `Newsletter wurde an ${result.success} von ${result.total} Empfängern versendet${failedInfo}.`,
    });
  } catch (error: any) {
    console.error('Error sending news newsletter:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden des Newsletters', details: error.message },
      { status: 500 }
    );
  }
}
