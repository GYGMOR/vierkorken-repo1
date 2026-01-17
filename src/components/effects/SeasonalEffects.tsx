'use client';

import { useEffect, useState } from 'react';

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

interface Particle {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
  drift: number;
  rotation?: number;
}

export function SeasonalEffects() {
  const [season, setSeason] = useState<Season>('winter');
  const [enabled, setEnabled] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Fetch season from API
  useEffect(() => {
    async function fetchSeason() {
      try {
        const res = await fetch('/api/admin/settings/season');
        const data = await res.json();
        if (data.success && data.season) {
          setSeason(data.season);
        }
      } catch (error) {
        console.error('Failed to fetch season:', error);
      }
    }
    fetchSeason();
  }, []);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('seasonal-effects-enabled');
    const isEnabled = stored === null ? true : stored === 'true';
    setEnabled(isEnabled);
  }, []);

  // Generate particles based on season
  useEffect(() => {
    if (!enabled) {
      setParticles([]);
      return;
    }

    const flakes: Particle[] = [];
    const count = season === 'summer' ? 15 : 30;

    for (let i = 0; i < count; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 10 + Math.random() * 15,
        animationDelay: Math.random() * 5,
        size: 0.5 + Math.random() * 0.9,
        opacity: 0.85 + Math.random() * 0.15,
        drift: -20 + Math.random() * 40,
        rotation: Math.random() * 360,
      });
    }

    setParticles(flakes);
  }, [enabled, season]);

  const toggleEffects = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('seasonal-effects-enabled', String(newState));
  };

  // Get season-specific icon and colors
  const getSeasonConfig = () => {
    switch (season) {
      case 'winter':
        return { icon: <SnowflakeIcon />, label: 'Schnee', color: 'text-blue-400' };
      case 'spring':
        return { icon: <FlowerIcon />, label: 'Blüten', color: 'text-pink-400' };
      case 'summer':
        return { icon: <SunIcon />, label: 'Sonne', color: 'text-yellow-500' };
      case 'autumn':
        return { icon: <LeafIcon />, label: 'Blätter', color: 'text-orange-500' };
      default:
        return { icon: <SnowflakeIcon />, label: 'Effekte', color: 'text-gray-400' };
    }
  };

  const config = getSeasonConfig();

  return (
    <>
      {/* Particles Container */}
      {enabled && (
        <div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          aria-hidden="true"
        >
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle absolute"
              style={{
                left: `${particle.left}%`,
                animationDuration: `${particle.animationDuration}s`,
                animationDelay: `${particle.animationDelay}s`,
                opacity: particle.opacity,
                '--drift': `${particle.drift}px`,
                '--rotation': `${particle.rotation}deg`,
              } as React.CSSProperties}
            >
              {season === 'winter' && <SnowflakeSVG size={particle.size} />}
              {season === 'spring' && <BlossomSVG size={particle.size} />}
              {season === 'summer' && <SunRaySVG size={particle.size} />}
              {season === 'autumn' && <LeafSVG size={particle.size} />}
            </div>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleEffects}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-sm border border-taupe-light rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group ${config.color}`}
        aria-label={enabled ? `${config.label} ausschalten` : `${config.label} einschalten`}
        title={enabled ? `${config.label} ausschalten` : `${config.label} einschalten`}
      >
        {enabled ? (
          <div className="text-accent-burgundy">{config.icon}</div>
        ) : (
          <div className="text-graphite opacity-40 relative">
            {config.icon}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-graphite rotate-45 rounded"></div>
            </div>
          </div>
        )}
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rotation, 360deg));
          }
        }

        @keyframes float-sun {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.6;
          }
        }

        .particle {
          animation: ${season === 'summer' ? 'float-sun' : 'fall'} linear infinite;
          will-change: transform;
        }

        .particle svg {
          animation: fade-pulse 3s ease-in-out infinite;
        }

        @keyframes fade-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}

// Season Icons for Toggle Button
function SnowflakeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
        <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </g>
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="5" rx="2" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="19" rx="2" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="5" cy="12" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="19" cy="12" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 21C6 21 7 14 12 9C17 4 21 3 21 3C21 3 20 10 15 15C10 20 3 21 3 21L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Falling Particle SVGs
function SnowflakeSVG({ size }: { size: number }) {
  return (
    <svg
      width={`${size * 20}px`}
      height={`${size * 20}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 10px rgba(180, 200, 255, 0.8))' }}
    >
      <g stroke="#D5E5FF" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
        <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
        <line x1="12" y1="2" x2="10" y2="4" />
        <line x1="12" y1="2" x2="14" y2="4" />
        <line x1="12" y1="22" x2="10" y2="20" />
        <line x1="12" y1="22" x2="14" y2="20" />
        <line x1="2" y1="12" x2="4" y2="10" />
        <line x1="2" y1="12" x2="4" y2="14" />
        <line x1="22" y1="12" x2="20" y2="10" />
        <line x1="22" y1="12" x2="20" y2="14" />
        <circle cx="12" cy="12" r="2" fill="#D5E5FF" fillOpacity="1" />
      </g>
    </svg>
  );
}

function BlossomSVG({ size }: { size: number }) {
  return (
    <svg
      width={`${size * 18}px`}
      height={`${size * 18}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
    >
      <ellipse cx="12" cy="6" rx="3" ry="4" fill="#FFB7C5" fillOpacity="0.9" />
      <ellipse cx="12" cy="18" rx="3" ry="4" fill="#FFB7C5" fillOpacity="0.9" />
      <ellipse cx="6" cy="12" rx="4" ry="3" fill="#FFB7C5" fillOpacity="0.9" />
      <ellipse cx="18" cy="12" rx="4" ry="3" fill="#FFB7C5" fillOpacity="0.9" />
      <circle cx="12" cy="12" r="3" fill="#FFD700" fillOpacity="0.8" />
    </svg>
  );
}

function SunRaySVG({ size }: { size: number }) {
  return (
    <svg
      width={`${size * 30}px`}
      height={`${size * 30}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 15px rgba(255, 200, 50, 0.6))' }}
    >
      <circle cx="12" cy="12" r="5" fill="#FFD700" fillOpacity="0.4" />
      <circle cx="12" cy="12" r="3" fill="#FFD700" fillOpacity="0.6" />
    </svg>
  );
}

function LeafSVG({ size }: { size: number }) {
  const colors = ['#D2691E', '#CD853F', '#8B4513', '#A0522D', '#B8860B'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <svg
      width={`${size * 20}px`}
      height={`${size * 20}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}
    >
      <path
        d="M6 21C6 21 7 14 12 9C17 4 21 3 21 3C21 3 20 10 15 15C10 20 3 21 3 21L6 18"
        fill={color}
        fillOpacity="0.85"
        stroke={color}
        strokeWidth="0.5"
      />
      <path d="M9 15L15 9" stroke="#5D4037" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}
