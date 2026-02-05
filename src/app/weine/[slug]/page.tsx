'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { NewBadge } from '@/components/ui/NewBadge';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

interface Wine {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  description: string;
  categories: string[];
  stock: number;
  images?: string[];
  hasOverride?: boolean;
  customData?: {
    grapes?: string;
    nose?: string;
    food?: string;
    temp?: string;
    alcohol?: string;
    barrel?: string;
    sweetness?: number;
    acidity?: number;
    tannins?: number;
    body?: number;
    fruitiness?: number;
    newItemUntil?: string;
  };
};

export default function WineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, itemCount } = useCart();
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [reviews, setReviews] = useState<Array<{
    id: string;
    userName: string;
    rating: number;
    title?: string | null;
    reviewText: string | null;
    createdAt: string;
    isVerifiedPurchase?: boolean;
  }>>([]);

  const isLoggedIn = !!session;

  useEffect(() => {
    async function fetchWine() {
      try {
        const res = await fetch('/api/klara/articles?onlyActive=true');
        const data = await res.json();

        console.log('🔍 Looking for wine with slug:', slug);
        console.log('📦 Got articles:', data.success ? data.data.length : 0);

        if (data.success) {
          // Try to find by ID (slug is the ID for KLARA products)
          const foundWine = data.data.find((w: Wine) => {
            console.log('  Checking:', w.id, w.name);
            return w.id === slug;
          });

          console.log('✅ Found wine:', foundWine ? foundWine.name : 'NOT FOUND');
          setWine(foundWine || null);
        }
      } catch (error) {
        console.error('Error fetching wine:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWine();

    // Load reviews from database
    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?wineId=${slug}`);
        const data = await res.json();

        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    loadReviews();
  }, [slug]);

  const handleAddToCart = () => {
    if (!wine) return;

    const imageUrl = wine.images && wine.images.length > 0 ? wine.images[0] : '';

    addItem({
      id: wine.id,
      name: wine.name,
      price: wine.price,
      imageUrl,
      type: 'wine',
      slug: wine.id,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wine || !rating || !isLoggedIn || !session?.user) return;

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wineId: wine.id,
          rating,
          comment: reviewText || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Show success message
        setSubmitMessage(data.message || 'Bewertung erfolgreich eingereicht!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setSubmitMessage('');
        }, 5000);

        // Reset form
        setRating(0);
        setReviewText('');

        // Reload reviews (approved reviews will show immediately, others after admin approval)
        const reviewsRes = await fetch(`/api/reviews?wineId=${wine.id}`);
        const reviewsData = await reviewsRes.json();
        if (reviewsData.success) {
          setReviews(reviewsData.data);
        }
      } else {
        // Show error message
        setSubmitMessage(data.error || 'Fehler beim Absenden der Bewertung');
        alert(data.error || 'Fehler beim Absenden der Bewertung');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage('Fehler beim Absenden der Bewertung');
      alert('Fehler beim Absenden der Bewertung');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
      </div>
    );
  }

  if (!wine) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 font-serif text-graphite-dark mb-4">Wein nicht gefunden</h1>
          <Link href="/weine" className="btn btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  // Mock taste profile data (can be extended with real data later)
  // Real taste profile data from customData
  const tasteProfile = {
    sweetness: wine.customData?.sweetness ? Number(wine.customData.sweetness) : 3,
    acidity: wine.customData?.acidity ? Number(wine.customData.acidity) : 3,
    tannins: wine.customData?.tannins ? Number(wine.customData.tannins) : 3,
    body: wine.customData?.body ? Number(wine.customData.body) : 3,
    fruitiness: wine.customData?.fruitiness ? Number(wine.customData.fruitiness) : 3
  };

  return (
    <div className="min-h-screen bg-warmwhite">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{submitMessage || 'In den Warenkorb gelegt!'}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-elegant border-b border-taupe-light/30">
        <div className="container-custom py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-graphite hover:text-graphite-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Zurück</span>
            </button>

            <Link href="/warenkorb" className="text-graphite hover:text-graphite-dark transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-burgundy text-warmwhite text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-warmwhite to-sand-light rounded-lg flex items-center justify-center overflow-hidden">
              {wine.customData?.newItemUntil && new Date(wine.customData.newItemUntil) > new Date() && (
                <div className="absolute top-0 left-0 z-20 transform -translate-x-1/2 -translate-y-1/2 scale-125 ml-4 mt-4">
                  <div className="relative">
                    <NewBadge />
                  </div>
                </div>
              )}
              {wine.images && wine.images.length > 0 ? (
                <img
                  src={wine.images[0]}
                  alt={wine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-32 h-32 text-taupe" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C10.89 2 10 2.89 10 4V5H8V4C8 2.89 7.11 2 6 2C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V4C20 2.89 19.11 2 18 2C16.89 2 16 2.89 16 4V5H14V4C14 2.89 13.11 2 12 2M6 4H6.5V7H5.5V4H6M12 4H12.5V7H11.5V4H12M18 4H18.5V7H17.5V4H18Z" />
                </svg>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-display font-serif font-light text-graphite-dark mb-2">
                {wine.name}
              </h1>
              <p className="text-graphite">Artikel Nr.: {wine.articleNumber}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-h2 font-serif text-accent-burgundy">
                {formatPrice(wine.price)}
              </span>
              <span className="text-graphite">/ Flasche</span>
            </div>

            <div className="border-y border-taupe-light py-6 my-6 space-y-4">
              {/* Professional Icons for Attributes */}
              {wine.customData && (
                <div className="space-y-3">
                  {wine.customData.grapes && (
                    <AttributeRow
                      icon={<img src="/images/layout/Bild-Icons/traube.svg" alt="Traube" className="w-full h-full object-contain" />}
                      text={wine.customData.grapes}
                    />
                  )}
                  {wine.customData.nose && (
                    <AttributeRow
                      icon={<img src="/images/layout/Bild-Icons/taste.svg" alt="Nase" className="w-full h-full object-contain" />}
                      text={wine.customData.nose}
                    />
                  )}
                  {wine.customData.food && (
                    <AttributeRow
                      icon={<img src="/images/layout/Bild-Icons/meal.svg" alt="Essen" className="w-full h-full object-contain" />}
                      text={wine.customData.food}
                    />
                  )}
                  {wine.customData.temp && (
                    <AttributeRow
                      icon={<img src="/images/layout/Bild-Icons/temperature.svg" alt="Temperatur" className="w-full h-full object-contain" />}
                      text={wine.customData.temp}
                    />
                  )}
                  {wine.customData.alcohol && (
                    <AttributeRow
                      icon={<img src="/images/layout/Bild-Icons/glas.svg" alt="Alkohol" className="w-full h-full object-contain" />}
                      text={wine.customData.alcohol}
                    />
                  )}
                  {wine.customData.barrel && (
                    <AttributeRow
                      icon={<img src="/images/layout/Bild-Icons/barrels.svg" alt="Fass/Ausbau" className="w-full h-full object-contain" />}
                      text={wine.customData.barrel}
                    />
                  )}
                </div>
              )}
            </div>


            {/* Rich Text Description */}
            {wine.description && (
              <div className="relative">
                <div
                  className={`prose prose-lg max-w-none text-graphite leading-relaxed overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-full' : 'max-h-[200px]'}`}
                  dangerouslySetInnerHTML={{ __html: wine.description }}
                />

                {!isExpanded && wine.description.length > 300 && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warmwhite to-transparent pointer-events-none" />
                )}

                {wine.description.length > 300 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-accent-burgundy font-medium hover:text-accent-burgundy-dark flex items-center gap-1"
                  >
                    {isExpanded ? 'Weniger anzeigen' : 'Mehr lesen'}
                    <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 space-y-4">
              <button
                onClick={handleAddToCart}
                className="btn btn-primary w-full md:w-auto px-8"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                In den Warenkorb
              </button>

              {wine.stock > 0 && wine.stock < 10 && (
                <p className="text-sm text-orange-600">
                  Nur noch {wine.stock} auf Lager
                </p>
              )}
            </div>

            <div className="border-t border-taupe-light pt-6 space-y-3">
              <h3 className="font-semibold text-graphite-dark">Produktinformationen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-graphite">Verfügbarkeit:</span>
                  <span className="text-graphite-dark font-medium">
                    {wine.stock > 0 ? 'Auf Lager' : 'Nicht verfügbar'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite">Lieferzeit:</span>
                  <span className="text-graphite-dark font-medium">3-5 Werktage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Taste Profile Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
          <h2 className="text-h3 font-serif text-graphite-dark mb-6">Geschmacksprofil</h2>
          <div className="space-y-4">
            <TasteBar label="Süße" value={tasteProfile.sweetness} />
            <TasteBar label="Säure" value={tasteProfile.acidity} />
            <TasteBar label="Tannine" value={tasteProfile.tannins} />
            <TasteBar label="Körper" value={tasteProfile.body} />
            <TasteBar label="Fruchtigkeit" value={tasteProfile.fruitiness} />
          </div>
        </div>

        {/* Login Banner (nur für nicht-angemeldete User) */}
        {!isLoggedIn && (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-taupe-light/30 mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warmwhite flex items-center justify-center">
                <svg className="w-6 h-6 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-h4 font-serif text-graphite-dark mb-2">
                Bewertungen schreiben
              </h3>
              <p className="text-graphite text-sm mb-6">
                Melden Sie sich an, um diesen Wein zu bewerten und Ihre Meinung zu teilen.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/login" className="btn btn-primary px-6">
                  Anmelden
                </Link>
                <Link href="/registrieren" className="btn btn-outline px-6">
                  Registrieren
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Rating Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm border-t-4 border-accent-gold">
          <h2 className="text-h3 font-serif text-graphite-dark mb-6">Bewertungen</h2>

          {/* Rating Form (nur für angemeldete User) */}
          {isLoggedIn && (
            <div className="bg-warmwhite rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-graphite-dark mb-4">Ihre Bewertung</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating Selector */}
                <div>
                  <label className="block text-sm text-graphite mb-2">Bewertung wählen</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <svg
                          className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                            ? 'text-accent-gold fill-accent-gold'
                            : 'text-taupe/30 fill-taupe/30'
                            }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-graphite mt-2">Sie haben {rating} Stern{rating > 1 ? 'e' : ''} ausgewählt</p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="reviewText" className="block text-sm text-graphite mb-2">
                    Kommentar (optional)
                  </label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Schreiben Sie einen Kommentar zu diesem Wein..."
                    rows={4}
                    className="w-full px-4 py-3 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!rating || submitting}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Wird gespeichert...' : 'Bewertung absenden'}
                </button>
              </form>
            </div>
          )}

          {/* Rating Overview */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center p-6 bg-warmwhite rounded-lg">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-8 h-8 ${star <= Math.round(avgRating) ? 'text-accent-gold' : 'text-taupe/40'
                      }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-3xl font-serif text-graphite-dark">
                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'} / 5
              </p>
              <p className="text-graphite text-sm">
                {reviews.length === 0 ? 'Noch keine Bewertungen' : `${reviews.length} Bewertung${reviews.length > 1 ? 'en' : ''}`}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex gap-0.5 w-20">
                    {[...Array(stars)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-accent-gold/70" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-sand-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-gold to-accent-gold/80 transition-all duration-500"
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-graphite w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="border-t border-taupe-light pt-6">
            <h3 className="font-semibold text-graphite-dark mb-4">Bewertungen von Nutzern</h3>
            {reviews.length === 0 ? (
              <p className="text-graphite text-center py-8">Noch keine Bewertungen. Sei der Erste!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-l-4 border-accent-gold pl-4 py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-graphite-dark">{review.userName}</p>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Verifizierter Kauf
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-graphite/60">
                          {new Date(review.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-accent-gold' : 'text-taupe/30'
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <p className="font-medium text-graphite-dark mb-1">{review.title}</p>
                    )}
                    {review.reviewText && (
                      <p className="text-graphite text-sm leading-relaxed">{review.reviewText}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Taste Bar Component
function TasteBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 5) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="w-28 text-sm text-graphite">{label}:</span>
      <div className="flex-1 h-3 bg-sand-light rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-gold to-accent-gold/80 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="w-8 text-sm text-graphite text-right">{value}/5</span>
    </div>
  );
}

function AttributeRow({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 text-graphite-dark flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <span className="text-graphite font-medium">{text}</span>
    </div>
  );
}


