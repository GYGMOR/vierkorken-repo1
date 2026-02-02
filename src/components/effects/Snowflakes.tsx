'use client';

import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
  drift: number;
}

export function Snowflakes() {
  const [enabled, setEnabled] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('snowflakes-enabled');
    const isEnabled = stored === null ? true : stored === 'true'; // Default: enabled
    setEnabled(isEnabled);
  }, []);

  // Generate snowflakes
  useEffect(() => {
    if (!enabled) {
      setSnowflakes([]);
      return;
    }

    const flakes: Snowflake[] = [];
    const count = 30; // Anzahl der Schneeflocken

    for (let i = 0; i < count; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100, // 0-100%
        animationDuration: 10 + Math.random() * 15, // 10-25s
        animationDelay: Math.random() * 5, // 0-5s
        size: 0.5 + Math.random() * 0.9, // 0.5-1.4 (noch größer)
        opacity: 0.85 + Math.random() * 0.15, // 0.85-1.0 (fast voll deckend)
        drift: -20 + Math.random() * 40, // -20px bis +20px Seitwärtsdrift
      });
    }

    setSnowflakes(flakes);
  }, [enabled]);

  const toggleSnowflakes = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('snowflakes-enabled', String(newState));
  };

  return (
    <>
      {/* Snowflakes Container */}
      {enabled && (
        <div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          aria-hidden="true"
        >
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="snowflake absolute"
              style={{
                left: `${flake.left}%`,
                animationDuration: `${flake.animationDuration}s`,
                animationDelay: `${flake.animationDelay}s`,
                opacity: flake.opacity,
                '--drift': `${flake.drift}px`,
              } as React.CSSProperties}
            >
              <svg
                width={`${flake.size * 20}px`}
                height={`${flake.size * 20}px`}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 10px rgba(180, 200, 255, 0.8))',
                }}
              >
                {/* Elegant Snowflake SVG - 6-pointed star */}
                <g stroke="#D5E5FF" strokeWidth="1.5" strokeLinecap="round">
                  {/* Center lines */}
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
                  <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />

                  {/* Branches - top */}
                  <line x1="12" y1="2" x2="10" y2="4" />
                  <line x1="12" y1="2" x2="14" y2="4" />

                  {/* Branches - bottom */}
                  <line x1="12" y1="22" x2="10" y2="20" />
                  <line x1="12" y1="22" x2="14" y2="20" />

                  {/* Branches - left */}
                  <line x1="2" y1="12" x2="4" y2="10" />
                  <line x1="2" y1="12" x2="4" y2="14" />

                  {/* Branches - right */}
                  <line x1="22" y1="12" x2="20" y2="10" />
                  <line x1="22" y1="12" x2="20" y2="14" />

                  {/* Diagonal branches */}
                  <line x1="5.5" y1="5.5" x2="7" y2="7" />
                  <line x1="18.5" y1="18.5" x2="17" y2="17" />
                  <line x1="18.5" y1="5.5" x2="17" y2="7" />
                  <line x1="5.5" y1="18.5" x2="7" y2="17" />

                  {/* Center circle */}
                  <circle cx="12" cy="12" r="2" fill="#D5E5FF" fillOpacity="1" />
                </g>
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Toggle Button - Fixed bottom right */}
      <button
        onClick={toggleSnowflakes}
        className="fixed bottom-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-sm border border-taupe-light rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
        aria-label={enabled ? 'Schneeflocken ausschalten' : 'Schneeflocken einschalten'}
        title={enabled ? 'Schneeflocken ausschalten' : 'Schneeflocken einschalten'}
      >
        {enabled ? (
          // Snowflake Icon (enabled)
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent-burgundy"
          >
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
              <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </g>
          </svg>
        ) : (
          // Snowflake Icon (disabled) with slash
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-graphite"
          >
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
              <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </g>
            {/* Diagonal slash */}
            <line
              x1="4"
              y1="4"
              x2="20"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10vh) translateX(0);
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift));
          }
        }

        .snowflake {
          animation: snowfall linear infinite;
          will-change: transform;
        }

        /* Smooth fade in/out */
        .snowflake svg {
          animation: fade-pulse 3s ease-in-out infinite;
        }

        @keyframes fade-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
