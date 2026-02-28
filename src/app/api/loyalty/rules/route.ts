import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rules = await prisma.loyaltyProgramRule.findMany();
        return NextResponse.json({ success: true, rules });
    } catch (error) {
        console.error('Error fetching loyalty rules:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
