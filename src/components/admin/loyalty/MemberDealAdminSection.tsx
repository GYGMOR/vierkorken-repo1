'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { createMemberDeal, updateMemberDeal, deleteMemberDeal } from '@/app/admin/actions/loyalty';

interface Deal {
    id: string;
    title: string;
    description?: string | null;
    image?: string | null;
    originalPrice: number | string;
    dealPrice: number | string;
    dealLabel: string;
    variantId?: string | null;
    isActive: boolean;
    sortOrder: number;
}

function DealEditor({ deal, variants, onCancel }: { deal?: Deal; variants: any[]; onCancel: () => void }) {
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState(deal?.title || '');
    const [description, setDescription] = useState(deal?.description || '');
    const [image, setImage] = useState(deal?.image || '');
    const [originalPrice, setOriginalPrice] = useState(deal?.originalPrice?.toString() || '');
    const [dealPrice, setDealPrice] = useState(deal?.dealPrice?.toString() || '');
    const [dealLabel, setDealLabel] = useState(deal?.dealLabel || 'Mitglieder-Angebot');
    const [variantId, setVariantId] = useState(deal?.variantId || 'none');
    const [isActive, setIsActive] = useState(deal?.isActive ?? true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('image', image);
        formData.append('originalPrice', originalPrice);
        formData.append('dealPrice', dealPrice);
        formData.append('dealLabel', dealLabel);
        formData.append('variantId', variantId);
        formData.append('isActive', isActive.toString());

        const result = deal
            ? await updateMemberDeal(deal.id, formData)
            : await createMemberDeal(formData);

        setSaving(false);

        if (result.success) {
            onCancel();
        } else {
            alert('Fehler: ' + JSON.stringify(result.error));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Titel</label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z.B. 2 für 1 Rosé"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Normalpreis (CHF)</label>
                    <input
                        type="number"
                        required
                        min={0}
                        step={0.05}
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="29.90"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Aktionspreis (CHF)</label>
                    <input
                        type="number"
                        required
                        min={0}
                        step={0.05}
                        value={dealPrice}
                        onChange={(e) => setDealPrice(e.target.value)}
                        placeholder="19.90"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Badge-Text</label>
                <input
                    type="text"
                    value={dealLabel}
                    onChange={(e) => setDealLabel(e.target.value)}
                    placeholder="z.B. 2 für 1 / 20% Rabatt / Exklusiv"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                />
                <p className="text-xs text-gray-400 mt-1">Erscheint als Aktions-Badge auf der Karte</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kurze Beschreibung des Angebots..."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bild</label>
                <ImageUploader
                    onUploadComplete={(url) => setImage(url)}
                    allowMultiple={false}
                    maxSizeMB={5}
                />
                {image && (
                    <div className="mt-2 relative w-24 h-16 rounded overflow-hidden border border-gray-200">
                        <Image src={image} alt="Vorschau" fill className="object-cover" />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Verknüpftes Produkt</label>
                <select
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                >
                    <option value="none">Kein Produkt verknüpft</option>
                    {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.wine.name} ({v.wine.vintage}) — {Number(v.bottleSize).toFixed(2)}l
                        </option>
                    ))}
                </select>
            </div>

            {deal && (
                <div className="flex items-center gap-2">
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300 text-accent-burgundy focus:ring-accent-burgundy"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Aktiv (wird auf Club-Seite angezeigt)</label>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    Abbrechen
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-accent-burgundy text-white rounded-lg text-sm font-medium hover:bg-accent-burgundy/90 disabled:opacity-50 transition-colors"
                >
                    {saving ? 'Speichern...' : deal ? 'Änderungen speichern' : 'Aktion erstellen'}
                </button>
            </div>
        </form>
    );
}

export function MemberDealAdminSection({ deals, variants }: { deals: Deal[]; variants: any[] }) {
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm('Aktion wirklich löschen?')) return;
        await deleteMemberDeal(id);
    };

    return (
        <div className="bg-white rounded-xl border border-taupe-light/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-taupe-light/30 bg-warmwhite-dark/30">
                <div>
                    <h2 className="text-lg font-serif font-medium text-graphite-dark">Aktionen</h2>
                    <p className="text-xs text-graphite/60 mt-0.5">Exklusive Angebote für Club-Mitglieder — nur für eingeloggte User sichtbar</p>
                </div>
                <button
                    onClick={() => { setIsCreating(true); setEditingDeal(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-burgundy text-white rounded-lg text-sm font-medium hover:bg-accent-burgundy/90 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Aktion hinzufügen
                </button>
            </div>

            <div className="p-6">
                {deals.length === 0 ? (
                    <div className="text-center py-12 text-graphite/40">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p>Noch keine Aktionen erfasst</p>
                        <button onClick={() => setIsCreating(true)} className="mt-3 text-accent-burgundy text-sm underline">
                            Erste Aktion erstellen
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deals.map((deal) => (
                            <div key={deal.id} className={`group relative rounded-lg border overflow-hidden ${deal.isActive ? 'border-taupe-light/50 bg-warmwhite-light' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                                {/* Image */}
                                <div className="relative w-full aspect-video bg-gray-100">
                                    {deal.image ? (
                                        <Image src={deal.image} alt={deal.title} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Deal badge */}
                                    <div className="absolute top-2 left-2 bg-accent-burgundy text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {deal.dealLabel}
                                    </div>
                                    {!deal.isActive && (
                                        <div className="absolute top-2 right-2 bg-gray-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                                            Inaktiv
                                        </div>
                                    )}
                                    {/* Actions */}
                                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingDeal(deal); setIsCreating(false); }}
                                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-accent-burgundy hover:text-white transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(deal.id)}
                                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-graphite-dark line-clamp-1">{deal.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-400 line-through">CHF {Number(deal.originalPrice).toFixed(2)}</span>
                                        <span className="text-sm font-bold text-accent-burgundy">CHF {Number(deal.dealPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {(editingDeal || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="text-lg font-serif font-medium text-graphite-dark">
                                {isCreating ? 'Neue Aktion' : 'Aktion bearbeiten'}
                            </h3>
                            <button
                                onClick={() => { setEditingDeal(null); setIsCreating(false); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto">
                            <DealEditor
                                deal={editingDeal ?? undefined}
                                variants={variants}
                                onCancel={() => { setEditingDeal(null); setIsCreating(false); }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
