'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { CarouselEditModal } from './CarouselEditModal';

const DEFAULT_IMAGES = [
  '/images/event-thumbnails/asiafood.png',
  '/images/event-thumbnails/getränke.png',
  '/images/event-thumbnails/weinabend.png',
  '/images/event-thumbnails/weinglaeser.png',
  '/images/event-thumbnails/weintisch.png',
];

export function EventImageCarousel() {
  const { data: session } = useSession();
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === 'ADMIN';

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/admin/event-carousel?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setImages(data.images.map((img: any) => img.url));
        } else {
          // If no images in DB, stick to defaults or allow empty?
          // Let's stick to defaults if DB is empty to avoid broken UI on first load
          setImages(DEFAULT_IMAGES);
        }
      }
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Bilder doppelt für nahtlosen Loop (mindestens genug Bilder für den Screen)
  // If we have very few images, we might need to duplicate them more times
  const displayImages = images.length > 0 ? images : DEFAULT_IMAGES;
  // Ensure we have enough items for smoother scrolling even with few images
  const duplicatedImages = [...displayImages, ...displayImages, ...displayImages, ...displayImages].slice(0, 20); // Cap at 20 to be safe

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-warmwhite via-taupe-light/30 to-warmwhite border-y border-taupe-light group/carousel">

      {/* Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur text-graphite hover:text-accent-burgundy rounded-full shadow-md border border-taupe-light transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
          title="Carousel bearbeiten"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      <div className="carousel-container">
        <div className="carousel-track">
          {duplicatedImages.map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="carousel-item"
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 border border-taupe-light/20">
                <Image
                  src={img}
                  alt={`Event ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 220px, (max-width: 767px) 240px, (max-width: 1024px) 280px, 320px"
                  priority={index < 5} // Erste 5 Bilder sofort laden
                  quality={90}
                  onError={(e) => {
                    // Fallback bei fehlendem Bild
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && (
        <CarouselEditModal
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchImages}
        />
      )}

      <style jsx>{`
        .carousel-container {
          width: 100%;
          padding: 2.5rem 0;
        }

        .carousel-track {
          display: flex;
          gap: 1.5rem;
          animation: scroll 40s linear infinite;
          will-change: transform;
        }

        .carousel-item {
          flex-shrink: 0;
          width: 320px;
          height: 220px;
          position: relative;
        }

        /* Tablet Portrait (768px - 1024px) */
        @media (max-width: 1024px) and (min-width: 768px) {
          .carousel-container {
            padding: 2rem 0;
          }

          .carousel-item {
            width: 280px;
            height: 190px;
          }

          .carousel-track {
            gap: 1.25rem;
            animation: scroll 35s linear infinite;
          }
        }

        /* Mobile Landscape & Small Tablets (481px - 767px) */
        @media (max-width: 767px) and (min-width: 481px) {
          .carousel-container {
            padding: 1.75rem 0;
          }

          .carousel-item {
            width: 240px;
            height: 160px;
          }

          .carousel-track {
            gap: 1rem;
            animation: scroll 30s linear infinite;
          }
        }

        /* Mobile Portrait (max 480px) */
        @media (max-width: 480px) {
          .carousel-container {
            padding: 1.5rem 0;
          }

          .carousel-item {
            width: 220px;
            height: 140px;
          }

          .carousel-track {
            gap: 0.875rem;
            animation: scroll 25s linear infinite;
          }
        }

        /* Infinite Scroll Animation */
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Pause on Hover (Desktop only) */
        @media (min-width: 1024px) {
          .carousel-container:hover .carousel-track {
            animation-play-state: paused;
          }
        }

        /* Smooth transitions & Hover-Effekt */
        .carousel-item > div {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 1024px) {
          .carousel-item:hover > div {
            transform: scale(1.03);
          }
        }

        /* Anti-Aliasing für smoother Bilder */
        .carousel-item img {
          -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0);
          -moz-transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  );
}
