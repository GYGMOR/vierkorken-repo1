import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime
export const runtime = 'nodejs';

// Valid seasons
const VALID_SEASONS = ['winter', 'spring', 'summer', 'autumn'] as const;
type Season = typeof VALID_SEASONS[number];

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.role === 'ADMIN';
}

// GET - Get current season setting
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'current_season' },
    });

    return NextResponse.json({
      success: true,
      season: setting?.value || 'winter', // Default to winter
    });
  } catch (error) {
    console.error('Error fetching season setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch season setting' },
      { status: 500 }
    );
  }
}

// POST - Update season setting (admin only)
export async function POST(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { season } = await request.json();

    if (!VALID_SEASONS.includes(season)) {
      return NextResponse.json(
        { success: false, error: 'Invalid season' },
        { status: 400 }
      );
    }

    await prisma.settings.upsert({
      where: { key: 'current_season' },
      update: { value: season },
      create: { key: 'current_season', value: season },
    });

    return NextResponse.json({
      success: true,
      season,
    });
  } catch (error) {
    console.error('Error updating season setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update season setting' },
      { status: 500 }
    );
  }
}
