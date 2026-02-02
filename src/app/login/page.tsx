'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Login successful - redirect to account page
        router.push('/konto');
        router.refresh();
      }
    } catch (err) {
      setError('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
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
            Willkommen zurück
          </h2>
          <p className="mt-2 text-sm md:text-base text-graphite">
            Melden Sie sich bei Ihrem Konto an
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-graphite-dark mb-2">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="ihre@email.ch"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-graphite-dark mb-2">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent-burgundy focus:ring-accent-burgundy border-taupe rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-graphite">
                  Angemeldet bleiben
                </label>
              </div>

              <div className="text-sm">
                <Link href="/passwort-vergessen" className="text-accent-burgundy hover:text-accent-burgundy-dark transition-colors">
                  Passwort vergessen?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Anmeldung...' : 'Anmelden'}
            </Button>
          </form>

          {/* Divider */}
          <div className="divider my-6"></div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-graphite">
              Noch kein Konto?{' '}
              <Link href="/registrieren" className="text-accent-burgundy hover:text-accent-burgundy-dark font-medium transition-colors">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Shop */}
        <div className="text-center">
          <Link href="/" className="text-sm text-graphite hover:text-graphite-dark transition-colors">
            ← Zurück zum Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
