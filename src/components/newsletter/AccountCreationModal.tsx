'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AccountCreationModalProps {
  email: string;
  onClose: () => void;
}

export function AccountCreationModal({ email, onClose }: AccountCreationModalProps) {
  const router = useRouter();

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCreateAccount = () => {
    // Redirect to registration page with pre-filled email
    router.push(`/registrieren?email=${encodeURIComponent(email)}`);
  };

  const handleDecline = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Card */}
      <div
        className="bg-white rounded-lg shadow-strong max-w-md w-full p-6 md:p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-serif text-graphite-dark mb-2">
            Newsletter erfolgreich abonniert!
          </h2>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-accent-gold to-transparent"></div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-graphite text-center leading-relaxed">
            Möchten Sie jetzt einen Account erstellen und exklusive Vorteile als Member genießen?
          </p>

          {/* Benefits List */}
          <ul className="mt-4 space-y-2 text-sm text-graphite">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Treuepunkte sammeln bei jedem Einkauf</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Zugang zu exklusiven Member-Weinen</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Schnellerer Checkout und Bestellverfolgung</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Persönliche Weinempfehlungen</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCreateAccount}
            className="w-full bg-accent-burgundy hover:bg-accent-burgundy/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
          >
            Ja, Account erstellen
          </button>

          <button
            onClick={handleDecline}
            className="w-full bg-white hover:bg-gray-50 text-graphite-dark font-medium py-3 px-6 rounded-lg border border-graphite-light transition-all duration-300"
          >
            Nein, danke
          </button>
        </div>

        {/* Close hint */}
        <p className="text-xs text-graphite-light text-center mt-4">
          Drücken Sie ESC zum Schließen
        </p>
      </div>
    </div>
  );
}
