import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


// PUT - Update address
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const body = await req.json();
    const addressId = id;

    const {
      firstName,
      lastName,
      company,
      street,
      streetNumber,
      addressLine2,
      postalCode,
      city,
      state,
      country,
      phone,
      isDefault,
      isBilling,
      isShipping,
    } = body;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: 'Adresse nicht gefunden' }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        firstName,
        lastName,
        company: company || null,
        street,
        streetNumber,
        addressLine2: addressLine2 || null,
        postalCode,
        city,
        state: state || null,
        country: country || 'CH',
        phone: phone || null,
        isDefault: isDefault || false,
        isBilling: isBilling || false,
        isShipping: isShipping !== false,
      },
    });

    return NextResponse.json({ address, message: 'Adresse erfolgreich aktualisiert' });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Adresse', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const addressId = id;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: 'Adresse nicht gefunden' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: 'Adresse erfolgreich gelöscht' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Adresse', details: error.message },
      { status: 500 }
    );
  }
}
