'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    subscribeNewsletter: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email from URL parameter (from newsletter signup)
  useEffect(() => {
    const prefilledEmail = searchParams.get('email');
    if (prefilledEmail) {
      setFormData(prev => ({ ...prev, email: prefilledEmail }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Bitte akzeptieren Sie die AGB.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          subscribeNewsletter: formData.subscribeNewsletter,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen');
        return;
      }

      // Registration successful - auto-login
      const loginResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginResult?.ok) {
        // Login successful - redirect to account page
        router.push('/konto');
        router.refresh();
      } else {
        // Registration successful but auto-login failed - redirect to login
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
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
            Konto erstellen
          </h2>
          <p className="mt-2 text-sm md:text-base text-graphite">
            Werden Sie Teil unserer Weingemeinschaft
          </p>
        </div>

        {/* Register Form */}
        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-graphite-dark mb-2">
                  Vorname
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Max"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-graphite-dark mb-2">
                  Nachname
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Müller"
                />
              </div>
            </div>

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
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="max.mueller@email.ch"
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                placeholder="Mindestens 8 Zeichen"
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-graphite-dark mb-2">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                placeholder="Passwort wiederholen"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-accent-burgundy focus:ring-accent-burgundy border-taupe rounded mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-graphite">
                Ich akzeptiere die{' '}
                <Link href="/agb" className="text-accent-burgundy hover:text-accent-burgundy-dark">
                  AGB
                </Link>
                {' '}und{' '}
                <Link href="/datenschutz" className="text-accent-burgundy hover:text-accent-burgundy-dark">
                  Datenschutzbestimmungen
                </Link>
              </label>
            </div>

            {/* Newsletter Subscription (Optional) */}
            <div className="flex items-start">
              <input
                id="subscribeNewsletter"
                name="subscribeNewsletter"
                type="checkbox"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
                className="h-4 w-4 text-accent-burgundy focus:ring-accent-burgundy border-taupe rounded mt-1"
              />
              <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-graphite">
                <span className="font-medium">Newsletter abonnieren (optional)</span> - Erhalten Sie exklusive Angebote, Neuigkeiten und Wein-Empfehlungen.
                <span className="text-accent-gold font-medium"> +50 Treuepunkte</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Registrierung läuft...' : 'Konto erstellen'}
            </Button>
          </form>

          {/* Divider */}
          <div className="divider my-6"></div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-graphite">
              Bereits ein Konto?{' '}
              <Link href="/login" className="text-accent-burgundy hover:text-accent-burgundy-dark font-medium transition-colors">
                Jetzt anmelden
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="text-graphite">Lädt...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
