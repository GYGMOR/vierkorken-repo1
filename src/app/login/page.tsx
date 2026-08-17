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

  const [showPassword, setShowPassword] = useState(false);

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
            Vier Korken Wein-Boutique
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/60 hover:text-graphite transition-colors p-1"
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.133 10.133 0 013.122-.463c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-8.158-8.158a3 3 0 104.243 4.243m-4.243-4.243L3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
