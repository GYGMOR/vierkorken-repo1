'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    featuredImage: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt: string | null;
}

interface BlogPostManagerProps {
    onClose: () => void;
    onUpdate: () => void;
    initialPost?: BlogPost | null;
}

export function BlogPostManager({ onClose, onUpdate, initialPost }: BlogPostManagerProps) {
    const [post, setPost] = useState<Partial<BlogPost>>(initialPost || { status: 'PUBLISHED' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialPost) {
            setPost(initialPost);
        } else {
            setPost({ status: 'PUBLISHED' });
        }
    }, [initialPost]);

    const handleSave = async () => {
        if (!post.title || !post.content) {
            alert('Titel und Inhalt sind erforderlich.');
            return;
        }

        setSaving(true);
        try {
            const method = post.id ? 'PUT' : 'POST';
            const url = post.id ? `/api/admin/blog?id=${post.id}` : '/api/admin/blog';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post),
            });

            if (response.ok) {
                onUpdate();
                onClose();
            } else {
                const data = await response.json();
                alert('Fehler beim Speichern: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-2xl font-serif text-graphite-dark">
                        {post.id ? 'Artikel bearbeiten' : 'Neuen Artikel erstellen'}
                    </h2>
                    <button onClick={onClose} className="text-graphite hover:text-red-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                        <input
                            type="text"
                            value={post.title || ''}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent text-lg font-serif"
                            placeholder="Titel des Artikels"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kurzbeschreibung (Vorschau)</label>
                        <textarea
                            rows={3}
                            value={post.excerpt || ''}
                            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Kurze Zusammenfassung für die Übersicht..."
                        />
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vorschaubild</label>
                        {post.featuredImage ? (
                            <div className="relative group w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                                <img src={post.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setPost({ ...post, featuredImage: null })}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-md">
                                <ImageUploader
                                    onUploadComplete={(url) => setPost({ ...post, featuredImage: url })}
                                    maxSizeMB={2}
                                />
                            </div>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inhalt</label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[400px]">
                            <RichTextEditor
                                content={post.content || ''}
                                onChange={(content) => setPost({ ...post, content })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Speichert...' : 'Veröffentlichen'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
