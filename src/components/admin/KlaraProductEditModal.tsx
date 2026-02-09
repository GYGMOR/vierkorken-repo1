'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

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
  customData?: {
    grapes?: string;
    barrel?: string;
    nose?: string;
    food?: string;
    temp?: string;
    alcohol?: string;

    sweetness?: number;
    acidity?: number;
    tannins?: number;
    body?: number;
    fruitiness?: number;
    newItemUntil?: string;
    discountPercentage?: number;
  };
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

  // New Attributes
  const [grapes, setGrapes] = useState('');
  const [barrel, setBarrel] = useState('');
  const [nose, setNose] = useState('');
  const [food, setFood] = useState('');
  const [temp, setTemp] = useState('');
  const [alcohol, setAlcohol] = useState('');


  // Taste Profile
  const [sweetness, setSweetness] = useState(3);
  const [acidity, setAcidity] = useState(3);
  const [tannins, setTannins] = useState(3);
  const [body, setBody] = useState(3);
  const [fruitiness, setFruitiness] = useState(3);
  const [newItemUntil, setNewItemUntil] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

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

        const cd = override.customData || {};
        setGrapes(cd.grapes || '');
        setBarrel(cd.barrel || '');
        setNose(cd.nose || '');
        setFood(cd.food || '');
        setTemp(cd.temp || '');
        setAlcohol(cd.alcohol || '');


        setSweetness(cd.sweetness || 3);
        setAcidity(cd.acidity || 3);
        setTannins(cd.tannins || 3);
        setBody(cd.body || 3);
        setFruitiness(cd.fruitiness || 3);
        setNewItemUntil(cd.newItemUntil || null);
        setDiscountPercentage(cd.discountPercentage || 0);
      } else {
        // No override exists, use original values
        setCustomName(article.name);
        setCustomDescription(article.description);
        setCustomPrice(article.price.toString());
        setCustomImages([]);
        setGrapes(''); setNose(''); setFood(''); setTemp(''); setAlcohol(''); setBarrel('');
        setSweetness(3); setAcidity(3); setTannins(3); setBody(3); setFruitiness(3);
        setNewItemUntil(null);
        setDiscountPercentage(0);
      }
    } catch (error) {
      console.error('Error loading override:', error);
      // Use original values on error
      setCustomName(article.name);
      setCustomDescription(article.description);
      setCustomPrice(article.price.toString());
      setCustomImages([]);
      setGrapes(''); setNose(''); setFood(''); setTemp(''); setAlcohol(''); setBarrel('');
      setSweetness(3); setAcidity(3); setTannins(3); setBody(3); setFruitiness(3);
      setNewItemUntil(null);
      setDiscountPercentage(0);
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
          customData: {
            grapes,
            nose,
            food,
            temp,
            alcohol,
            barrel,
            sweetness,
            acidity,
            tannins,
            body,
            fruitiness,
            newItemUntil,
            discountPercentage
          }
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

              {/* Discount Dropdown */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Rabatt (%)
                </label>
                <div className="flex gap-4 items-center">
                  <select
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                  >
                    <option value={0}>Kein Rabatt</option>
                    {[10, 20, 25, 30, 40, 50, 60, 75].map((percent) => (
                      <option key={percent} value={percent}>
                        {percent}%
                      </option>
                    ))}
                  </select>
                  {discountPercentage > 0 && customPrice && (
                    <div className="text-sm text-graphite-dark whitespace-nowrap">
                      Neu: <span className="font-bold text-red-600">CHF {((Number(customPrice) * (100 - discountPercentage)) / 100).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* New Item Checkbox */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="newItem"
                  checked={!!newItemUntil && new Date(newItemUntil) > new Date()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Set to 7 days from now
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      setNewItemUntil(date.toISOString());
                    } else {
                      setNewItemUntil(null);
                    }
                  }}
                  className="w-5 h-5 text-accent-burgundy rounded border-gray-300 focus:ring-accent-burgundy"
                />
                <label htmlFor="newItem" className="text-sm font-medium text-graphite cursor-pointer">
                  Als "Neuheit" markieren (Bleibt für 7 Tage aktiv)
                </label>
              </div>

              {/* Attributes Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-medium text-graphite-dark">Eigenschaften (mit Icons)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">🍇 Traubensorten</label>
                    <input type="text" value={grapes} onChange={e => setGrapes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="z.B. Glera, Rondinella" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">🛢️ Fass / Ausbau</label>
                    <input type="text" value={barrel} onChange={e => setBarrel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="z.B. Eichenfass" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">👃 Aroma</label>
                    <input type="text" value={nose} onChange={e => setNose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="z.B. Himbeere, Erdbeere" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">🍴 Passend zu</label>
                    <input type="text" value={food} onChange={e => setFood(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="z.B. Sushi, Pasta" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">🌡️ Temperatur</label>
                    <input type="text" value={temp} onChange={e => setTemp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="z.B. Kühlschranktemperatur" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">🍷 Volumen / Alkohol</label>
                    <input type="text" value={alcohol} onChange={e => setAlcohol(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="z.B. 11 % Vol." />
                  </div>

                </div>
              </div>

              {/* Taste Profile Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-medium text-graphite-dark">Geschmacksprofil (1-5)</h3>

                <div className="space-y-4">
                  {/* Sweetness */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-graphite">Süße</label>
                      <span className="text-sm text-graphite">{sweetness}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={sweetness}
                      onChange={(e) => setSweetness(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-burgundy"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Trocken</span>
                      <span>Süß</span>
                    </div>
                  </div>

                  {/* Acidity */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-graphite">Säure</label>
                      <span className="text-sm text-graphite">{acidity}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={acidity}
                      onChange={(e) => setAcidity(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-burgundy"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Reduziert</span>
                      <span>Präsent</span>
                    </div>
                  </div>

                  {/* Tannins */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-graphite">Tannine</label>
                      <span className="text-sm text-graphite">{tannins}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={tannins}
                      onChange={(e) => setTannins(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-burgundy"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Samtig</span>
                      <span>Kräftig</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-graphite">Körper</label>
                      <span className="text-sm text-graphite">{body}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={body}
                      onChange={(e) => setBody(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-burgundy"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Leicht</span>
                      <span>Vollmundig</span>
                    </div>
                  </div>

                  {/* Fruitiness */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-graphite">Fruchtigkeit</label>
                      <span className="text-sm text-graphite">{fruitiness}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={fruitiness}
                      onChange={(e) => setFruitiness(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-burgundy"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Dezent</span>
                      <span>Fruchtig</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description with RTE */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Beschreibung
                </label>
                <RichTextEditor
                  content={customDescription}
                  onChange={setCustomDescription}
                />
                <p className="text-xs text-gray-400 mt-1">Bilder können per Drag & Drop eingefügt werden.</p>
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
