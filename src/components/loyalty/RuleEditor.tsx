'use client';

import { useState } from 'react';
import { updateProgramRule } from '@/app/admin/actions/rules';

interface RuleEditorProps {
    identifier: string;
    initialName: string;
    initialPoints: string;
    initialDescription?: string;
}

export function RuleEditor({ identifier, initialName, initialPoints, initialDescription = '' }: RuleEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(initialName);
    const [points, setPoints] = useState(initialPoints);
    const [description, setDescription] = useState(initialDescription);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation to prevent opening the parent card modal
        setIsSaving(true);

        const formData = new FormData();
        formData.append('identifier', identifier);
        formData.append('name', name);
        formData.append('points', points);
        formData.append('description', description);

        const result = await updateProgramRule({}, formData);

        setIsSaving(false);
        if (result.success) {
            setIsOpen(false);
        } else {
            alert('Fehler beim Speichern');
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Don't trigger card click
                    setIsOpen(true);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-500 hover:text-accent-burgundy shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
                title="Regel bearbeiten"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-serif font-medium text-graphite-dark">
                                Regel bearbeiten
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:ring-1 focus:ring-accent-burgundy outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Punkte-Wert (Anzeige)</label>
                                <input
                                    type="text"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:ring-1 focus:ring-accent-burgundy outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (Popup)</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent-burgundy focus:ring-1 focus:ring-accent-burgundy outline-none"
                                    placeholder="Text der im Popup erscheint..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-accent-burgundy rounded-md hover:bg-accent-burgundy-dark disabled:opacity-50"
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
