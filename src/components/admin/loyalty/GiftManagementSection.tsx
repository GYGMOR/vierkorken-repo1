'use client';

import { useState } from 'react';
import { GiftEditor } from './GiftEditor';
import { deleteGift } from '@/app/admin/actions/loyalty';
import Image from 'next/image';

export function GiftManagementSection({ level, gifts, variants }: { level: any, gifts: any[], variants: any[] }) {
    const [editingGift, setEditingGift] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleEdit = (gift: any) => {
        setEditingGift(gift);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingGift(null);
        setIsCreating(true);
    };

    const handleClose = () => {
        setEditingGift(null);
        setIsCreating(false);
    };

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gifts.map((gift) => (
                    <div key={gift.id} className="group relative border border-taupe-light/50 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="absolute top-2 right-2 flex gap-1 bg-white/90 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={() => handleEdit(gift)}
                                className="text-gray-500 hover:text-accent-burgundy p-1"
                                title="Bearbeiten"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('Wirklich löschen?')) await deleteGift(gift.id);
                                }}
                                className="text-gray-500 hover:text-red-600 p-1"
                                title="Löschen"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

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

                {/* Add Gift Button */}
                <button
                    onClick={handleCreate}
                    className="border-2 border-dashed border-taupe-light/50 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-warmwhite-light transition-colors min-h-[250px]"
                >
                    <div className="w-12 h-12 rounded-full bg-taupe-light/30 flex items-center justify-center mb-3 text-graphite/60">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <h4 className="font-medium text-graphite">Geschenk hinzufügen</h4>
                </button>
            </div>

            {/* Modal */}
            {(editingGift || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-serif font-medium text-graphite-dark">
                                {isCreating ? 'Neues Geschenk' : 'Geschenk bearbeiten'}
                            </h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <GiftEditor
                                gift={editingGift}
                                levelId={level.level}
                                variants={variants}
                                onCancel={handleClose}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
