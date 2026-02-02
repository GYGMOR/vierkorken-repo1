'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatPrice } from '@/lib/utils';

interface Wine {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  categories: string[];
}

export default function FavoritenPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vierkorken_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchWines() {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/klara/articles');
        const data = await res.json();

        if (data.success) {
          const favoriteWines = data.data.filter((w: Wine) => favorites.includes(w.id));
          setWines(favoriteWines);
        }
      } catch (error) {
        console.error('Error fetching wines:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWines();
  }, [favorites]);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(fav => fav !== id);
    setFavorites(updated);
    setWines(wines.filter(w => w.id !== id));
    localStorage.setItem('vierkorken_favorites', JSON.stringify(updated));
  };

  return (
    <MainLayout>
      <div className="section-padding bg-warmwhite">
        <div className="container-custom max-w-6xl">
          <h1 className="text-display font-serif font-light text-graphite-dark mb-8">
            Meine Favoriten
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto mb-6 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">
                Noch keine Favoriten
              </h2>
              <p className="text-graphite mb-8">
                Speichern Sie Ihre Lieblingsweine, indem Sie auf das Herz-Icon klicken.
              </p>
              <Link href="/weine" className="btn btn-primary">
                Weine entdecken
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-graphite mb-6">
                Sie haben {favorites.length} {favorites.length === 1 ? 'Favorit' : 'Favoriten'} gespeichert.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wines.map((wine) => (
                  <div key={wine.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/weine/${wine.id}`} className="block">
                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-warmwhite to-sand-light">
                        {wine.imageUrl ? (
                          <Image
                            src={wine.imageUrl}
                            alt={wine.name}
                            fill
                            className="object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-20 h-20 text-taupe" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C10.89 2 10 2.89 10 4V5H8V4C8 2.89 7.11 2 6 2C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V4C20 2.89 19.11 2 18 2C16.89 2 16 2.89 16 4V5H14V4C14 2.89 13.11 2 12 2M6 4H6.5V7H5.5V4H6M12 4H12.5V7H11.5V4H12M18 4H18.5V7H17.5V4H18Z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-serif text-lg text-graphite-dark line-clamp-2 mb-2">
                          {wine.name}
                        </h3>
                        <p className="font-serif text-xl text-accent-burgundy">
                          {formatPrice(wine.price)}
                        </p>
                      </div>
                    </Link>

                    {/* Remove Button */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => removeFavorite(wine.id)}
                        className="w-full btn btn-outline flex items-center justify-center gap-2 hover:bg-accent-burgundy hover:text-warmwhite transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Entfernen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
