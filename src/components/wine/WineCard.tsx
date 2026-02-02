'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuantityPicker } from '@/components/ui/QuantityPicker';
import { NewBadge } from '@/components/ui/NewBadge';
import { DiscountBadge } from '@/components/ui/DiscountBadge';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

export interface WineCardProps {
  id: string;
  slug: string;
  name: string;
  winery: string;
  region: string;
  country: string;
  vintage?: number;
  wineType: string;
  price: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isBio?: boolean;
  isNew?: boolean;
  discountPercentage?: number;
}

export function WineCard({
  id,
  slug,
  name,
  winery,
  region,
  country,
  vintage,
  wineType,
  price,
  imageUrl,
  isFeatured,
  isBio,
  isNew,
  discountPercentage,
}: WineCardProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Load favorite status from localStorage
  useEffect(() => {
    const favorites = localStorage.getItem('vierkorken_favorites');
    if (favorites) {
      try {
        const favArray = JSON.parse(favorites);
        setIsFavorite(favArray.includes(id));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, [id]);

  // Load reviews from database API
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?wineId=${id}`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
          const reviews = data.data;
          const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
          setAvgRating(avg);
          setReviewCount(reviews.length);
        }
      } catch (e) {
        console.error('Failed to load reviews:', e);
      }
    }

    loadReviews();
  }, [id]);

  const finalPrice = discountPercentage && discountPercentage > 0
    ? price * (1 - discountPercentage / 100)
    : price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    for (let i = 0; i < quantity; i++) {
      addItem({
        id,
        name,
        price: finalPrice, // Use final discounted price
        imageUrl,
        type: 'wine',
        slug,
        winery,
        vintage,
      });
    }

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();

    const favorites = localStorage.getItem('vierkorken_favorites');
    let favArray: string[] = [];

    if (favorites) {
      try {
        favArray = JSON.parse(favorites);
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }

    if (isFavorite) {
      // Remove from favorites
      favArray = favArray.filter(fav => fav !== id);
    } else {
      // Add to favorites
      favArray.push(id);
    }

    localStorage.setItem('vierkorken_favorites', JSON.stringify(favArray));
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="group relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
          ✓ In den Warenkorb
        </div>
      )}

      <Card hover className="overflow-hidden h-full flex flex-col border border-wood-light/50 hover:border-wine/30 transition-all">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-warmwhite to-wood-lightest overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <WineBottleIcon className="w-24 h-24 text-taupe" />
            </div>
          )}


          {isFeatured && (
            <Badge variant="gold" className="text-xs">
              Featured
            </Badge>
          )}
          {isBio && (
            <Badge variant="accent" className="text-xs">
              Bio
            </Badge>
          )}
        </div>

        {/* Discount Badge (Top Right) */}
        {discountPercentage && discountPercentage > 0 && (
          <div className="absolute top-4 right-4 z-20 transform scale-125">
            <DiscountBadge percentage={discountPercentage} />
          </div>
        )}

        {/* Favorite Heart Icon - Moved to Top Left based on user image */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-warmwhite/90 hover:bg-warmwhite flex items-center justify-center transition-all shadow-md hover:shadow-lg z-20 border border-wood-light/20"
          aria-label="Zu Favoriten hinzufügen"
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-wine stroke-wine' : 'fill-none stroke-graphite hover:stroke-wine'
              }`}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Badges - Moved down to accommodate Favorite Button */}
        <div className="absolute top-16 left-4 flex flex-col gap-2 z-10">
          {isNew && (
            <div className="absolute -left-2 transform scale-125 z-20"> {/* Adjusted position */}
              <NewBadge />
            </div>
          )}
          {/* Spacer for New Badge if present */}
          {isNew && <div className="h-6"></div>}

          {isFeatured && (
            <Badge variant="gold" className="text-xs">
              Featured
            </Badge>
          )}
        </div>

        {/* Content */}
        <Link href={`/weine/${id}`} className="flex-1">
          <div className="p-6 space-y-3">
            {/* Wine Type */}
            <p className="text-body-sm text-graphite/60 uppercase tracking-wide">
              {wineType}
            </p>

            {/* Wine Name */}
            <h3 className="font-serif text-h4 text-wine-dark group-hover:text-wine transition-colors line-clamp-2">
              {name}
            </h3>

            {/* Winery */}
            <p className="text-body text-graphite font-medium">
              {winery}
            </p>

            {/* Region & Vintage */}
            <p className="text-body-sm text-graphite/70">
              {region}, {country}
              {vintage && ` • ${vintage}`}
            </p>

            {/* Rating Stars - 5 stars in soft gold/grey */}
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${reviewCount > 0 && star <= Math.round(avgRating)
                    ? 'text-accent-gold'
                    : 'text-taupe/40'
                    }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-graphite/50 ml-1">
                {reviewCount > 0 ? `${avgRating.toFixed(1)} (${reviewCount})` : '(Noch keine Bewertung)'}
              </span>
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-wood-light">
              {discountPercentage && discountPercentage > 0 ? (
                <div className="flex flex-col">
                  <span className="text-h4 text-red-700 font-bold font-serif">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="text-sm text-graphite/60 line-through">
                    {formatPrice(price)}
                  </span>
                </div>
              ) : (
                <p className="font-serif text-h4 text-wine-dark">
                  {formatPrice(price)}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Add to Cart Section */}
        <div className="p-6 pt-0 mt-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <QuantityPicker
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={99}
              className="flex-shrink-0"
            />
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              size="sm"
            >
              <CartIcon />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Simple Wine Bottle Icon
function WineBottleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 3h6v3h-6V3zM8 6h8v4l-2 11H10L8 10V6z"
      />
    </svg>
  );
}

// Cart Icon
function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
