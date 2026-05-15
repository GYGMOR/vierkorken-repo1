'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [email, setEmail] = useState(emailParam || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return;
    }

    setStatus('loading');
    
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Sie wurden erfolgreich abgemeldet.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Abmeldung fehlgeschlagen.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ein technischer Fehler ist aufgetreten.');
    }
  };

  // Auto-unsubscribe if email is in URL
  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe();
    }
  }, [emailParam]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-taupe-light">
        <CardHeader className="text-center bg-accent-burgundy/5 border-b border-taupe-light">
          <CardTitle className="text-h3 font-serif text-accent-burgundy">
            Newsletter abbestellen
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-10 px-8 text-center">
          {status === 'success' ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-graphite font-medium">{message}</p>
              <p className="text-sm text-graphite-light">
                Es tut uns leid, Sie gehen zu sehen. Sie können sich jederzeit wieder anmelden.
              </p>
              <Button 
                className="w-full mt-4" 
                onClick={() => window.location.href = '/'}
              >
                Zurück zur Startseite
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <p className="text-graphite">
                Möchten Sie sich wirklich von unserem Newsletter abmelden?
              </p>
              
              <div className="text-left">
                <label className="block text-sm font-medium text-graphite mb-1">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.ch"
                  className="w-full px-4 py-2 border border-taupe rounded-lg focus:ring-2 focus:ring-accent-burgundy focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-accent-burgundy hover:bg-accent-burgundy-dark text-white"
                isLoading={status === 'loading'}
              >
                Abmeldung bestätigen
              </Button>
              
              <button 
                type="button"
                onClick={() => window.location.href = '/'}
                className="text-sm text-graphite-light hover:text-accent-burgundy transition-colors"
              >
                Doch nicht abmelden
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </MainLayout>
  );
}
