'use client';

import { WineCard } from '@/components/wine/WineCard';
import { useCart } from '@/contexts/CartContext';

interface NewProductsCarouselProps {
    products: any[];
}

export function NewProductsCarousel({ products }: NewProductsCarouselProps) {
    // Duplicate products for seamless loop
    // If we have few products, we might need to duplicate multiple times to fill the screen width
    // But standard x2 is usually enough if we have at least 4-5 items.
    // If we have very few (e.g. 1-2), we might need x4 or x8.
    // Let's assume user marks enough, but safeguard:

    let duplicatedProducts = [...products, ...products];
    if (products.length < 5) {
        duplicatedProducts = [...products, ...products, ...products, ...products];
    }

    return (
        <div className="w-full overflow-hidden py-8">
            <div className="carousel-container">
                <div className="carousel-track">
                    {duplicatedProducts.map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="carousel-item"
                        >
                            <WineCard
                                id={product.id}
                                slug={product.articleNumber} // Using articleNumber as slug/id reference or actual slug if available
                                name={product.name}
                                // Map API data to WineCard props - checking page.tsx for data structure
                                // Assuming data comes from /api/klara/articles which returns Article structure
                                // We might need to map fields properly.
                                // Standard WineCard expects: winery, region, country, wineType, price, etc.
                                // If data is missing (e.g. winery/region not in standard api/klara/articles response?), check implementation.
                                // In page.tsx: categories are fetched. But articles?
                                // I'll need to map as best as possible.
                                winery={product.customData?.winery || 'VIER KORKEN Weinboutique'}
                                region={product.customData?.region || ''}
                                country={product.customData?.country || ''}
                                vintage={product.customData?.vintage ? parseInt(product.customData.vintage) : undefined}
                                wineType={product.customData?.grapeVariety || 'Wein'} // Fallback
                                price={product.price}
                                imageUrl={product.customImages?.[0] || product.images?.[0]}
                                isFeatured={false}
                                isBio={false}
                                isNew={true}
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
          /* Adjust animation duration based on item count to keep consistent speed */
          animation: scroll ${Math.max(20, products.length * 4)}s linear infinite;
          will-change: transform;
          padding: 1rem 0;
        }

        .carousel-item {
          flex-shrink: 0;
          width: 280px; /* Fixed width for card */
          /* Height auto to fit card content */
        }

        /* Infinite Scroll Animation */
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Since we duplicated once (or more), we scroll half (or partial) way */
            /* If we used [...p, ...p], we scroll -50%. */
            /* If we used x4, we scroll -25%? No, usually -50% implies 2 sets. */
            /* Logic: We have N sets. We scroll 1/N * 100 %. */
            /* If duplicatedProducts is 2*products, we scroll -50%. */
            /* If 4*products, we scroll -25%? Wait. */
            /* We want to scroll until the first set is fully out and second set starts exactly where 1st started. */
            /* So we scroll by (products.length * (width + gap)). */
            /* Simpler: transform: translateX(-50%) works if we have exactly 2 identical sets side by side. */
            /* If we have 4 sets, we want to scroll -25%? */
            /* Let's stick to 2 sets logic for simplicity and ensure width is handled by having enough items */
            transform: translateX(-50%);
          }
        }

        /* Pause on Hover */
        .carousel-container:hover .carousel-track {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}
