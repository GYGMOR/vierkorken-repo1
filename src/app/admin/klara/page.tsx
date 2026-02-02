'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KlaraProductEditModal } from '@/components/admin/KlaraProductEditModal';

interface KlaraArticle {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  stock: number;
  isActive?: boolean; // Sichtbarkeit im Shop
}

interface KlaraCategory {
  id: string;
  nameDE: string;
}

export default function AdminKlaraImport() {
  const [articles, setArticles] = useState<KlaraArticle[]>([]);
  const [categories, setCategories] = useState<KlaraCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [editingArticle, setEditingArticle] = useState<KlaraArticle | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories with timeout
      const catController = new AbortController();
      const catTimeout = setTimeout(() => catController.abort(), 30000);

      const catRes = await fetch('/api/klara/categories', {
        signal: catController.signal,
      });
      clearTimeout(catTimeout);

      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.data);
      } else {
        console.error('Categories error:', catData);
      }

      // Fetch all articles with timeout
      const artController = new AbortController();
      const artTimeout = setTimeout(() => artController.abort(), 30000);

      const artRes = await fetch('/api/klara/articles?limit=1000', {
        signal: artController.signal,
      });
      clearTimeout(artTimeout);

      const artData = await artRes.json();
      if (artData.success) {
        setArticles(artData.data);
      } else {
        console.error('Articles error:', artData);
        alert('Fehler beim Laden der Artikel: ' + (artData.error || 'Unbekannter Fehler'));
      }
    } catch (error: any) {
      console.error('Error fetching KLARA data:', error);
      if (error.name === 'AbortError') {
        alert('Timeout beim Laden der KLARA Daten. Die API antwortet nicht.');
      } else {
        alert('Fehler beim Laden der KLARA Daten: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setClearingCache(true);

      const res = await fetch('/api/admin/klara/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Cache geleert! Die nächste Anfrage holt frische Daten von KLARA.');
        // Neu laden um frische Daten zu zeigen
        await fetchData();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      alert(`Fehler: ${error.message}`);
    } finally {
      setClearingCache(false);
    }
  };

  const toggleArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const toggleAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(filteredArticles.map(a => a.id)));
    }
  };

  const openEditModal = (article: KlaraArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(article);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingArticle(null);
    setShowEditModal(false);
  };

  const toggleProductVisibility = async (articleId: string, currentActive: boolean) => {
    try {
      const newActiveState = !currentActive;

      // Update visibility via API
      const res = await fetch(`/api/admin/klara/override/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: newActiveState,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setArticles(articles.map(article =>
          article.id === articleId
            ? { ...article, isActive: newActiveState }
            : article
        ));
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error toggling visibility:', error);
      alert(`Fehler: ${error.message}`);
    }
  };

  const toggleAllProductsVisibility = async () => {
    try {
      // Prüfe ob alle aktiv sind
      const allActive = filteredArticles.every(article => article.isActive !== false);
      const newActiveState = !allActive;

      if (!confirm(`Möchten Sie alle ${filteredArticles.length} Produkte ${newActiveState ? 'aktivieren' : 'deaktivieren'}?`)) {
        return;
      }

      // Update alle Produkte
      const promises = filteredArticles.map(article =>
        fetch(`/api/admin/klara/override/${article.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isActive: newActiveState,
          }),
        })
      );

      await Promise.all(promises);

      // Update local state
      setArticles(articles.map(article => ({
        ...article,
        isActive: newActiveState,
      })));

      alert(`Alle Produkte wurden ${newActiveState ? 'aktiviert' : 'deaktiviert'}!`);
    } catch (error: any) {
      console.error('Error toggling all:', error);
      alert(`Fehler: ${error.message}`);
    }
  };

  const importSelected = async () => {
    if (selectedArticles.size === 0) {
      alert('Bitte wählen Sie mindestens einen Artikel aus.');
      return;
    }

    if (!confirm(`${selectedArticles.size} Artikel importieren?`)) {
      return;
    }

    try {
      setImporting(true);

      // Get selected articles data
      const selectedList = Array.from(selectedArticles);
      const articlesToImport = selectedList
        .map(id => articles.find(a => a.id === id))
        .filter(a => a !== undefined);

      // Send to backend for bulk import
      const res = await fetch('/api/admin/klara/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: articlesToImport,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Import erfolgreich!\n\n${data.stats.created} neu erstellt\n${data.stats.updated} aktualisiert\n${data.stats.errors} Fehler`);
        setSelectedArticles(new Set());
      } else {
        alert(`Fehler beim Import: ${data.error}`);
      }

    } catch (error: any) {
      alert(`Fehler beim Import: ${error.message}`);
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    // Category filter
    if (selectedCategory && !article.categories.includes(selectedCategory)) {
      return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        article.name.toLowerCase().includes(searchLower) ||
        article.articleNumber.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-graphite-dark">
              KLARA Produkte
            </h1>
            <p className="mt-2 text-graphite">
              Alle KLARA-Produkte sind automatisch im Shop sichtbar. Klicke auf das Zahnrad-Icon um Bilder und Details anzupassen.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={clearCache} variant="secondary" disabled={clearingCache || loading}>
              {clearingCache ? 'Leere Cache...' : '🗑️ Cache leeren'}
            </Button>
            <Button onClick={fetchData} variant="secondary" disabled={loading}>
              {loading ? 'Laden...' : '🔄 Neu laden'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-graphite">KLARA Artikel im Shop</div>
              <div className="text-2xl font-bold text-graphite-dark">{articles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-graphite">Kategorien</div>
              <div className="text-2xl font-bold text-graphite-dark">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Kategorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                >
                  <option value="">Alle Kategorien ({articles.length})</option>
                  {categories.map((cat) => {
                    const count = articles.filter(a => a.categories.includes(cat.id)).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameDE} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Suche
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name oder Artikelnummer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedCategory('');
                    setSearch('');
                  }}
                  className="w-full"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>Artikel ({filteredArticles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-burgundy"></div>
                <p className="mt-4 text-graphite">Lade KLARA Artikel...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-graphite">Keine Artikel gefunden</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-center py-3 px-4 text-sm font-medium text-graphite w-20">
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              checked={filteredArticles.every(article => article.isActive !== false)}
                              onChange={toggleAllProductsVisibility}
                              className="w-5 h-5 text-accent-burgundy rounded cursor-pointer"
                              title="Alle aktivieren/deaktivieren"
                            />
                            <span className="text-xs">Alle</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-graphite w-24 sticky right-0 bg-white shadow-sm">Bearbeiten</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Artikel #</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Beschreibung</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Preis</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Lager</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Kategorien</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((article) => {
                        const isActive = article.isActive !== false;

                        return (
                          <tr
                            key={article.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${!isActive ? 'opacity-50' : ''}`}
                          >
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => toggleProductVisibility(article.id, isActive)}
                                className="w-5 h-5 text-accent-burgundy rounded cursor-pointer"
                                title={isActive ? "Im Shop sichtbar" : "Im Shop ausgeblendet"}
                              />
                            </td>
                            <td className="py-3 px-4 text-center sticky right-0 bg-white shadow-sm">
                              <button
                                onClick={(e) => openEditModal(article, e)}
                                className="p-2 hover:bg-accent-burgundy/10 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="Produkt bearbeiten"
                              >
                                <svg
                                  className="w-6 h-6 text-accent-burgundy"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </button>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">{article.articleNumber}</td>
                          <td className="py-3 px-4 font-medium">{article.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                            {article.description || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold">CHF {article.price.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              article.stock > 10 ? 'bg-green-100 text-green-800' :
                              article.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {article.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {article.categories.map(catId => {
                                const cat = categories.find(c => c.id === catId);
                                return cat ? (
                                  <span key={catId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {cat.nameDE}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredArticles.map((article) => {
                    const isActive = article.isActive !== false;

                    return (
                      <div
                        key={article.id}
                        className={`p-4 border border-gray-200 rounded-lg bg-white ${!isActive ? 'opacity-50' : ''}`}
                      >
                        {/* Header: Checkbox & Name */}
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleProductVisibility(article.id, isActive)}
                            className="mt-1 w-5 h-5 text-accent-burgundy rounded cursor-pointer flex-shrink-0"
                            title={isActive ? "Im Shop sichtbar" : "Im Shop ausgeblendet"}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-graphite-dark">{article.name}</h3>
                            <p className="text-xs font-mono text-graphite/60 mt-1">#{article.articleNumber}</p>
                          </div>
                          <button
                            onClick={(e) => openEditModal(article, e)}
                            className="p-2 hover:bg-accent-burgundy/10 rounded-lg transition-colors flex-shrink-0"
                            title="Produkt bearbeiten"
                          >
                            <svg
                              className="w-6 h-6 text-accent-burgundy"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Description */}
                        {article.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {article.description}
                          </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3 mb-3">
                          <div>
                            <span className="text-graphite/60 text-xs">Preis:</span>
                            <p className="font-semibold text-graphite-dark">CHF {article.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-graphite/60 text-xs">Lager:</span>
                            <p>
                              <span className={`px-2 py-1 rounded text-xs ${
                                article.stock > 10 ? 'bg-green-100 text-green-800' :
                                article.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {article.stock}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Categories */}
                        {article.categories.length > 0 && (
                          <div className="border-t pt-3">
                            <span className="text-graphite/60 text-xs block mb-2">Kategorien:</span>
                            <div className="flex flex-wrap gap-1">
                              {article.categories.map(catId => {
                                const cat = categories.find(c => c.id === catId);
                                return cat ? (
                                  <span key={catId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {cat.nameDE}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <KlaraProductEditModal
          article={editingArticle}
          isOpen={showEditModal}
          onClose={closeEditModal}
          onSave={fetchData}
        />
      </div>
    </AdminLayout>
  );
}
