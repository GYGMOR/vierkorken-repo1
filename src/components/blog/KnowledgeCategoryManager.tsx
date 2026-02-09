import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryIcons } from './CategoryIcons';

interface KnowledgeCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
}

interface KnowledgeCategoryManagerProps {
    onClose: () => void;
    onUpdate: () => void;
}

export function KnowledgeCategoryManager({ onClose, onUpdate }: KnowledgeCategoryManagerProps) {
    const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newIcon, setNewIcon] = useState('grape');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/knowledge-categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle || !newDescription) return;

        try {
            const res = await fetch('/api/admin/knowledge-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    icon: newIcon,
                }),
            });

            if (res.ok) {
                setNewTitle('');
                setNewDescription('');
                fetchCategories();
                onUpdate();
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Kategorie wirklich löschen?')) return;

        try {
            const res = await fetch(`/api/admin/knowledge-categories?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchCategories();
                onUpdate();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Weinwissen Kategorien verwalten</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            ✕
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Create New Helper */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                            <h3 className="text-md font-semibold mb-3">Neue Kategorie hinzufügen</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Titel (z.B. Rebsorten)"
                                    className="w-full p-2 border rounded"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Beschreibung (kurz)"
                                    className="w-full p-2 border rounded h-20"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                />

                                <div>
                                    <label className="block text-sm font-medium mb-2">Icon auswählen:</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {Object.keys(CategoryIcons).map((iconKey) => {
                                            const IconComponent = CategoryIcons[iconKey];
                                            return (
                                                <button
                                                    key={iconKey}
                                                    onClick={() => setNewIcon(iconKey)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded border transition-colors ${newIcon === iconKey
                                                            ? 'bg-accent-burgundy text-white border-accent-burgundy'
                                                            : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                    title={iconKey}
                                                >
                                                    <IconComponent className="w-6 h-6 mb-1" />
                                                    <span className="text-[10px] capitalize">{iconKey}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button onClick={handleCreate} disabled={!newTitle || !newDescription}>
                                    Erstellen
                                </Button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold">Bestehende Kategorien ({categories.length})</h3>
                            {loading ? (
                                <p>Lade...</p>
                            ) : categories.length === 0 ? (
                                <p className="text-gray-500 italic">Noch keine Kategorien erstellt.</p>
                            ) : (
                                categories.map((cat) => {
                                    const IconComponent = CategoryIcons[cat.icon] || CategoryIcons.grape;
                                    return (
                                        <div key={cat.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-100 rounded text-gray-600">
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {cat.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{cat.description}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    Löschen
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
