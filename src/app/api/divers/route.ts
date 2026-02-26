import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const isActiveOnly = searchParams.get('active') !== 'false';

        const filter: any = {};
        if (type) filter.type = type;
        if (isActiveOnly) filter.isActive = true;

        const products = await prisma.diversProduct.findMany({
            where: filter,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, products });
    } catch (error: any) {
        console.error('Error fetching divers products:', error);
        return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, price, image, gallery, type, isActive } = body;

        if (!title || price === undefined) {
            return NextResponse.json({ error: 'Titel und Preis sind erforderlich' }, { status: 400 });
        }

        const product = await prisma.diversProduct.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                image,
                gallery: gallery || [],
                type: type || 'SELL',
                isActive: isActive ?? true
            }
        });

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Error creating divers product:', error);
        return NextResponse.json({ success: false, error: 'Fehler beim Erstellen', details: error?.message || String(error) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, description, price, image, gallery, type, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 });
        }

        const product = await prisma.diversProduct.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(image !== undefined && { image }),
                ...(gallery !== undefined && { gallery }),
                ...(type !== undefined && { type }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Error updating divers product:', error);
        return NextResponse.json({ success: false, error: 'Fehler beim Aktualisieren', details: error?.message || String(error) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 });
        }

        await prisma.diversProduct.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting divers product:', error);
        return NextResponse.json({ success: false, error: 'Fehler beim Löschen' }, { status: 500 });
    }
}
