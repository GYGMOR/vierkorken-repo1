import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { notifyNewsletterSubscribers } from '@/lib/newsletter';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Find all published news that haven't had a newsletter sent yet
        const pendingNews = await prisma.news.findMany({
            where: {
                status: 'PUBLISHED',
                newsletterSentAt: null,
                publishedAt: {
                    lte: new Date()
                }
            },
            orderBy: { publishedAt: 'asc' }
        });

        if (pendingNews.length === 0) {
            return NextResponse.json({ success: true, message: 'Keine ausstehenden Newsletter gefunden.', count: 0 });
        }

        console.log(`🚀 Starting manual resend for ${pendingNews.length} news items...`);

        const results = [];
        for (const news of pendingNews) {
            try {
                const res = await notifyNewsletterSubscribers({
                    id: news.id,
                    title: news.title,
                    excerpt: news.excerpt || undefined,
                    slug: news.slug,
                    featuredImage: news.featuredImage || undefined,
                    content: news.content,
                    type: news.type,
                });
                results.push({ id: news.id, title: news.title, status: 'success', details: res });
            } catch (err: any) {
                console.error(`❌ Failed to resend newsletter for news ${news.id}:`, err);
                results.push({ id: news.id, title: news.title, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `${pendingNews.length} Newsletter wurden verarbeitet.`, 
            processedCount: pendingNews.length,
            results 
        });

    } catch (error: any) {
        console.error('Resend Pending Newsletter Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
