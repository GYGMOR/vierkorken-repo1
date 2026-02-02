'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Wine {
  id: string;
  name: string;
  slug: string;
  winery: string;
  region: string;
  country: string;
  wineType: string;
  vintage: number | null;
  isActive: boolean;
  isFeatured: boolean;
  klaraId: string | null;
  createdAt: string;
  variants: any[];
  images: any[];
  _count: {
    variants: number;
    reviews: number;
  };
}

export default function AdminWines() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wineType, setWineType] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWines();
  }, [page, search, wineType, isActiveFilter]);

  const fetchWines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (wineType) params.append('wineType', wineType);
      if (isActiveFilter) params.append('isActive', isActiveFilter);

      const res = await fetch(`/api/admin/wines?${params}`);
      const data = await res.json();

      if (data.success) {
        setWines(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching wines:', error);
    } finally {
      setLoading(false);
    }
  };


  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/wines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchWines();
      }
    } catch (error) {
      console.error('Error toggling wine status:', error);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/wines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (res.ok) {
        fetchWines();
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const deleteWine = async (id: string, name: string) => {
    if (!confirm(`Möchten Sie "${name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/wines/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Wein erfolgreich gelöscht');
        fetchWines();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting wine:', error);
      alert(`Fehler beim Löschen: ${error.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-graphite-dark">
              Weine verwalten
            </h1>
            <p className="mt-2 text-graphite">
              Weine erstellen, bearbeiten und synchronisieren
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/klara">
              <Button variant="secondary">
                🔄 KLARA Import
              </Button>
            </Link>
            <Link href="/admin/wines/new">
              <Button>+ Neuer Wein</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Suche
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Name, Weingut, Region..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Weintyp
                </label>
                <select
                  value={wineType}
                  onChange={(e) => {
                    setWineType(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent"
                >
                  <option value="">Alle</option>
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
                  Status
                </label>
                <select
                  value={isActiveFilter}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent"
                >
                  <option value="">Alle</option>
                  <option value="true">Aktiv</option>
                  <option value="false">Inaktiv</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setWineType('');
                    setIsActiveFilter('');
                    setPage(1);
                  }}
                  className="w-full"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wines Table */}
        <Card>
          <CardHeader>
            <CardTitle>Weine ({wines.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-burgundy"></div>
                <p className="mt-4 text-graphite">Laden...</p>
              </div>
            ) : wines.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-graphite/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <h3 className="text-lg font-semibold text-graphite-dark mb-2">
                  Keine Weine gefunden
                </h3>
                <p className="text-graphite mb-6">
                  Importieren Sie Produkte von KLARA oder erstellen Sie manuell einen neuen Wein.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Bild</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Weingut</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Typ</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Varianten</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-graphite">KLARA</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-graphite">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wines.map((wine) => (
                        <tr key={wine.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {wine.images[0] ? (
                              <img
                                src={wine.images[0].url}
                                alt={wine.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-graphite-dark">{wine.name}</p>
                              {wine.vintage && (
                                <p className="text-sm text-graphite">{wine.vintage}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-graphite">
                            {wine.winery}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-burgundy/10 text-accent-burgundy">
                              {wine.wineType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-graphite">
                            {wine._count.variants} Variante{wine._count.variants !== 1 ? 'n' : ''}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => toggleActive(wine.id, wine.isActive)}
                                className={`text-xs px-2 py-1 rounded ${
                                  wine.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {wine.isActive ? '✓ Aktiv' : '✗ Inaktiv'}
                              </button>
                              <button
                                onClick={() => toggleFeatured(wine.id, wine.isFeatured)}
                                className={`text-xs px-2 py-1 rounded ${
                                  wine.isFeatured
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {wine.isFeatured ? '⭐ Featured' : '☆'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {wine.klaraId ? (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                KLARA
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/wines/${wine.id}`}>
                                <Button size="sm" variant="secondary">
                                  Bearbeiten
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => deleteWine(wine.id, wine.name)}
                                className="text-red-600 hover:bg-red-50"
                              >
                              Löschen
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden space-y-4">
                {wines.map((wine) => (
                  <div
                    key={wine.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    {/* Header: Image & Name */}
                    <div className="flex items-start gap-4 mb-3">
                      {wine.images[0] ? (
                        <img
                          src={wine.images[0].url}
                          alt={wine.name}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-graphite-dark truncate">{wine.name}</p>
                        {wine.vintage && (
                          <p className="text-sm text-graphite">{wine.vintage}</p>
                        )}
                        <p className="text-sm text-graphite/70">{wine.winery}</p>
                      </div>
                    </div>

                    {/* Wine Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3 mb-3">
                      <div>
                        <span className="text-graphite/60 text-xs">Typ:</span>
                        <p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-burgundy/10 text-accent-burgundy">
                            {wine.wineType}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-graphite/60 text-xs">Varianten:</span>
                        <p className="font-medium text-graphite">
                          {wine._count.variants} Variante{wine._count.variants !== 1 ? 'n' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => toggleActive(wine.id, wine.isActive)}
                        className={`text-xs px-2 py-1 rounded flex-1 ${
                          wine.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {wine.isActive ? '✓ Aktiv' : '✗ Inaktiv'}
                      </button>
                      <button
                        onClick={() => toggleFeatured(wine.id, wine.isFeatured)}
                        className={`text-xs px-2 py-1 rounded flex-1 ${
                          wine.isFeatured
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {wine.isFeatured ? '⭐ Featured' : '☆ Featured'}
                      </button>
                      {wine.klaraId && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          KLARA
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Link href={`/admin/wines/${wine.id}`} className="flex-1">
                        <Button size="sm" variant="secondary" className="w-full">
                          Bearbeiten
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => deleteWine(wine.id, wine.name)}
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Zurück
                </Button>
                <span className="text-sm text-graphite">
                  Seite {page} von {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Weiter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
