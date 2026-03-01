'use client';

import { WineCard } from '@/components/wine/WineCard';
import { useCart } from '@/contexts/CartContext';

interface DiscountProductsCarouselProps {
  products: any[];
}

export function DiscountProductsCarousel({ products }: DiscountProductsCarouselProps) {
  const shouldAnimate = products.length >= 5;

  // Only duplicate if we have 5 or more products
  const displayProducts = shouldAnimate ? [...products, ...products] : products;

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="carousel-container overflow-x-auto md:overflow-hidden snap-x snap-mandatory touch-pan-x scrollbar-hide">
        <div className={`carousel-track flex w-max ${shouldAnimate ? 'animate-scroll' : 'justify-start md:justify-center'}`}>
          {displayProducts.map((product, index) => (
            <div
              key={shouldAnimate ? `${product.id}-${index}` : product.id}
              className="carousel-item"
            >
              <WineCard
                id={product.id}
                slug={product.articleNumber}
                name={product.name}
                winery={product.customData?.winery || 'Vier Korken Wein-Boutique'}
                region={product.customData?.region || ''}
                country={product.customData?.country || ''}
                vintage={product.customData?.vintage ? parseInt(product.customData.vintage) : undefined}
                wineType={product.customData?.grapeVariety || 'Wein'}
                price={product.price}
                imageUrl={product.customImages?.[0] || product.images?.[0]}
                isFeatured={false}
                isBio={false}
                isNew={product.customData?.newItemUntil && new Date(product.customData.newItemUntil) > new Date()}
                discountPercentage={product.customData?.discountPercentage || 0}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .carousel-container {
          width: 100%;
        }

        .carousel-track {
          display: flex;
          gap: 1.5rem;
          padding: 1rem 0;
        }

        .animate-scroll {
          /* Deutlich langsameres Scrollen, damit User in Ruhe lesen können */
          animation: scroll ${Math.max(40, products.length * 8)}s linear infinite;
          will-change: transform;
        }

        .carousel-item {
          flex-shrink: 0;
          width: 280px;
          scroll-snap-align: start;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .carousel-container:hover .carousel-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
