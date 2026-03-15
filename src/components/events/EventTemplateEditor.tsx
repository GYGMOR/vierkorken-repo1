import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface EventTemplate {
    id: string;
    title: string;
    description: string;
    content: string | null;
    imageUrl: string | null;
    order: number;
    isActive: boolean;
}

interface EventTemplateEditorProps {
    onClose: () => void;
    onUpdate: () => void;
    initialTemplate?: EventTemplate | null;
}

export function EventTemplateEditor({ onClose, onUpdate, initialTemplate }: EventTemplateEditorProps) {
    const [template, setTemplate] = useState<Partial<EventTemplate>>(
        initialTemplate || { isActive: true, order: 0 }
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!template.title || !template.description) {
            alert('Titel und Beschreibung sind erforderlich.');
            return;
        }

        setSaving(true);
        try {
            const method = template.id ? 'PUT' : 'POST';
            const url = template.id ? `/api/admin/event-templates?id=${template.id}` : '/api/admin/event-templates';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template),
            });

            if (response.ok) {
                onUpdate();
                onClose();
            } else {
                const data = await response.json();
                alert('Fehler beim Speichern: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-2xl font-serif text-graphite-dark">
                        {template.id ? 'Event-Vorlage bearbeiten' : 'Neue Event-Vorlage'}
                    </h2>
                    <button onClick={onClose} className="text-graphite hover:text-red-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                                <input
                                    type="text"
                                    value={template.title || ''}
                                    onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent text-lg font-serif"
                                    placeholder="z.B. Wein-Tasting für Teams"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kurzbeschreibung</label>
                                <textarea
                                    rows={3}
                                    value={template.description || ''}
                                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent"
                                    placeholder="Kurze Zusammenfassung für die Übersicht"
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={template.isActive ?? true}
                                        onChange={(e) => setTemplate({ ...template, isActive: e.target.checked })}
                                        className="w-4 h-4 text-accent-burgundy focus:ring-accent-burgundy border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Aktiv (Sichtbar)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bild</label>
                            {template.imageUrl ? (
                                <div className="relative group w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                                    <img src={template.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setTemplate({ ...template, imageUrl: null })}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="max-w-md">
                                    <ImageUploader
                                        onUploadComplete={(url) => setTemplate({ ...template, imageUrl: url })}
                                        maxSizeMB={5}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ausführlicher Inhalt (optional)</label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px]">
                            <RichTextEditor
                                content={template.content || ''}
                                onChange={(content) => setTemplate({ ...template, content })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Abbrechen
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !template.title || !template.description}>
                        {saving ? 'Speichert...' : 'Speichern'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
