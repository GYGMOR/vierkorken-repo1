'use client';

import { useState, useEffect } from 'react';

export function OpeningHoursModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user already dismissed modal in this session
    const hasSeenModal = sessionStorage.getItem('vk_opening_hours_seen_sep2026');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('vk_opening_hours_seen_sep2026', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-graphite-darker/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-warmwhite rounded-2xl shadow-strong border border-accent-gold/40 overflow-hidden transform transition-all animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opening-hours-title"
      >
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-accent-burgundy to-wine-dark p-6 text-center text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
            aria-label="Schliessen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <span className="inline-block px-3 py-1 bg-accent-gold/20 text-accent-gold text-xs font-semibold uppercase tracking-wider rounded-full mb-2 border border-accent-gold/30">
            Wichtige Information
          </span>
          <h3 id="opening-hours-title" className="text-xl sm:text-2xl font-serif text-warmwhite font-bold">
            Neue Öffnungszeiten
          </h3>
          <p className="text-xs sm:text-sm text-warmwhite/80 mt-1">
            Gültig ab 1. September 2026
          </p>
        </div>

        {/* Modal Content / Hours Table */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-graphite text-center leading-relaxed">
            Liebe Weinfreunde, wir passen unsere Laden-Öffnungszeiten in Seengen für Sie an. Neu haben wir auch <strong className="text-accent-burgundy">am Dienstag Nachmittag</strong> geöffnet!
          </p>

          <div className="bg-warmwhite-light p-4 rounded-xl border border-taupe-light/60 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-taupe-light/40">
              <span className="text-graphite/70">Montag</span>
              <span className="font-medium text-graphite-dark">Geschlossen</span>
            </div>
            <div className="flex justify-between py-1 border-b border-taupe-light/40 bg-accent-burgundy/5 px-2 rounded">
              <span className="font-semibold text-accent-burgundy flex items-center gap-1">
                Dienstag <span className="text-[10px] bg-accent-burgundy text-white px-1.5 py-0.5 rounded-full font-sans">NEU</span>
              </span>
              <span className="font-bold text-accent-burgundy">13:30 – 18:30 Uhr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-taupe-light/40">
              <span className="text-graphite/70">Mittwoch</span>
              <span className="font-medium text-graphite-dark">13:30 – 18:30 Uhr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-taupe-light/40">
              <span className="text-graphite/70">Donnerstag</span>
              <span className="font-medium text-graphite-dark">13:30 – 18:30 Uhr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-taupe-light/40">
              <span className="text-graphite/70">Freitag</span>
              <span className="font-medium text-graphite-dark">09:00 – 12:00 | 13:30 – 18:30 Uhr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-taupe-light/40">
              <span className="text-graphite/70">Samstag</span>
              <span className="font-medium text-graphite-dark">09:00 – 14:00 Uhr</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-graphite/70">Sonntag</span>
              <span className="font-medium text-graphite-dark">Geschlossen</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-accent-burgundy hover:bg-wine-dark text-white font-medium text-sm rounded-xl shadow-md transition-colors"
            >
              Verstanden & Schliessen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
