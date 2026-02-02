'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors([]);

    // Validation
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    if (!token) {
      setError('Ungültiger oder fehlender Token');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        }
        setError(data.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-graphite-dark">
              Ungültiger Link
            </h2>
            <p className="mt-4 text-sm md:text-base text-graphite">
              Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.
            </p>
            <div className="mt-6">
              <Link href="/passwort-vergessen">
                <Button>Neuen Link anfordern</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warmwhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl font-light text-graphite-dark hover:text-graphite transition-colors">
            VIER KORKEN
          </Link>
          <h2 className="mt-6 text-2xl md:text-3xl font-serif font-light text-graphite-dark">
            Neues Passwort setzen
          </h2>
          <p className="mt-2 text-sm md:text-base text-graphite">
            Geben Sie Ihr neues Passwort ein
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 md:p-8">
          {success ? (
            // Success state
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                ✓ Passwort erfolgreich zurückgesetzt!
              </div>
              <p className="text-center text-sm text-graphite">
                Sie werden in wenigen Sekunden zur Anmeldeseite weitergeleitet...
              </p>
              <Link href="/login">
                <Button className="w-full">
                  Jetzt anmelden
                </Button>
              </Link>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                  {errors.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-xs">
                      {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Password */}
              <Input
                label="Neues Passwort"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              {/* Confirm Password */}
              <Input
                label="Passwort bestätigen"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              {/* Password requirements */}
              <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-xs text-blue-900">
                <p className="font-medium mb-2">Passwort-Anforderungen:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mindestens 8 Zeichen</li>
                  <li>Mindestens ein Grossbuchstabe</li>
                  <li>Mindestens ein Kleinbuchstabe</li>
                  <li>Mindestens eine Zahl</li>
                  <li>Mindestens ein Sonderzeichen</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Wird gespeichert...' : 'Passwort zurücksetzen'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
          <p className="mt-4 text-graphite">Laden...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
