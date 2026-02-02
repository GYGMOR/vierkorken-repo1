import { prisma } from '@/lib/prisma';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { LOYALTY_LEVELS } from '@/lib/loyalty';
import { GiftManagementSection } from '@/components/admin/loyalty/GiftManagementSection';

export const dynamic = 'force-dynamic';

export default async function LoyaltyAdminPage() {
    let dbLevels: any[] = [];
    let variants: any[] = [];
    let error = null;

    try {
        dbLevels = await prisma.loyaltyLevel.findMany({
            include: {
                gifts: {
                    include: {
                        loyaltyLevel: true
                    }
                }
            },
            orderBy: { level: 'asc' },
        });

        variants = await prisma.wineVariant.findMany({
            where: { isAvailable: true },
            include: { wine: true },
            take: 100,
        });
    } catch (e) {
        console.error('Error fetching admin loyalty data:', e);
        error = 'Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.';
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-red-600">
                    <h2 className="text-xl font-bold mb-2">Ein Fehler ist aufgetreten</h2>
                    <p>{error}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-serif font-light text-graphite-dark">
                        Treue-System & Geschenke
                    </h1>
                    <p className="mt-2 text-graphite">
                        Verwalten Sie die Geschenke für jedes Loyalty-Level.
                    </p>
                </div>

                <div className="space-y-12">
                    {LOYALTY_LEVELS.map((levelConfig) => {
                        const dbLevel = dbLevels.find((l) => l.level === levelConfig.level);
                        const gifts = dbLevel?.gifts || [];

                        return (
                            <Card key={levelConfig.level} className="overflow-hidden">
                                <CardHeader className="bg-warmwhite-dark/50 border-b border-taupe-light/30">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Level {levelConfig.level}: {levelConfig.name}</CardTitle>
                                            <p className="text-sm text-graphite/60 mt-1">
                                                Ab {levelConfig.minPoints} Punkte
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <GiftManagementSection
                                    level={levelConfig}
                                    gifts={gifts}
                                    variants={variants}
                                />
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
