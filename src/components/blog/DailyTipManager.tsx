'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface DailyTip {
    id: string;
    title: string;
    content: string;
    isActive: boolean;
}

interface DailyTipManagerProps {
    onClose: () => void;
    onUpdate: () => void;
}

export function DailyTipManager({ onClose, onUpdate }: DailyTipManagerProps) {
    const [tips, setTips] = useState<DailyTip[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTip, setEditingTip] = useState<Partial<DailyTip> | null>(null);

    const fetchTips = async () => {
        try {
            const response = await fetch('/api/admin/tips');
            if (response.ok) {
                const data = await response.json();
                setTips(data.tips);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTips();
    }, []);

    const handleSave = async () => {
        if (!editingTip?.title || !editingTip?.content) return;

        try {
            const method = editingTip.id ? 'PUT' : 'POST';
            const body = JSON.stringify(editingTip);

            const response = await fetch('/api/admin/tips', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (response.ok) {
                fetchTips();
                setEditingTip(null);
                onUpdate();
            }
        } catch (error) {
            console.error('Error saving tip:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tipp wirklich löschen?')) return;
        await fetch(`/api/admin/tips?id=${id}`, { method: 'DELETE' });
        fetchTips();
        onUpdate();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-2xl font-serif text-graphite-dark">Tages-Tipps verwalten</h2>
                    <button onClick={onClose} className="text-graphite hover:text-red-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {editingTip ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Titel"
                                value={editingTip.title || ''}
                                onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <div className="border rounded-lg overflow-hidden">
                                <RichTextEditor
                                    content={editingTip.content || ''}
                                    onChange={(content) => setEditingTip({ ...editingTip, content })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setEditingTip(null)}>Abbrechen</Button>
                                <Button onClick={handleSave}>Speichern</Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Button onClick={() => setEditingTip({})} className="mb-4">Neuen Tipp hinzufügen</Button>
                            <div className="space-y-4">
                                {tips.map((tip) => (
                                    <div key={tip.id} className="border p-4 rounded flex justify-between items-start hover:bg-gray-50">
                                        <div>
                                            <h3 className="font-bold">{tip.title}</h3>
                                            <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: tip.content }} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingTip(tip)} className="text-blue-600 hover:text-blue-800">Bearbeiten</button>
                                            <button onClick={() => handleDelete(tip.id)} className="text-red-600 hover:text-red-800">Löschen</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
