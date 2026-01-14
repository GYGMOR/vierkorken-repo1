'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

function VerifyCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkVerificationStatus = async () => {
      // Get verification session ID from URL
      const verificationSessionId = searchParams.get('verification_session');

      if (!verificationSessionId) {
        setStatus('error');
        setErrorMessage('Keine Verifizierungs-Session gefunden');
        return;
      }

      try {
        console.log('🔍 Checking verification status...');

        // Check the verification status
        const response = await fetch(
          `/api/checkout/verify-status?sessionId=${verificationSessionId}`
        );

        const data = await response.json();
        console.log('📊 Verification result:', data);

        if (data.success && data.verified) {
          console.log('✅ Verification successful!');
          setStatus('success');

          // Store verification success in localStorage
          localStorage.setItem('identityVerified', 'true');
          localStorage.setItem('verificationSessionId', verificationSessionId);

          // Redirect back to checkout after 2 seconds
          setTimeout(() => {
            console.log('↩️ Redirecting to checkout...');
            router.push('/checkout?verified=true');
          }, 2000);

        } else if (data.status === 'requires_input') {
          // User cancelled or hasn't completed yet
          setStatus('error');
          setErrorMessage('Die Verifizierung wurde noch nicht abgeschlossen. Bitte versuchen Sie es erneut.');
        } else {
          // Verification failed
          setStatus('error');
          setErrorMessage(
            data.lastError?.reason ||
            'Die Verifizierung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.'
          );
        }

      } catch (error: any) {
        console.error('❌ Error checking verification:', error);
        setStatus('error');
        setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    };

    checkVerificationStatus();
  }, [searchParams, router]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Identitätsprüfung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {status === 'checking' && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
                    <p className="text-body text-graphite">
                      Ihre Identität wird überprüft...
                    </p>
                    <p className="text-body-sm text-graphite/60 mt-2">
                      Bitte warten Sie einen Moment
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-h3 font-serif text-graphite-dark mb-2">
                      Verifizierung erfolgreich!
                    </h3>
                    <p className="text-body text-graphite mb-4">
                      Ihre Identität wurde erfolgreich bestätigt.
                    </p>
                    <p className="text-body-sm text-graphite/60">
                      Sie werden automatisch zur Zahlung weitergeleitet...
                    </p>
                    <div className="mt-6">
                      <div className="animate-pulse flex justify-center gap-2">
                        <div className="w-2 h-2 bg-accent-burgundy rounded-full"></div>
                        <div className="w-2 h-2 bg-accent-burgundy rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-accent-burgundy rounded-full animation-delay-400"></div>
                      </div>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-h3 font-serif text-graphite-dark mb-2">
                      Verifizierung fehlgeschlagen
                    </h3>
                    <p className="text-body text-graphite mb-6">
                      {errorMessage}
                    </p>
                    <button
                      onClick={() => router.push('/checkout')}
                      className="btn btn-primary"
                    >
                      Zurück zum Checkout
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function VerifyCompletePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen bg-warmwhite py-12">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Identitätsprüfung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
                    <p className="text-body text-graphite">
                      Lädt...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <VerifyCompleteContent />
    </Suspense>
  );
}
