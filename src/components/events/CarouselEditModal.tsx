'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface CarouselImage {
    id: string;
    url: string;
    altText: string | null;
    order: number;
}

interface CarouselEditModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

export function CarouselEditModal({ onClose, onUpdate }: CarouselEditModalProps) {
    const [images, setImages] = useState<CarouselImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const fetchImages = async () => {
        try {
            setLoading(true);
            // Add cache busting to ensure we get fresh data
            const response = await fetch(`/api/admin/event-carousel?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                setImages(data.images);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Bild wirklich löschen?')) return;

        try {
            const response = await fetch(`/api/admin/event-carousel?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchImages();
                onUpdate();
            } else {
                alert('Fehler beim Löschen');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Fehler beim Löschen');
        }
    };

    const handleUpload = async (url: string) => {
        setAdding(true);
        try {
            const response = await fetch('/api/admin/event-carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, altText: 'Event Image' }),
            });

            if (response.ok) {
                fetchImages();
                onUpdate();
            } else {
                alert('Fehler beim Hinzufügen');
            }
        } catch (error) {
            console.error('Error adding image:', error);
            alert('Fehler beim Hinzufügen');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl relative flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-taupe-light">
                    <h2 className="text-2xl font-serif text-graphite-dark">
                        Carousel Bilder verwalten
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-graphite hover:text-wine transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Add New */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-taupe-light">
                        <h3 className="font-medium text-graphite mb-3">Neues Bild hinzufügen</h3>
                        <ImageUploader
                            onUploadComplete={handleUpload}
                            allowMultiple={false}
                            maxSizeMB={5}
                        />
                    </div>

                    <div className="border-t border-taupe-light my-4"></div>

                    {/* List */}
                    <h3 className="font-medium text-graphite">Aktuelle Bilder</h3>

                    {loading ? (
                        <div className="py-8 text-center text-graphite/60">Laden...</div>
                    ) : images.length === 0 ? (
                        <div className="py-8 text-center text-graphite/60 italic">Keine Bilder vorhanden</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-taupe-light">
                                    <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />

                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        title="Löschen"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-taupe-light bg-gray-50 rounded-b-lg">
                    <Button onClick={onClose}>Schließen</Button>
                </div>
            </div>
        </div>
    );
}
