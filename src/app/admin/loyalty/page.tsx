import { prisma } from '@/lib/prisma';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { createGift, deleteGift } from '../actions/loyalty';
import { LOYALTY_LEVELS } from '@/lib/loyalty';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function LoyaltyAdminPage() {
    const dbLevels = await prisma.loyaltyLevel.findMany({
        include: {
            gifts: {
                include: {
                    loyaltyLevel: true
                }
            }
        },
        orderBy: { level: 'asc' },
    });

    const variants = await prisma.wineVariant.findMany({
        where: { isAvailable: true },
        include: { wine: true },
        take: 100, // Limit for performance, consider search for production
    });

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
                                <CardContent className="p-6 space-y-6">
                                    {/* Current Gifts */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {gifts.map((gift) => (
                                            <div key={gift.id} className="group relative border border-taupe-light/50 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all">
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteGift(gift.id);
                                                }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button className="text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </form>

                                                <div className="aspect-square relative mb-3 bg-gray-100 rounded-md overflow-hidden">
                                                    {gift.image ? (
                                                        <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-300">
                                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-graphite-dark">{gift.name}</h4>
                                                <p className="text-sm text-graphite/70 line-clamp-2">{gift.description}</p>
                                            </div>
                                        ))}

                                        {/* Add Gift Form */}
                                        <div className="border-2 border-dashed border-taupe-light/50 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-transparent hover:bg-warmwhite-light transition-colors">
                                            <h4 className="font-medium text-graphite mb-4">Geschenk hinzufügen</h4>
                                            <form action={async (formData: FormData) => {
                                                'use server';
                                                await createGift(formData);
                                            }} className="w-full space-y-3">
                                                <input type="hidden" name="level" value={levelConfig.level} />
                                                <input type="text" name="name" placeholder="Name des Geschenks" className="w-full text-sm border-taupe-light/50 rounded-md px-3 py-2" required />
                                                <textarea name="description" placeholder="Beschreibung" className="w-full text-sm border-taupe-light/50 rounded-md px-3 py-2" rows={2}></textarea>
                                                <input type="url" name="image" placeholder="Bild URL" className="w-full text-sm border-taupe-light/50 rounded-md px-3 py-2" />

                                                <select name="variantId" className="w-full text-sm border-taupe-light/50 rounded-md px-3 py-2 bg-white">
                                                    <option value="none">Kein Produkt verknüpft (nur Info)</option>
                                                    {variants.map(v => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.wine.name} ({v.wine.vintage}) - {Number(v.bottleSize).toFixed(2)}l
                                                        </option>
                                                    ))}
                                                </select>

                                                <button type="submit" className="w-full bg-accent-burgundy text-white text-sm py-2 rounded-md hover:bg-accent-burgundy-dark transition-colors">
                                                    Speichern
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
