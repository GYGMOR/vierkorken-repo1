'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function ChristmasWreath() {
  const [isVisible, setIsVisible] = useState(true); // TEST: Immer sichtbar
  const [isSpinning, setIsSpinning] = useState(true); // TEST: Immer am drehen

  useEffect(() => {
    // Funktion für einen Animations-Zyklus
    const startAnimation = () => {
      setIsVisible(true);
      setIsSpinning(true);

      // Nach 2-3 Rotationen (ca. 7 Sekunden) verschwindet der Kranz
      const spinDuration = 7000; // 7 Sekunden = ca. 2-3 Rotationen

      setTimeout(() => {
        setIsSpinning(false);

        // Fade out
        setTimeout(() => {
          setIsVisible(false);

          // Zufällige Wartezeit bis zum nächsten Erscheinen (10-20 Sekunden)
          const randomDelay = 10000 + Math.random() * 10000;

          setTimeout(() => {
            startAnimation();
          }, randomDelay);
        }, 1000); // 1 Sekunde Fade-out
      }, spinDuration);
    };

    // Erste Animation sofort starten (500ms delay)
    const initialTimeout = setTimeout(() => {
      startAnimation();
    }, 500);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div
      className={`wreath-wrapper ${
        isVisible ? 'wreath-visible' : 'wreath-hidden'
      }`}
    >
      <div
        className={`wreath-container ${isSpinning ? 'spinning' : ''}`}
      >
        <Image
          src="/images/advent/weinkranz.png"
          alt="Weihnachtskranz"
          width={150}
          height={150}
          className="wreath-image"
          priority
          unoptimized
        />
      </div>

      <style jsx>{`
        .wreath-wrapper {
          position: fixed;
          top: 1rem;
          left: 140px;
          z-index: 60;
          transition: opacity 1s ease-in-out;
          pointer-events: none;
        }

        .wreath-visible {
          opacity: 1;
        }

        .wreath-hidden {
          opacity: 0;
          visibility: hidden;
        }

        .wreath-container {
          width: 150px;
          height: 150px;
          position: relative;
          background: transparent;
        }

        .wreath-image {
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
          background: transparent !important;
        }

        :global(.wreath-image img) {
          background: transparent !important;
        }

        .spinning {
          animation: spin360 3s linear infinite;
        }

        @keyframes spin360 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Desktop Large (1200px+) */
        @media (min-width: 1200px) {
          .wreath-wrapper {
            left: 145px;
          }

          .wreath-container {
            width: 160px;
            height: 160px;
          }
        }

        /* Tablet (768px - 1024px) */
        @media (max-width: 1024px) and (min-width: 768px) {
          .wreath-wrapper {
            top: 0.75rem;
            left: 135px;
          }

          .wreath-container {
            width: 120px;
            height: 120px;
          }
        }

        /* Mobile Landscape (481px - 767px) */
        @media (max-width: 767px) and (min-width: 481px) {
          .wreath-wrapper {
            top: 0.5rem;
            left: 115px;
          }

          .wreath-container {
            width: 90px;
            height: 90px;
          }
        }

        /* Mobile Portrait (max 480px) */
        @media (max-width: 480px) {
          .wreath-wrapper {
            top: 0.5rem;
            left: 100px;
          }

          .wreath-container {
            width: 75px;
            height: 75px;
          }
        }
      `}</style>
    </div>
  );
}
