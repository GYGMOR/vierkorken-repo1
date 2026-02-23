'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { AccountCreationModal } from '@/components/newsletter/AccountCreationModal';
import { NewProductsCarousel } from '@/components/wine/NewProductsCarousel';
import { DiscountProductsCarousel } from '@/components/wine/DiscountProductsCarousel';

interface KlaraCategory {
  id: string;
  nameDE: string;
  nameEN?: string;
  count?: number;
}

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  isPinned: boolean;
}

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const SEASON_VIDEOS: Record<Season, string> = {
  winter: '/images/layout/Weinshop_Werbevideo_Winter.mp4',
  spring: '/images/layout/Weinshop_Werbevideo_Fruehling.mp4',
  summer: '/images/layout/Weinshop_Werbevideo_Sommer.mp4',
  autumn: '/images/layout/Weinshop_Werbevideo_Herbst.mp4',
};

export default function HomePage() {
  const [categories, setCategories] = useState<KlaraCategory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [currentSeason, setCurrentSeason] = useState<Season>('winter');

  // Fetch current season
  useEffect(() => {
    async function fetchSeason() {
      try {
        const res = await fetch('/api/admin/settings/season');
        const data = await res.json();
        if (data.success && data.season) {
          setCurrentSeason(data.season);
        }
      } catch (error) {
        console.error('Error fetching season:', error);
      }
    }
    fetchSeason();
  }, []);

  // Fetch categories with counts (API already returns count!)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/klara/categories');

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            // API already returns categories with count!
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Fetch latest news
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news?limit=3');
        const data = await res.json();

        if (data.success) {
          setNews(data.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setNewsLoading(false);
      }
    }

    fetchNews();
  }, []);

  // Fetch New Products and Discounted Products
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch('/api/homepage-sections');
        const data = await res.json();
        if (data.success && data.sections) {
          setSections(data.sections);
        }
      } catch (error) {
        console.error('Error fetching homepage sections:', error);
      }
    }
    fetchSections();
  }, []);

  const getSectionStyle = (identifier: string, defaultOrder: number) => {
    if (sections.length === 0) return { order: defaultOrder };
    const section = sections.find(s => s.identifier === identifier);
    if (!section) return { order: defaultOrder, display: 'none' };
    return {
      order: section.sortOrder,
      display: section.isVisible ? 'block' : 'none'
    };
  };

  useEffect(() => {
    async function fetchNewProducts() {
      try {
        const res = await fetch('/api/klara/articles?onlyActive=true');
        const data = await res.json();

        if (data.success) {
          const now = new Date();
          const newItems = data.data.filter((item: any) =>
            item.customData?.newItemUntil && new Date(item.customData.newItemUntil) > now
          );
          setNewProducts(newItems);

          const discountedItems = data.data.filter((item: any) =>
            item.customData?.discountPercentage && item.customData.discountPercentage > 0
          );
          setDiscountedProducts(discountedItems);
        }
      } catch (error) {
        console.error('Error fetching new products:', error);
      }
    }
    fetchNewProducts();
  }, []);

  return (
    <MainLayout>

      {/* Hero Section */}
      <section className="section-padding relative overflow-hidden min-h-[500px] flex items-center">
        {/* Background Video - Dynamic based on season */}
        <video
          key={currentSeason}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 25%' }}
          onEnded={(e) => {
            const video = e.currentTarget;
            video.pause();
          }}
        >
          <source src={SEASON_VIDEOS[currentSeason]} type="video/mp4" />
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
              backgroundImage="/images/layout/weinauswahl.png"
            />
            <FeatureCard
              href="/club"
              icon={<BadgeIcon />}
              title="Loyalty Club"
              description="Sammeln Sie Punkte, steigen Sie auf und genießen Sie exklusive Vorteile."
              backgroundImage="/images/layout/weingläser.jpg"
            />
            <FeatureCard
              href="/events"
              icon={<CalendarIcon />}
              title="Exklusive Events"
              description="Teilnahme an Verkostungen, Masterclasses und Weingut-Besuchen."
              backgroundImage="/images/layout/social-wein-tasting.jpg"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col w-full overflow-hidden">
        {/* News Section */}
        {!newsLoading && news.length > 0 && (
          <section className="section-padding bg-gradient-to-br from-warmwhite via-rose-light/10 to-warmwhite" style={getSectionStyle('news', 2)}>
            <div className="container-custom">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-wine/10 rounded-full border border-wine/20 mb-4">
                  <NewsIcon />
                  <span className="text-wine font-medium text-sm">AKTUELLES</span>
                </div>
                <h2 className="text-h2 font-serif font-light mb-4">News & Neuigkeiten</h2>
                <p className="text-body-lg text-graphite">Bleiben Sie informiert über neue Weine, Events und mehr.</p>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>

              {/* Mobile: Swipe Carousel */}
              <div className="md:hidden mb-8">
                <NewsCarousel news={news} />
              </div>

              <div className="text-center">
                <Link href="/news" className="btn btn-secondary">
                  Alle News anzeigen
                </Link>
              </div>

              {/* Newsletter Subscription */}
              <div className="mt-16 max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-strong p-8 border border-wine/10">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif font-light text-graphite-dark mb-2">
                      Newsletter abonnieren
                    </h3>
                    <p className="text-graphite">
                      Erhalten Sie exklusive Angebote und bleiben Sie über Neuigkeiten informiert.
                    </p>
                  </div>

                  <NewsletterSignup
                    onSuccess={(email) => {
                      setNewsletterEmail(email);
                      setShowAccountModal(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Account Creation Modal */}
        {showAccountModal && (
          <AccountCreationModal
            email={newsletterEmail}
            onClose={() => setShowAccountModal(false)}
          />
        )}

        {/* New Products Carousel */}
        {newProducts.length > 0 && (
          <section className="section-padding overflow-hidden bg-warmwhite-light border-y border-taupe-light/30" style={getSectionStyle('new-arrivals', 1)}>
            <div className="container-custom mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full border border-green-200 mb-4">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" /></svg>
                <span className="text-green-800 font-medium text-sm">NEU EINGETROFFEN</span>
              </div>
              <h2 className="text-h2 font-serif font-light mb-2">Unsere Neuheiten</h2>
              <p className="text-body-lg text-graphite">Entdecken Sie unsere neuesten Weinschätze.</p>
            </div>
            <NewProductsCarousel products={newProducts} />
          </section>
        )}

        {/* Discounted Products Carousel */}
        {discountedProducts.length > 0 && (
          <section className="section-padding overflow-hidden bg-white border-b border-taupe-light/30" style={getSectionStyle('discounted', 4)}>
            <div className="container-custom mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full border border-red-200 mb-4">
                <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" /></svg>
                <span className="text-red-800 font-medium text-sm">RABATT WEINE</span>
              </div>
              <h2 className="text-h2 font-serif font-light mb-2">Aktuelle Angebote</h2>
              <p className="text-body-lg text-graphite">Sparen Sie bei unseren ausgewählten Aktionsweinen.</p>
            </div>
            <DiscountProductsCarousel products={discountedProducts} />
          </section>
        )}

        {/* Wine Types */}
        <section className="section-padding bg-warmwhite-light" style={getSectionStyle('categories', 3)}>
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 justify-items-center max-w-6xl mx-auto">
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center max-w-6xl mx-auto">
                      {getPopularCategories(categories).map((category) => (
                        <WineTypeCard
                          key={category.id}
                          categoryId={category.id}
                          type={category.nameDE}
                          count={category.count || 0}
                          color="from-taupe-light/30 to-warmwhite"
                        />
                      ))}
                    </div>
                  </>
                )}

              </>
            )}
          </div>
        </section>

        <section className="section-padding bg-warmwhite-light" style={getSectionStyle('gift-cards', 6)}>
          <div className="container-custom">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
              </div>
            ) : (
              <>
                {/* Gift Cards Section */}
                <div className="text-center mb-8">
                  <h3 className="text-h3 font-serif font-light text-wine-dark">
                    Geschenkideen
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 justify-items-center max-w-4xl mx-auto">
                  {/* Gift Cards */}
                  <Link
                    href="/geschenkgutscheine"
                    className="card card-hover p-8 text-center bg-gradient-to-br from-accent-gold/10 to-warmwhite border-2 border-accent-gold/20 group transition-all shadow-lg w-full min-w-[250px]"
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

                  {/* Divers (Glasses etc) */}
                  <Link
                    href="/weine?category=divers"
                    className="card card-hover p-8 text-center bg-gradient-to-br from-wood-light/20 to-warmwhite border-2 border-wood/20 group transition-all shadow-lg w-full min-w-[250px]"
                  >
                    <div className="flex justify-center mb-4">
                      <svg className="w-12 h-12 text-wood-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M19 3v4M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2zm0 0V3h14v4M9 11v6m6-6v6" />
                      </svg>
                    </div>
                    <h3 className="text-h4 font-serif mb-2 text-wine-dark group-hover:text-wine transition-colors">
                      Divers
                    </h3>
                    <p className="text-sm text-graphite/70 group-hover:text-wine transition-colors">
                      Weingläser & Zubehör
                    </p>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Loyalty Preview */}
        <section className="section-padding" style={getSectionStyle('loyalty', 5)}>
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 rounded-full border border-accent-gold/20">
                <span className="text-accent-gold font-medium text-sm">LOYALTY CLUB</span>
              </div>
              <h2 className="text-h2 font-serif font-light">Werden Sie Teil des Clubs</h2>
              <p className="text-body-lg text-graphite max-w-2xl mx-auto">
                Mit jedem Einkauf sammeln Sie Punkte, steigen in exklusive Level auf und erhalten Willkommensgeschenke sowie Zugang zu besonderen Weinen und Events.
              </p>
              <Link href="/club" className="btn btn-accent">
                Mehr erfahren
              </Link>
            </div>
          </div>
        </section>
      </div>

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
function FeatureCard({
  href,
  icon,
  title,
  description,
  backgroundImage
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  backgroundImage?: string;
}) {
  return (
    <Link
      href={href}
      className="card p-8 text-center space-y-4 card-hover cursor-pointer block border-2 border-taupe-light shadow-lg group relative overflow-hidden w-full h-full"
    >
      {/* Hintergrundbild mit Verblassungseffekt */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500 ease-in-out"
            quality={90}
          />
        </div>
      )}

      {/* Content über dem Bild */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wood-lightest text-wine transition-colors group-hover:bg-wine group-hover:text-warmwhite">
          {icon}
        </div>
        <h3 className="text-h4 font-serif text-wine-dark">{title}</h3>
        <p className="text-graphite/80">{description}</p>
      </div>
    </Link>
  );
}

function WineTypeCard({ categoryId, type, count, color }: { categoryId: string; type: string; count: number; color: string }) {
  return (
    <Link
      href={`/weine?category=${categoryId}`}
      className={`card card-hover p-8 text-center bg-gradient-to-br ${color} group transition-all border-2 border-taupe-light shadow-lg w-full min-w-[250px]`}
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

function NewsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

// News Carousel Component (Mobile - Startseite)
function NewsCarousel({ news }: { news: NewsItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Auto-advance every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [news.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrevious();
    }
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden touch-pan-y">
        <div
          className="relative w-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {news.map((item) => (
              <div key={item.id} className="min-w-full px-4">
                <NewsCard news={item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {news.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
              ? 'bg-wine w-8'
              : 'bg-taupe-light w-2 hover:bg-taupe'
              }`}
            aria-label={`Gehe zu News ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      {news.length > 1 && (
        <>
          <button
            onClick={goPrevious}
            className="absolute left-2 top-1/3 -translate-y-1/2 w-10 h-10 bg-warmwhite/95 hover:bg-wine text-graphite-dark hover:text-warmwhite rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-10"
            aria-label="Vorherige News"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/3 -translate-y-1/2 w-10 h-10 bg-warmwhite/95 hover:bg-wine text-graphite-dark hover:text-warmwhite rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-10"
            aria-label="Nächste News"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Link
      href={`/news/${news.slug}`}
      className="card overflow-hidden group cursor-pointer hover:shadow-strong transition-all duration-300 border-2 border-taupe-light"
    >
      {/* Featured Image */}
      {news.featuredImage ? (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={news.featuredImage}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {news.isPinned && (
            <div className="absolute top-4 right-4 bg-accent-gold text-warmwhite px-3 py-1 rounded-full text-xs font-semibold">
              WICHTIG
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-56 w-full bg-gradient-to-br from-wine/10 to-wood-light/20 flex items-center justify-center">
          <svg className="w-16 h-16 text-wine/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          {news.isPinned && (
            <div className="absolute top-4 right-4 bg-accent-gold text-warmwhite px-3 py-1 rounded-full text-xs font-semibold">
              WICHTIG
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-graphite/60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time>{formatDate(news.publishedAt || news.createdAt)}</time>
        </div>

        {/* Title */}
        <h3 className="text-h4 font-serif text-wine-dark group-hover:text-wine transition-colors line-clamp-2">
          {news.title}
        </h3>

        {/* Excerpt */}
        {news.excerpt && (
          <p className="text-graphite/80 line-clamp-3">{news.excerpt}</p>
        )}

        {/* Read More */}
        <div className="inline-flex items-center gap-2 text-wine font-medium group-hover:gap-3 transition-all">
          Weiterlesen
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
