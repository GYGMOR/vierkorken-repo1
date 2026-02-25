import { prisma } from '@/lib/prisma';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GiftSettingsCard } from '@/components/admin/loyalty/GiftSettingsCard';
import { PointsGrid } from '@/components/loyalty/PointsGrid';
import { SystemSettings } from './SystemSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    let dbRules: any[] = [];
    try {
        dbRules = await prisma.loyaltyProgramRule.findMany({ orderBy: { updatedAt: 'asc' } });
    } catch (e) {
        console.error('Error fetching rules for admin settings:', e);
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-serif text-graphite-dark">Einstellungen</h1>
                    <p className="text-graphite mt-2">Verwalten Sie die Systemeinstellungen, Loyalty und globale Werte.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Loyalty Settings Column */}
                    <div className="space-y-8">
                        {/* 1. Gift Settings */}
                        <GiftSettingsCard />

                        {/* 2. Points Rules Config */}
                        <Card className="shadow-md">
                            <CardHeader className="bg-warmwhite-dark/50 border-b border-taupe-light/30">
                                <CardTitle className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Punkte-Vergabe Regeln
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm text-graphite mb-6">
                                    Klicken Sie auf das Stift-Symbol der Kacheln, um den Text und die angezeigten Punkte auf der Club-Seite anzupassen.
                                </p>
                                <div className="bg-warmwhite p-4 rounded-xl border border-taupe-light/50">
                                    <PointsGrid rules={dbRules} isAdmin={true} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Settings Column */}
                    <div>
                        <SystemSettings />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
