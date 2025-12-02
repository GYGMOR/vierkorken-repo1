'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

interface KlaraCategory {
  id: string;
  nameDE: string;
  nameEN?: string;
  count?: number;
}

export default function HomePage() {
  const [categories, setCategories] = useState<KlaraCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and count products
  useEffect(() => {
    async function fetchCategoriesWithCounts() {
      try {
        const [categoriesRes, articlesRes] = await Promise.all([
          fetch('/api/klara/categories'),
          fetch('/api/klara/articles'),
        ]);

        if (categoriesRes.ok && articlesRes.ok) {
          const categoriesData = await categoriesRes.json();
          const articlesData = await articlesRes.json();

          if (categoriesData.success && articlesData.success) {
            const cats = categoriesData.data;
            const articles = articlesData.data;

            // Count products per category
            const categoriesWithCounts = cats.map((cat: KlaraCategory) => ({
              ...cat,
              count: articles.filter((article: any) =>
                article.categories.includes(cat.id)
              ).length,
            }));

            setCategories(categoriesWithCounts);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoriesWithCounts();
  }, []);

  return (
    <MainLayout>

      {/* Hero Section */}
      <section className="section-padding relative overflow-hidden min-h-[500px] flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 25%' }}
        >
          <source src="/images/layout/Weinshop_Werbevideo_für_Homepage.mp4" type="video/mp4" />
        </video>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-warmwhite/70 via-rose-light/60 to-warmwhite/70"></div>

        {/* Content */}
        <div className="container-custom relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center space-y-4 mt-48">
            <h1 className="text-display font-serif font-light text-graphite-dark">
              Eine digitale Weinwelt,
              <br />
              die verbindet.
            </h1>
            <p className="text-body-lg text-graphite max-w-2xl mx-auto">
              Entdecken Sie exquisite Weine, erleben Sie Weinkompetenz und werden Sie Teil einer stilvollen Genuss-Community.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/weine" className="btn btn-primary">
                Weine entdecken
              </Link>
              <Link href="/club" className="btn btn-secondary">
                Loyalty Club
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              href="/weine"
              icon={<WineGlassIcon />}
              title="Kuratierte Auswahl"
              description="Handverlesene Weine von ausgewählten Weingütern aus aller Welt."
            />
            <FeatureCard
              href="/club"
              icon={<BadgeIcon />}
              title="Loyalty Club"
              description="Sammeln Sie Punkte, steigen Sie auf und genießen Sie exklusive Vorteile."
            />
            <FeatureCard
              href="/events"
              icon={<CalendarIcon />}
              title="Exklusive Events"
              description="Teilnahme an Verkostungen, Masterclasses und Weingut-Besuchen."
            />
          </div>
        </div>
      </section>

      {/* Wine Types */}
      <section className="section-padding bg-warmwhite-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-serif font-light mb-4">Entdecken Sie unsere Weine</h2>
            <p className="text-body-lg text-graphite">Vom eleganten Weißwein bis zum kraftvollen Rotwein.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
            </div>
          ) : (
            <>
              {/* Main 4 Wine Types */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {getMainWineCategories(categories).map((category) => (
                  <WineTypeCard
                    key={category.id}
                    categoryId={category.id}
                    type={category.nameDE}
                    count={category.count || 0}
                    color={getColorForWineType(category.nameDE)}
                  />
                ))}
              </div>

              {/* Additional Popular Categories */}
              {getPopularCategories(categories).length > 0 && (
                <>
                  <div className="text-center mb-8 mt-12">
                    <h3 className="text-h3 font-serif font-light text-wine-dark">
                      Weitere beliebte Kategorien
                    </h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getPopularCategories(categories).map((category) => (
                      <WineTypeCard
                        key={category.id}
                        categoryId={category.id}
                        type={category.nameDE}
                        count={category.count || 0}
                        color="from-taupe-light/30 to-warmwhite"
                      />
                    ))}
                    {/* Gift Cards */}
                    <Link
                      href="/geschenkgutscheine"
                      className="card card-hover p-8 text-center bg-gradient-to-br from-accent-gold/10 to-warmwhite border-2 border-accent-gold/20 group transition-all shadow-lg"
                    >
                      <div className="flex justify-center mb-4">
                        <svg className="w-12 h-12 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <h3 className="text-h4 font-serif mb-2 text-wine-dark group-hover:text-wine transition-colors">
                        Geschenkgutscheine
                      </h3>
                      <p className="text-sm text-graphite/70 group-hover:text-wine transition-colors">
                        Perfektes Geschenk
                      </p>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Loyalty Preview */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 rounded-full border border-accent-gold/20">
              <span className="text-accent-gold font-medium text-sm">LOYALTY CLUB</span>
            </div>
            <h2 className="text-h2 font-serif font-light">Werden Sie Teil des Clubs</h2>
            <p className="text-body-lg text-graphite max-w-2xl mx-auto">
              Mit jedem Einkauf sammeln Sie Punkte, steigen in exklusive Level auf und erhalten Cashback sowie Zugang zu besonderen Weinen und Events.
            </p>
            <Link href="/club" className="btn btn-accent">
              Mehr erfahren
            </Link>
          </div>
        </div>
      </section>

    </MainLayout>
  );
}

// Helper Functions
function getMainWineCategories(categories: KlaraCategory[]): KlaraCategory[] {
  const mainTypes = ['Rotwein', 'Weisswein', 'Rosewein', 'Roséwein', 'Schaumwein'];

  const found = categories.filter((cat) =>
    mainTypes.some((type) => cat.nameDE.toLowerCase().includes(type.toLowerCase()))
  );

  // Ensure we have exactly 4 categories, prioritizing in this order
  const rotwein = found.find((c) => c.nameDE.toLowerCase().includes('rotwein'));
  const weisswein = found.find((c) => c.nameDE.toLowerCase().includes('weisswein'));
  const rosewein = found.find((c) => c.nameDE.toLowerCase().includes('rosewein') || c.nameDE.toLowerCase().includes('roséwein'));
  const schaumwein = found.find((c) => c.nameDE.toLowerCase().includes('schaumwein'));

  const result = [];
  if (rotwein) result.push(rotwein);
  if (weisswein) result.push(weisswein);
  if (rosewein) result.push(rosewein);
  if (schaumwein) result.push(schaumwein);

  return result;
}

function getPopularCategories(categories: KlaraCategory[]): KlaraCategory[] {
  const mainTypes = ['Rotwein', 'Weisswein', 'Rosewein', 'Roséwein', 'Schaumwein'];

  // Get categories that are NOT main wine types
  const otherCategories = categories.filter((cat) =>
    !mainTypes.some((type) => cat.nameDE.toLowerCase().includes(type.toLowerCase()))
  );

  // Sort by count (most popular first) and take top 4
  return otherCategories
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 4);
}

function getColorForWineType(typeName: string): string {
  const lowerType = typeName.toLowerCase();

  if (lowerType.includes('rotwein')) {
    return 'from-wine/10 to-wine/5 border border-wine/20';
  } else if (lowerType.includes('weisswein')) {
    return 'from-wood-light/50 to-wood-lightest/50 border border-wood/20';
  } else if (lowerType.includes('rosewein') || lowerType.includes('roséwein')) {
    return 'from-rose-medium/20 to-rose-light/40 border border-rose-deep/20';
  } else if (lowerType.includes('schaumwein')) {
    return 'from-accent-gold/10 to-warmwhite border border-accent-gold/20';
  }

  return 'from-taupe-light/30 to-warmwhite border border-taupe/20';
}

// Helper Components
function FeatureCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href} className="card p-8 text-center space-y-4 card-hover cursor-pointer block border-2 border-taupe-light shadow-lg group">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wood-lightest text-wine transition-colors group-hover:bg-wine group-hover:text-warmwhite">
        {icon}
      </div>
      <h3 className="text-h4 font-serif text-wine-dark">{title}</h3>
      <p className="text-graphite/80">{description}</p>
    </Link>
  );
}

function WineTypeCard({ categoryId, type, count, color }: { categoryId: string; type: string; count: number; color: string }) {
  return (
    <Link
      href={`/weine?category=${categoryId}`}
      className={`card card-hover p-8 text-center bg-gradient-to-br ${color} group transition-all border-2 border-taupe-light shadow-lg`}
    >
      <h3 className="text-h4 font-serif mb-2 text-wine-dark group-hover:text-wine transition-colors">{type}</h3>
      <p className="text-sm text-graphite/70 group-hover:text-wine transition-colors">
        {count} {count === 1 ? 'Wein' : 'Weine'}
      </p>
    </Link>
  );
}

// Icons
function WineGlassIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
