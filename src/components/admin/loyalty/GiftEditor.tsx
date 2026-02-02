'use client';

import { useState } from 'react';
import { updateGift, createGift } from '@/app/admin/actions/loyalty';
import { Button } from '@/components/ui/Button'; // Assuming you have this
import Image from 'next/image';

interface GiftEditorProps {
    gift?: any; // If null, create mode
    levelId?: number; // Required if creating
    variants: any[];
    onCancel?: () => void;
}

export function GiftEditor({ gift, levelId, variants, onCancel }: GiftEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState(gift?.name || '');
    const [description, setDescription] = useState(gift?.description || '');
    const [image, setImage] = useState(gift?.image || '');
    const [variantId, setVariantId] = useState(gift?.variantId || 'none');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('image', image);
        formData.append('variantId', variantId);

        let result;
        if (gift) {
            result = await updateGift(gift.id, formData);
        } else {
            if (levelId) formData.append('level', levelId.toString());
            result = await createGift(formData);
        }

        setIsSaving(false);

        if (result.success) {
            if (onCancel) onCancel(); // Close modal
        } else {
            alert('Fehler: ' + JSON.stringify(result.error));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Verknüpftes Produkt (Wein)</label>
                    <p className="text-xs text-gray-500 mb-1">Bild wird vom Produkt übernommen, wenn leer.</p>
                    <select
                        value={variantId}
                        onChange={(e) => setVariantId(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                    >
                        <option value="none">Kein Produkt verknüpft</option>
                        {variants.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.wine.name} ({v.wine.vintage}) - {Number(v.bottleSize).toFixed(2)}l
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Eigenes Bild URL (Optional)</label>
                    <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://..."
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:outline-none focus:ring-1 focus:ring-accent-burgundy"
                    />
                </div>
            </div>

            {(image || (variantId !== 'none' && !image)) && (
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Vorschau (Wenn Produkt verknüpft erst nach Speichern sichtbar wenn URL leer)</p>
                    {image && <div className="relative w-20 h-20"><Image src={image} alt="Vorschau" fill className="object-cover rounded" /></div>}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        Abbrechen
                    </button>
                )}
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Speichern...' : (gift ? 'Änderungen speichern' : 'Geschenk erstellen')}
                </Button>
            </div>
        </form>
    );
}
