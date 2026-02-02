'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  wine: {
    id: string;
    name: string;
    winery: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Stats {
  averageRating: number;
  totalReviews: number;
  distribution: Array<{ rating: number; count: number }>;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wines, setWines] = useState<Array<{ id: string; name: string; winery: string }>>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWines();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [selectedWine, statusFilter, ratingFilter, sortBy, sortOrder]);

  const fetchWines = async () => {
    try {
      const res = await fetch('/api/admin/wines?limit=1000');
      const data = await res.json();
      if (data.success) {
        setWines(data.data);
      }
    } catch (error) {
      console.error('Error fetching wines:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedWine) params.append('wineId', selectedWine);
      if (statusFilter) params.append('isApproved', statusFilter);
      if (ratingFilter) params.append('minRating', ratingFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', '100');

      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();

      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Review wirklich löschen?')) return;

    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (error) {
      console.error('Error:', error);
      alert('Fehler beim Löschen der Review');
    }
  };

  const toggleReviewSelection = (id: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map(r => r.id)));
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            Reviews verwalten
          </h1>
          <p className="mt-2 text-graphite">
            Alle Bewertungen ansehen und unangemessene Inhalte löschen
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-serif font-light text-graphite-dark">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-graphite mt-1">Durchschnitt</p>
                  <div className="flex justify-center mt-2">
                    {getRatingStars(Math.round(stats.averageRating))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-serif font-light text-graphite-dark">
                    {stats.totalReviews}
                  </p>
                  <p className="text-sm text-graphite mt-1">Gesamt Reviews</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <p className="text-sm text-graphite mb-3">Bewertungsverteilung</p>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const dist = stats.distribution.find(d => d.rating === rating);
                    const count = dist?.count || 0;
                    const percentage = stats.totalReviews > 0
                      ? (count / stats.totalReviews) * 100
                      : 0;

                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-12">{rating} ★</span>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-graphite w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Wine Filter */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Wein filtern
                </label>
                <select
                  value={selectedWine}
                  onChange={(e) => setSelectedWine(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                >
                  <option value="">Alle Weine</option>
                  {wines.map(wine => (
                    <option key={wine.id} value={wine.id}>
                      {wine.name} ({wine.winery})
                    </option>
                  ))}
                </select>
              </div>


              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Mindestbewertung
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                >
                  <option value="">Alle Bewertungen</option>
                  <option value="5">5 Sterne</option>
                  <option value="4">4+ Sterne</option>
                  <option value="3">3+ Sterne</option>
                  <option value="2">2+ Sterne</option>
                  <option value="1">1+ Sterne</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Sortieren nach
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                >
                  <option value="createdAt">Datum</option>
                  <option value="rating">Bewertung</option>
                  <option value="wineName">Wein (alphabetisch)</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Reihenfolge
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                >
                  <option value="desc">Absteigend</option>
                  <option value="asc">Aufsteigend</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedReviews.size > 0 && (
              <div className="mt-4 pt-4 border-t border-taupe-light flex items-center justify-between">
                <p className="text-sm text-graphite">
                  {selectedReviews.size} Review(s) ausgewählt
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      if (!confirm(`${selectedReviews.size} Review(s) wirklich löschen?`)) return;

                      try {
                        await Promise.all(
                          Array.from(selectedReviews).map(id =>
                            fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
                          )
                        );
                        setSelectedReviews(new Set());
                        fetchReviews();
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Ausgewählte löschen
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedReviews(new Set())}
                  >
                    Auswahl aufheben
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reviews ({reviews.length})</CardTitle>
              {reviews.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleAllSelection}
                >
                  {selectedReviews.size === reviews.length
                    ? 'Alle abwählen'
                    : 'Alle auswählen'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-graphite/60">
                Keine Reviews gefunden
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedReviews.has(review.id)
                        ? 'border-accent-burgundy bg-accent-burgundy/5'
                        : 'border-taupe-light'
                    }`}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedReviews.has(review.id)}
                        onChange={() => toggleReviewSelection(review.id)}
                        className="mt-1"
                      />

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-graphite-dark">
                                {review.wine.name}
                              </span>
                              <span className="text-sm text-graphite">
                                {review.wine.winery}
                              </span>
                            </div>
                            <div className="mb-2">{getRatingStars(review.rating)}</div>
                          </div>
                        </div>

                        <p className="text-sm text-graphite/60 mb-2">
                          Von: {review.user.firstName} {review.user.lastName} ({review.user.email})
                        </p>

                        {review.title && (
                          <p className="font-medium text-graphite-dark mb-1">
                            {review.title}
                          </p>
                        )}

                        {review.comment && (
                          <p className="text-graphite">{review.comment}</p>
                        )}

                        <p className="text-xs text-graphite/60 mt-2">
                          {new Date(review.createdAt).toLocaleDateString('de-CH', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => deleteReview(review.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Löschen
                        </Button>
                      </div>
                    </div>

                    {/* Mobile/Tablet Layout */}
                    <div className="md:hidden space-y-3">
                      {/* Header: Wine Name & Checkbox */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedReviews.has(review.id)}
                          onChange={() => toggleReviewSelection(review.id)}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-graphite-dark block">
                            {review.wine.name}
                          </span>
                          <span className="text-sm text-graphite block mt-1">
                            {review.wine.winery}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div>{getRatingStars(review.rating)}</div>

                      {/* User Info */}
                      <p className="text-sm text-graphite/60">
                        Von: {review.user.firstName} {review.user.lastName}
                      </p>

                      {/* Title & Comment */}
                      {review.title && (
                        <p className="font-medium text-graphite-dark">
                          {review.title}
                        </p>
                      )}

                      {review.comment && (
                        <p className="text-sm text-graphite">{review.comment}</p>
                      )}

                      {/* Date & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-xs text-graphite/60">
                          {new Date(review.createdAt).toLocaleDateString('de-CH', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => deleteReview(review.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Löschen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
