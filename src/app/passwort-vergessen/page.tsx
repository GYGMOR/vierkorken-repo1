'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail(''); // Clear form
      } else {
        setError(data.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmwhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl font-light text-graphite-dark hover:text-graphite transition-colors">
            VIER KORKEN
          </Link>
          <h2 className="mt-6 text-2xl md:text-3xl font-serif font-light text-graphite-dark">
            Passwort vergessen?
          </h2>
          <p className="mt-2 text-sm md:text-base text-graphite">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 md:p-8">
          {message ? (
            // Success state
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
              <div className="text-center space-y-4">
                <p className="text-sm text-graphite">
                  Überprüfen Sie Ihr E-Mail-Postfach und folgen Sie den Anweisungen.
                </p>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Zurück zur Anmeldung
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <Input
                label="E-Mail-Adresse"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.ch"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden'}
              </Button>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/login" className="text-sm text-graphite hover:text-graphite-dark transition-colors">
            ← Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  );
}
