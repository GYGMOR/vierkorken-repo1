'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminWineEdit({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wine, setWine] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [images, setImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [wineId, setWineId] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setWineId(p.id);
      if (p.id !== 'new') {
        fetchWine(p.id);
      } else {
        setLoading(false);
        setFormData({
          wineType: 'RED',
          country: 'CH',
          isActive: true,
          isFeatured: false,
          isBio: false,
          isDemeter: false,
          isVegan: false,
        });
      }
    });
  }, [params]);

  const fetchWine = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/wines/${id}`);
      const data = await res.json();
      if (data.success) {
        setWine(data.data);
        setFormData(data.data);
        setImages(data.data.images || []);
        setVariants(data.data.variants || []);
      }
    } catch (error) {
      console.error('Error fetching wine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = wineId === 'new' ? '/api/admin/wines' : `/api/admin/wines/${wineId}`;
      const method = wineId === 'new' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('Wein erfolgreich gespeichert!');
        if (wineId === 'new') {
          router.push(`/admin/wines/${data.data.id}`);
        } else {
          fetchWine(wineId);
        }
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Fehler: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    if (!newImageUrl || wineId === 'new') return;

    try {
      const res = await fetch(`/api/admin/wines/${wineId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newImageUrl }),
      });

      if (res.ok) {
        setNewImageUrl('');
        fetchWine(wineId);
      }
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Bild löschen?')) return;

    try {
      await fetch(`/api/admin/wines/${wineId}/images/${imageId}`, {
        method: 'DELETE',
      });
      fetchWine(wineId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            {wineId === 'new' ? 'Neuer Wein' : 'Wein bearbeiten'}
          </h1>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Weingut *
                </label>
                <input
                  type="text"
                  required
                  value={formData.winery || ''}
                  onChange={(e) => setFormData({ ...formData, winery: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Weintyp *
                </label>
                <select
                  required
                  value={formData.wineType || 'RED'}
                  onChange={(e) => setFormData({ ...formData, wineType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                >
                  <option value="RED">Rotwein</option>
                  <option value="WHITE">Weisswein</option>
                  <option value="ROSE">Rosé</option>
                  <option value="SPARKLING">Schaumwein</option>
                  <option value="DESSERT">Dessertwein</option>
                  <option value="FORTIFIED">Likörwein</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Jahrgang
                </label>
                <input
                  type="number"
                  value={formData.vintage || ''}
                  onChange={(e) => setFormData({ ...formData, vintage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  required
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Land *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country || 'CH'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Beschreibung
              </label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-accent-burgundy"
                />
                <span className="text-sm text-graphite">Aktiv</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-accent-burgundy"
                />
                <span className="text-sm text-graphite">Featured</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isBio || false}
                  onChange={(e) => setFormData({ ...formData, isBio: e.target.checked })}
                  className="w-4 h-4 text-accent-burgundy"
                />
                <span className="text-sm text-graphite">Bio</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVegan || false}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                  className="w-4 h-4 text-accent-burgundy"
                />
                <span className="text-sm text-graphite">Vegan</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        {wineId !== 'new' && (
          <Card>
            <CardHeader>
              <CardTitle>Bilder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => deleteImage(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Bild URL einfügen..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
                <Button type="button" onClick={addImage} disabled={!newImageUrl}>
                  + Bild hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Variants */}
        {wineId !== 'new' && (
          <Card>
            <CardHeader>
              <CardTitle>Varianten ({variants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Noch keine Varianten vorhanden.
                  <br />
                  <span className="text-sm">Erstellen Sie eine Variante, um diesen Wein verkaufen zu können.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{variant.bottleSize}L</span>
                          {variant.vintage && <span className="text-sm text-gray-600">{variant.vintage}</span>}
                          <span className="font-semibold text-accent-burgundy">CHF {variant.price}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            variant.stockQuantity > 10 ? 'bg-green-100 text-green-800' :
                            variant.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Lager: {variant.stockQuantity}
                          </span>
                          {variant.isAvailable ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verfügbar</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Nicht verfügbar</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          SKU: {variant.sku}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </AdminLayout>
  );
}
