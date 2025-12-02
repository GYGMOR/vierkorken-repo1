'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function EventImageCarousel() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Event-Bilder aus dem Ordner
    const imageNames = [
      'asiafood.png',
      'getränke.png',
      'weinabend.png',
      'weinglaeser.png',
      'weintisch.png',
    ];

    const imagePaths = imageNames.map(
      (name) => `/images/event-thumbnails/${name}`
    );
    setImages(imagePaths);
  }, []);

  // Bilder doppelt für nahtlosen Loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-warmwhite via-taupe-light/30 to-warmwhite border-y border-taupe-light">
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

      <style jsx>{`
        .carousel-container {
          width: 100%;
          padding: 2.5rem 0;
        }

        .carousel-track {
          display: flex;
          gap: 1.5rem;
          animation: scroll 30s linear infinite;
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
            animation: scroll 25s linear infinite;
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
            animation: scroll 23s linear infinite;
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
            animation: scroll 20s linear infinite;
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
