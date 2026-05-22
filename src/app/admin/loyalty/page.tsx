import { prisma } from '@/lib/prisma';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GiftAdminSection } from '@/components/admin/loyalty/GiftAdminSection';
import { MemberDealAdminSection } from '@/components/admin/loyalty/MemberDealAdminSection';

export const dynamic = 'force-dynamic';

export default async function LoyaltyAdminPage() {
    let gifts: any[] = [];
    let variants: any[] = [];
    let deals: any[] = [];
    let error = null;

    try {
        gifts = await prisma.levelGift.findMany({
            orderBy: { pointCost: 'asc' },
        });

        variants = await prisma.wineVariant.findMany({
            where: { isAvailable: true },
            include: { wine: true },
            take: 100,
        });

        deals = await prisma.memberDeal.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    } catch (e) {
        console.error('Error fetching loyalty admin data:', e);
        error = 'Fehler beim Laden der Daten.';
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-red-600">
                    <p>{error}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-serif font-light text-graphite-dark">
                        Treueprogramm
                    </h1>
                    <p className="mt-1 text-graphite text-sm">
                        Prämien und Aktionen für Clubmitglieder verwalten.
                    </p>
                </div>

                <GiftAdminSection gifts={gifts} variants={variants} />
                <MemberDealAdminSection deals={deals} variants={variants} />
            </div>
        </AdminLayout>
    );
}
