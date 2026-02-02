'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function GiftCardSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [copied, setCopied] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  // Poll to check if coupon is activated (webhook might have delay)
  useEffect(() => {
    if (!code) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/gift-cards/status?code=${code}`);
        const data = await res.json();

        if (data.success && data.isActive) {
          setIsActive(true);
        } else if (checkCount < 10) {
          // Keep polling for up to 30 seconds
          setCheckCount((c) => c + 1);
        } else {
          setIsActive(false);
        }
      } catch (error) {
        console.error('Error checking gift card status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds if not yet active
    const interval = setInterval(() => {
      if (isActive !== true && checkCount < 10) {
        checkStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [code, checkCount, isActive]);

  const copyToClipboard = async () => {
    if (!code) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show the code in an alert as last resort
      alert(`Gutschein-Code: ${code}`);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                {/* Success Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Success Message */}
                <h1 className="text-h2 font-serif font-light text-graphite-dark mb-4">
                  Vielen Dank für Ihren Kauf!
                </h1>
                <p className="text-body-lg text-graphite mb-4">
                  Ihr Geschenkgutschein wurde erfolgreich erstellt und per E-Mail verschickt.
                </p>

                {/* Status indicator */}
                {isActive === null && (
                  <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700">Zahlungsbestätigung wird verarbeitet...</span>
                    </div>
                  </div>
                )}
                {isActive === true && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Gutschein ist aktiv und einsatzbereit!</span>
                    </div>
                  </div>
                )}
                {isActive === false && (
                  <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-yellow-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Verarbeitung dauert etwas länger. E-Mail kommt in Kürze!</span>
                    </div>
                  </div>
                )}

                {/* Coupon Code Display */}
                {code && (
                  <div className="mb-8">
                    <p className="text-body text-graphite mb-3">
                      Gutschein-Code:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="px-6 py-4 bg-accent-burgundy/5 border-2 border-accent-burgundy/20 rounded-lg">
                        <code className="text-h3 font-mono text-accent-burgundy font-semibold">
                          {code}
                        </code>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={copyToClipboard}
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Kopiert!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Kopieren
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-8 text-left">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-900 space-y-2">
                      <p className="font-medium">Nächste Schritte:</p>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Der Gutschein wurde an die angegebene E-Mail-Adresse geschickt</li>
                        <li>Der Code kann beim Checkout eingegeben werden</li>
                        <li>Gültig für 3 Jahre ab Kaufdatum</li>
                        <li>Einlösbar für alle Weine und Events</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/weine">
                    <Button size="lg">
                      Weine entdecken
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="secondary" size="lg">
                      Zur Startseite
                    </Button>
                  </Link>
                </div>

                {/* Support */}
                <div className="mt-8 pt-8 border-t border-taupe-light">
                  <p className="text-body-sm text-graphite">
                    Fragen zu Ihrem Gutschein?{' '}
                    <Link href="/kontakt" className="text-accent-burgundy hover:underline">
                      Kontaktieren Sie uns
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function GiftCardSuccessPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen bg-warmwhite py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
            <p className="mt-4 text-graphite">Laden...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <GiftCardSuccessContent />
    </Suspense>
  );
}
