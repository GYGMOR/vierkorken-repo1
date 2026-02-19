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
    initialCategory?: KnowledgeCategory | null;
}

export function KnowledgeCategoryManager({ onClose, onUpdate, initialCategory }: KnowledgeCategoryManagerProps) {
    const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('grape');
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialCategory) {
            setTitle(initialCategory.title);
            setDescription(initialCategory.description);
            setIcon(initialCategory.icon);
            setEditId(initialCategory.id);
        } else {
            resetForm();
        }
    }, [initialCategory]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIcon('grape');
        setEditId(null);
    };

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

    const handleSave = async () => {
        if (!title || !description) return;

        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId ? `/api/admin/knowledge-categories?id=${editId}` : '/api/admin/knowledge-categories';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    icon,
                }),
            });

            if (res.ok) {
                resetForm();
                fetchCategories();
                onUpdate();
                if (editId) onClose(); // Close if we were editing specific item passed via prop
            }
        } catch (error) {
            console.error('Error saving category:', error);
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
                        <CardTitle>{editId ? 'Kategorie bearbeiten' : 'Weinwissen Kategorien verwalten'}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            ✕
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Form */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                            <h3 className="text-md font-semibold mb-3">{editId ? 'Kategorie bearbeiten' : 'Neue Kategorie hinzufügen'}</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Titel (z.B. Rebsorten)"
                                    className="w-full p-2 border rounded"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Beschreibung (kurz)"
                                    className="w-full p-2 border rounded h-20"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />

                                <div>
                                    <label className="block text-sm font-medium mb-2">Icon auswählen:</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {Object.keys(CategoryIcons).map((iconKey) => {
                                            const IconComponent = CategoryIcons[iconKey];
                                            return (
                                                <button
                                                    key={iconKey}
                                                    onClick={() => setIcon(iconKey)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded border transition-colors ${icon === iconKey
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

                                <div className="flex gap-2">
                                    <Button onClick={handleSave} disabled={!title || !description}>
                                        {editId ? 'Speichern' : 'Erstellen'}
                                    </Button>
                                    {editId && (
                                        <Button variant="secondary" onClick={resetForm}>
                                            Abbrechen
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold">Bestehende Kategorien ({categories.length})</h3>
                            {loading ? (
                                <p>Lade...</p>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 italic mb-4">Noch keine Kategorien erstellt.</p>
                                    <Button
                                        onClick={async () => {
                                            if (!confirm('Möchten Sie die Standard-Kategorien wiederherstellen?')) return;
                                            try {
                                                const res = await fetch('/api/admin/seed-categories');
                                                if (res.ok) {
                                                    fetchCategories();
                                                    onUpdate();
                                                } else {
                                                    alert('Fehler beim Wiederherstellen');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Fehler beim Wiederherstellen');
                                            }
                                        }}
                                        variant="outline"
                                    >
                                        Standard-Kategorien wiederherstellen
                                    </Button>
                                </div>
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
