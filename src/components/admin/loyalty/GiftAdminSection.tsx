'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GiftEditor } from './GiftEditor';
import { deleteGift } from '@/app/admin/actions/loyalty';

export function GiftAdminSection({ gifts, variants }: { gifts: any[]; variants: any[] }) {
    const [editingGift, setEditingGift] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const sorted = [...gifts].sort((a, b) => (a.pointCost || 0) - (b.pointCost || 0));

    return (
        <div className="bg-white rounded-xl border border-taupe-light/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-taupe-light/30 bg-warmwhite-dark/30">
                <div>
                    <h2 className="text-lg font-serif font-medium text-graphite-dark">Prämien</h2>
                    <p className="text-xs text-graphite/60 mt-0.5">Geschenke die Kunden mit Punkten einlösen können — sortiert nach Punkten</p>
                </div>
                <button
                    onClick={() => { setIsCreating(true); setEditingGift(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-burgundy text-white rounded-lg text-sm font-medium hover:bg-accent-burgundy/90 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Prämie hinzufügen
                </button>
            </div>

            <div className="p-6">
                {sorted.length === 0 ? (
                    <div className="text-center py-12 text-graphite/40">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <p>Noch keine Prämien erfasst</p>
                        <button onClick={() => setIsCreating(true)} className="mt-3 text-accent-burgundy text-sm underline">
                            Erste Prämie erstellen
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {sorted.map((gift) => (
                            <div key={gift.id} className="group relative bg-warmwhite-light rounded-lg border border-taupe-light/50 overflow-hidden hover:shadow-md transition-all">
                                {/* Image */}
                                <div className="relative w-full aspect-square bg-gray-100">
                                    {gift.image ? (
                                        <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Points badge */}
                                    <div className="absolute top-1.5 left-1.5 bg-accent-burgundy text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {(gift.pointCost || 0).toLocaleString('de-CH')} PTS
                                    </div>
                                    {/* Action buttons */}
                                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingGift(gift); setIsCreating(false); }}
                                            className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-accent-burgundy hover:text-white transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={async () => { if (confirm('Wirklich löschen?')) await deleteGift(gift.id); }}
                                            className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {/* Name */}
                                <div className="px-2 py-1.5">
                                    <p className="text-xs font-medium text-graphite-dark line-clamp-1">{gift.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {(editingGift || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="text-lg font-serif font-medium text-graphite-dark">
                                {isCreating ? 'Neue Prämie' : 'Prämie bearbeiten'}
                            </h3>
                            <button onClick={() => { setEditingGift(null); setIsCreating(false); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto">
                            <GiftEditor
                                gift={editingGift}
                                levelId={1}
                                variants={variants}
                                onCancel={() => { setEditingGift(null); setIsCreating(false); }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
