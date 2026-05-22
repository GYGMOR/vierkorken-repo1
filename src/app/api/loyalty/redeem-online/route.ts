import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

// POST /api/loyalty/redeem-online
// Body: { code: "PTS-XXXXXX" }
// Validates an online redeem code and marks it as redeemed
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
        }

        const body = await request.json();
        const code = (body.code as string)?.trim().toUpperCase();

        if (!code) {
            return NextResponse.json({ error: 'Kein Code angegeben' }, { status: 400 });
        }

        const activation = await prisma.giftActivation.findUnique({
            where: { redeemCode: code },
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true } },
                gift: true,
            },
        });

        if (!activation) {
            return NextResponse.json({ error: 'Ungültiger Code' }, { status: 404 });
        }

        if (activation.redeemedAt) {
            return NextResponse.json({ error: 'Dieser Code wurde bereits eingelöst' }, { status: 409 });
        }

        if (activation.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Code ist abgelaufen' }, { status: 410 });
        }

        // Only the owner can redeem online
        if (activation.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Dieser Code gehört nicht zu Ihrem Konto' }, { status: 403 });
        }

        // Mark as redeemed
        await prisma.giftActivation.update({
            where: { redeemCode: code },
            data: { redeemedAt: new Date(), redeemedBy: 'online' },
        });

        return NextResponse.json({
            success: true,
            gift: {
                id: activation.gift.id,
                name: activation.gift.name,
                description: activation.gift.description,
                image: activation.gift.image,
                variantId: activation.gift.variantId,
            },
            pointsDeducted: activation.pointCost,
        });
    } catch (error) {
        console.error('Failed to redeem online code:', error);
        return NextResponse.json({ error: 'Fehler beim Einlösen' }, { status: 500 });
    }
}

// GET /api/loyalty/redeem-online?code=PTS-XXXXXX
// Just validates without redeeming (for cart preview)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
        }

        const code = request.nextUrl.searchParams.get('code')?.trim().toUpperCase();

        if (!code) {
            return NextResponse.json({ error: 'Kein Code angegeben' }, { status: 400 });
        }

        const activation = await prisma.giftActivation.findUnique({
            where: { redeemCode: code },
            include: {
                user: { select: { email: true } },
                gift: true,
            },
        });

        if (!activation) {
            return NextResponse.json({ error: 'Ungültiger Code' }, { status: 404 });
        }

        if (activation.redeemedAt) {
            return NextResponse.json({ error: 'Dieser Code wurde bereits eingelöst' }, { status: 409 });
        }

        if (activation.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Code ist abgelaufen' }, { status: 410 });
        }

        if (activation.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Dieser Code gehört nicht zu Ihrem Konto' }, { status: 403 });
        }

        return NextResponse.json({
            valid: true,
            gift: {
                id: activation.gift.id,
                name: activation.gift.name,
                image: activation.gift.image,
            },
            pointsDeducted: activation.pointCost,
            expiresAt: activation.expiresAt,
        });
    } catch (error) {
        console.error('Failed to validate online code:', error);
        return NextResponse.json({ error: 'Fehler bei der Validierung' }, { status: 500 });
    }
}
