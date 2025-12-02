'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface KlaraArticle {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  stock: number;
}

interface KlaraProductEditModalProps {
  article: KlaraArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface Override {
  customName?: string;
  customDescription?: string;
  customPrice?: number;
  customImages: string[];
}

export function KlaraProductEditModal({
  article,
  isOpen,
  onClose,
  onSave,
}: KlaraProductEditModalProps) {
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (article && isOpen) {
      // Reset form and load existing override
      loadOverride();
    }
  }, [article, isOpen]);

  const loadOverride = async () => {
    if (!article) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/klara/override/${article.id}`);
      const data = await res.json();

      if (data.success && data.data) {
        const override: Override = data.data;
        setCustomName(override.customName || article.name);
        setCustomDescription(override.customDescription || article.description);
        setCustomPrice(override.customPrice?.toString() || article.price.toString());
        setCustomImages(override.customImages || []);
      } else {
        // No override exists, use original values
        setCustomName(article.name);
        setCustomDescription(article.description);
        setCustomPrice(article.price.toString());
        setCustomImages([]);
      }
    } catch (error) {
      console.error('Error loading override:', error);
      // Use original values on error
      setCustomName(article.name);
      setCustomDescription(article.description);
      setCustomPrice(article.price.toString());
      setCustomImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/klara/override/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customName: customName !== article.name ? customName : null,
          customDescription: customDescription !== article.description ? customDescription : null,
          customPrice: parseFloat(customPrice) !== article.price ? parseFloat(customPrice) : null,
          customImages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Änderungen erfolgreich gespeichert!');
        onSave?.();
        onClose();
      } else {
        alert(`Fehler beim Speichern: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error saving override:', error);
      alert(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = (url: string) => {
    setCustomImages([...customImages, url]);
  };

  const handleRemoveImage = (index: number) => {
    setCustomImages(customImages.filter((_, i) => i !== index));
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-light text-graphite-dark">
              Produkt bearbeiten
            </h2>
            <p className="text-sm text-graphite mt-1">
              KLARA Artikel #{article.articleNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-graphite"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-burgundy"></div>
              <p className="mt-4 text-graphite">Lade Produktdaten...</p>
            </div>
          ) : (
            <>
              {/* Original Data Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Original KLARA Daten:</strong> {article.name} - CHF {article.price.toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Änderungen hier überschreiben die KLARA-Daten nur für die Anzeige im Shop, ohne die KLARA-Daten zu ändern.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Produktname
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                  placeholder="z.B. Chardonnay Reserve 2020"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Preis (CHF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                  placeholder="Produktbeschreibung..."
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Produktbilder
                </label>

                {/* Current Images */}
                {customImages.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {customImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Bild ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Bild entfernen"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Uploader */}
                <ImageUploader
                  onUploadComplete={handleAddImage}
                  allowMultiple={false}
                  maxSizeMB={10}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Speichere...' : 'Änderungen speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
}
