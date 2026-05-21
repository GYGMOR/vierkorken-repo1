import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert (Admin Rechte erforderlich)' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Fehlende oder ungültige Parameter (userId, amount)' }, { status: 400 });
    }

    // Points calculation: floor of CHF amount
    const pointsToAdd = Math.floor(amount);
    
    if (pointsToAdd <= 0) {
       return NextResponse.json({ error: 'Der Betrag muss hoch genug sein, um mindestens 1 Punkt zu generieren (>= 1 CHF)' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    // Update user and create transaction using a prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const balanceBefore = user.loyaltyPoints;
      const balanceAfter = balanceBefore + pointsToAdd;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { loyaltyPoints: balanceAfter },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          userId,
          points: pointsToAdd,
          reason: 'Vor-Ort Einkauf (Scanner)',
          referenceId: `scan-${Date.now()}`,
          balanceBefore,
          balanceAfter,
        },
      });

      return { updatedUser, transaction };
    });

    return NextResponse.json({ 
      success: true, 
      pointsAdded: pointsToAdd, 
      newBalance: result.updatedUser.loyaltyPoints,
      customerName: `${result.updatedUser.firstName} ${result.updatedUser.lastName}`
    });

  } catch (error) {
    console.error('Loyalty scan error:', error);
    return NextResponse.json({ error: 'Interner Server Fehler' }, { status: 500 });
  }
}
