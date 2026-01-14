'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Cookie preferences
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Set that we're on client side
    setIsClient(true);

    // HIDE banner on legal pages (AGB, Datenschutz, Impressum)
    const currentPath = window.location.pathname;
    const isLegalPage = ['/agb', '/datenschutz', '/impressum'].some(path => currentPath.includes(path));

    if (isLegalPage) {
      console.log('Legal page detected, hiding banner');
      setShowBanner(false);
      return;
    }

    // Check if user has already made a choice
    try {
      const consent = localStorage.getItem('vierkorken-cookie-consent');
      console.log('Cookie consent found:', consent); // Debug log
      if (!consent) {
        // Small delay for better UX
        setTimeout(() => {
          setShowBanner(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
      // If localStorage fails, show banner
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('vierkorken-cookie-consent', JSON.stringify(consentData));
      console.log('Saved consent (all):', consentData); // Debug log
      setShowBanner(false);
      // Here you would initialize analytics/marketing scripts
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const acceptNecessary = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('vierkorken-cookie-consent', JSON.stringify(consentData));
      console.log('Saved consent (necessary):', consentData); // Debug log
      setShowBanner(false);
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const savePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('vierkorken-cookie-consent', JSON.stringify(consentData));
      console.log('Saved consent (preferences):', consentData); // Debug log
      setShowBanner(false);
      setShowSettings(false);
      // Initialize scripts based on preferences
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-warmwhite rounded-xl sm:rounded-2xl shadow-strong border-2 border-wine/20 overflow-hidden">
            {!showSettings ? (
              // Main Banner
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Icon & Text */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Cookie Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-wine/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-h4 font-serif font-light text-wine-dark mb-1 sm:mb-2">
                          Wir schätzen Ihre Privatsphäre
                        </h3>
                        <p className="text-graphite/80 text-xs sm:text-sm lg:text-base leading-relaxed mb-3 sm:mb-4">
                          Wir verwenden Cookies, um Ihnen ein optimales Einkaufserlebnis zu bieten und unsere Website zu verbessern.
                          Einige Cookies sind notwendig für die Funktionalität, andere helfen uns, Inhalte und Anzeigen zu personalisieren.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href="/datenschutz"
                            className="text-wine text-sm font-medium hover:underline inline-flex items-center gap-1"
                          >
                            Datenschutzerklärung
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <span className="text-graphite/40">•</span>
                          <button
                            onClick={() => setShowSettings(true)}
                            className="text-wine text-sm font-medium hover:underline"
                          >
                            Cookie-Einstellungen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col lg:w-48">
                    <button
                      onClick={acceptAll}
                      className="btn btn-primary w-full justify-center text-sm sm:text-base py-2 sm:py-3"
                    >
                      Alle akzeptieren
                    </button>
                    <button
                      onClick={acceptNecessary}
                      className="btn btn-secondary w-full justify-center text-sm sm:text-base py-2 sm:py-3"
                    >
                      Nur notwendige
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Settings Panel
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-h4 font-serif font-light text-wine-dark">
                      Cookie-Einstellungen
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-graphite hover:text-wine transition-colors"
                      aria-label="Schließen"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-graphite/80 text-xs sm:text-sm">
                    Wählen Sie, welche Cookies Sie zulassen möchten. Sie können diese Einstellungen jederzeit ändern.
                  </p>

                  {/* Cookie Categories */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* Necessary Cookies */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-warmwhite-light rounded-lg border border-taupe-light">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                          <h4 className="font-medium text-sm sm:text-base text-graphite-dark">Notwendige Cookies</h4>
                          <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-wine/10 text-wine rounded-full">Erforderlich</span>
                        </div>
                        <p className="text-xs sm:text-sm text-graphite/70">
                          Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-11 h-6 bg-wine rounded-full relative cursor-not-allowed opacity-50">
                          <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-warmwhite rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-warmwhite-light rounded-lg border border-taupe-light">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base text-graphite-dark mb-0.5 sm:mb-1">Analyse-Cookies</h4>
                        <p className="text-xs sm:text-sm text-graphite/70">
                          Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.
                        </p>
                      </div>
                      <label className="flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-taupe-light rounded-full peer-checked:bg-wine transition-colors relative peer-checked:[&>div]:translate-x-5">
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-warmwhite rounded-full transition-transform"></div>
                        </div>
                      </label>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-warmwhite-light rounded-lg border border-taupe-light">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base text-graphite-dark mb-0.5 sm:mb-1">Marketing-Cookies</h4>
                        <p className="text-xs sm:text-sm text-graphite/70">
                          Diese Cookies werden verwendet, um Ihnen relevante Werbung und Angebote zu zeigen.
                        </p>
                      </div>
                      <label className="flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-taupe-light rounded-full peer-checked:bg-wine transition-colors relative peer-checked:[&>div]:translate-x-5">
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-warmwhite rounded-full transition-transform"></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-taupe-light">
                    <button
                      onClick={savePreferences}
                      className="btn btn-primary flex-1 justify-center text-sm sm:text-base py-2 sm:py-3"
                    >
                      Auswahl speichern
                    </button>
                    <button
                      onClick={acceptAll}
                      className="btn btn-secondary flex-1 justify-center text-sm sm:text-base py-2 sm:py-3"
                    >
                      Alle akzeptieren
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
