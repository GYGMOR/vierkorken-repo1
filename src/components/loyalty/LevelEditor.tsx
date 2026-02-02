'use client';

import { useState } from 'react';
import { updateLoyaltyLevel } from '@/app/admin/actions/level';

interface LevelEditorProps {
    level: number;
    initialName: string;
    initialBenefits: string[];
    initialDescription?: string;
}

export function LevelEditor({ level, initialName, initialBenefits, initialDescription = '' }: LevelEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [benefits, setBenefits] = useState<string[]>(initialBenefits);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddBenefit = () => {
        setBenefits([...benefits, '']);
    };

    const handleBenefitChange = (index: number, value: string) => {
        const newBenefits = [...benefits];
        newBenefits[index] = value;
        setBenefits(newBenefits);
    };

    const handleRemoveBenefit = (index: number) => {
        const newBenefits = benefits.filter((_, i) => i !== index);
        setBenefits(newBenefits);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append('level', level.toString());
        formData.append('name', name);
        formData.append('description', description);
        // Send standard fields for simplicity, or JSON
        formData.append('benefitsJson', JSON.stringify(benefits.filter(b => b.trim() !== '')));

        const result = await updateLoyaltyLevel({}, formData);

        setIsSaving(false);
        if (result.success) {
            setIsOpen(false);
        } else {
            alert('Fehler beim Speichern: ' + (result.error || 'Unbekannter Fehler'));
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white text-graphite-dark shadow-sm transition-all z-10"
                title="Level bearbeiten"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-serif font-medium text-graphite-dark">
                                Level {level} bearbeiten
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-burgundy focus:ring-accent-burgundy sm:text-sm p-2 border"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-burgundy focus:ring-accent-burgundy sm:text-sm p-2 border"
                                    rows={3}
                                    placeholder="Kurze Beschreibung des Levels..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vorteile</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {benefits.map((benefit, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={benefit}
                                                onChange={(e) => handleBenefitChange(index, e.target.value)}
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-accent-burgundy focus:ring-accent-burgundy sm:text-sm p-2 border"
                                                placeholder="Vorteil beschreiben..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBenefit(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="Entfernen"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddBenefit}
                                    className="mt-2 text-sm text-accent-burgundy hover:text-accent-burgundy-dark font-medium flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Vorteil hinzufügen
                                </button>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    disabled={isSaving}
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-accent-burgundy rounded-md hover:bg-accent-burgundy-dark disabled:opacity-50"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Speichern...' : 'Speichern'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
