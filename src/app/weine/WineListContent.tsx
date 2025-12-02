'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { WineCard } from '@/components/wine/WineCard';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

interface KlaraProduct {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  stock: number;
  images?: string[];
  hasOverride?: boolean;
}

interface KlaraCategory {
  id: string;
  nameDE: string;
  nameEN?: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export default function WineListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [wines, setWines] = useState<KlaraProduct[]>([]);
  const [categories, setCategories] = useState<KlaraCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const winesPerPage = 12;

  // Check if category is passed via URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Fetch wines and categories from KLARA API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch both wines and categories in parallel
        // onlyActive=true filters out hidden products
        // Articles API automatically merges DB overrides
        const [winesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/klara/articles?onlyActive=true'),
          fetch('/api/klara/categories'),
        ]);

        if (!winesResponse.ok || !categoriesResponse.ok) {
          const winesError = !winesResponse.ok ? await winesResponse.text() : null;
          const categoriesError = !categoriesResponse.ok ? await categoriesResponse.text() : null;
          console.error('KLARA API Errors:', {
            winesStatus: winesResponse.status,
            winesError,
            categoriesStatus: categoriesResponse.status,
            categoriesError
          });
          throw new Error(`Failed to fetch data from KLARA: Wines(${winesResponse.status}), Categories(${categoriesResponse.status})`);
        }

        const winesResult = await winesResponse.json();
        const categoriesResult = await categoriesResponse.json();

        if (winesResult.success) {
          setWines(winesResult.data);
          console.log(`✅ Loaded ${winesResult.data.length} wines from KLARA`);
        }

        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
          console.log(`✅ Loaded ${categoriesResult.data.length} categories from KLARA`);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort wines
  const filteredWines = wines
    .filter((wine) => {
      // Category filter
      if (selectedCategory && !wine.categories.includes(selectedCategory)) {
        return false;
      }

      // Price filter
      if (wine.price < priceRange[0] || wine.price > priceRange[1]) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  // Pagination
  const indexOfLastWine = currentPage * winesPerPage;
  const indexOfFirstWine = indexOfLastWine - winesPerPage;
  const currentWines = filteredWines.slice(indexOfFirstWine, indexOfLastWine);
  const totalPages = Math.ceil(filteredWines.length / winesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 1000]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />

      {/* Header mit Hintergrundbild */}
      <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite border-b border-taupe-light overflow-hidden">
        {/* Hintergrundbild - transparent */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/layout/weinsortiment.jpg"
            alt="Weinsortiment Hintergrund"
            fill
            className="object-cover opacity-15"
            quality={90}
            priority
          />
        </div>

        {/* Content - über dem Bild */}
        <div className="container-custom py-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="text-graphite hover:text-graphite-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light text-graphite-dark">
              Unsere Weine
            </h1>
          </div>
          <p className="text-sm md:text-base text-graphite max-w-2xl">
            Entdecken Sie unsere Auswahl - direkt aus dem KLARA System
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-6 md:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full mb-4 px-4 py-3 bg-warmwhite border border-taupe-light rounded-lg flex items-center justify-between hover:bg-taupe-light transition-colors"
            >
              <span className="font-semibold text-graphite-dark">Filter & Sortierung</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filters Container */}
            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Categories */}
              <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
                <h3 className="font-semibold text-graphite-dark mb-3">Kategorien</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === ''
                        ? 'bg-accent-burgundy text-warmwhite'
                        : 'hover:bg-taupe-light text-graphite'
                    }`}
                  >
                    Alle Weine ({wines.length})
                  </button>
                  {categories.map((category) => {
                    const count = wines.filter((w) => w.categories.includes(category.id)).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-accent-burgundy text-warmwhite'
                            : 'hover:bg-taupe-light text-graphite'
                        }`}
                      >
                        {category.nameDE} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
                <h3 className="font-semibold text-graphite-dark mb-3">Preis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-graphite">
                    <span>CHF {priceRange[0]}</span>
                    <span>CHF {priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange([0, parseInt(e.target.value)])}
                    className="w-full accent-accent-burgundy"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {[50, 100, 200, 500].map((max) => (
                      <button
                        key={max}
                        onClick={() => handlePriceChange([0, max])}
                        className="text-xs px-2 py-1 border border-taupe-light rounded hover:bg-taupe-light transition-colors"
                      >
                        bis CHF {max}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 border border-accent-burgundy text-accent-burgundy rounded-lg hover:bg-accent-burgundy hover:text-warmwhite transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          </aside>

          {/* Right Content - Products */}
          <div className="flex-1">
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
                <p className="ml-4 text-graphite">Lade Weine von KLARA...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                <p className="font-semibold">Fehler:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Header with count and sort */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <p className="text-sm text-graphite">
                    {filteredWines.length} Weine gefunden
                  </p>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-graphite">Sortieren:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-2 border border-taupe-light rounded-lg bg-warmwhite text-graphite focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Preis aufsteigend</option>
                      <option value="price-desc">Preis absteigend</option>
                    </select>
                  </div>
                </div>

                {/* Wine Grid */}
                {currentWines.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-graphite text-lg">Keine Weine gefunden mit diesen Filtern.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 text-accent-burgundy hover:underline"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {currentWines.map((wine: any) => (
                        <WineCard
                          key={wine.id}
                          id={wine.id}
                          slug={wine.articleNumber}
                          name={wine.name}
                          winery={wine.winery || wine.articleNumber}
                          region={wine.region || ''}
                          country={wine.country || ''}
                          vintage={wine.vintage || undefined}
                          wineType={wine.wineType || 'Wein'}
                          price={wine.price}
                          imageUrl={wine.images && wine.images.length > 0 ? wine.images[0] : ""}
                          isFeatured={false}
                          isBio={false}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-warmwhite border border-taupe-light rounded-lg hover:bg-taupe-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ←
                        </button>
                        <span className="px-4 py-2 text-graphite">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-warmwhite border border-taupe-light rounded-lg hover:bg-taupe-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
