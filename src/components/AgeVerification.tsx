'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function AgeVerification() {
  const [isOpen, setIsOpen] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);

  useEffect(() => {
    // Check if user has already verified age in this session
    const hasVerified = sessionStorage.getItem('ageVerified');
    if (!hasVerified) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!agbAccepted) {
      alert('Bitte bestätigen Sie, dass Sie die AGB gelesen haben.');
      return;
    }
    // Save verification in session storage (expires when browser is closed)
    sessionStorage.setItem('ageVerified', 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-graphite-darker/80 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      ></div>

      {/* Modal */}
      <div className="relative bg-warmwhite rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in">
        {/* Wine Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-burgundy to-accent-burgundy/70 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z" />
            </svg>
          </div>
        </div>

        <h2 className="text-h3 font-serif text-center text-graphite-dark mb-4">
          Altersbest ätigung
        </h2>

        <p className="text-center text-graphite mb-6">
          Diese Website enthält alkoholische Getränke. Bitte bestätigen Sie, dass Sie mindestens <strong>18 Jahre alt</strong> sind.
        </p>

        {/* AGB Checkbox */}
        <div className="mb-6 p-4 bg-rose-light/20 rounded-lg border border-taupe-light">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agbAccepted}
              onChange={(e) => setAgbAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 accent-accent-burgundy cursor-pointer"
            />
            <span className="text-sm text-graphite">
              Ich bestätige, dass ich die{' '}
              <Link
                href="/agb"
                className="text-accent-burgundy hover:underline font-semibold"
                target="_blank"
              >
                Allgemeinen Geschäftsbedingungen (AGB)
              </Link>
              {' '}gelesen habe und akzeptiere.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleDecline}
            className="px-6 py-3 border-2 border-graphite-dark text-graphite-dark rounded-lg hover:bg-graphite-dark hover:text-warmwhite transition-all font-semibold"
          >
            Nein, unter 18
          </button>
          <button
            onClick={handleAccept}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              agbAccepted
                ? 'bg-accent-burgundy text-warmwhite hover:bg-accent-burgundy/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!agbAccepted}
          >
            Ja, über 18
          </button>
        </div>

        <p className="text-xs text-graphite/60 text-center mt-4">
          Verantwortungsvoller Umgang mit Alkohol
        </p>
      </div>
    </div>
  );
}
