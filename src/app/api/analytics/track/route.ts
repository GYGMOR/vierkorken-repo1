import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeString } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = sanitizeString(body.path || '/', 255);
    const title = sanitizeString(body.title || '', 255);
    const referrer = sanitizeString(body.referrer || 'Direct', 255);
    const sessionId = sanitizeString(body.sessionId || 'anonymous', 100);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                      req.headers.get('x-real-ip') ||
                      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // Simple device detection
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const device = isMobile ? 'Mobile' : 'Desktop';

    // Record page visit
    await prisma.pageVisit.create({
      data: {
        sessionId,
        path,
        title,
        referrer: referrer.includes('google') ? 'Google' : referrer.includes('instagram') ? 'Instagram' : referrer.includes('facebook') ? 'Facebook' : referrer === '' || referrer === 'Direct' ? 'Direct' : referrer,
        ipAddress,
        country: 'Schweiz',
        device,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking page visit:', error?.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
