'use client';

import { useState, FormEvent } from 'react';

interface NewsletterSignupProps {
  onSuccess?: (email: string) => void;
  className?: string;
}

export function NewsletterSignup({ onSuccess, className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate consent
    if (!consent) {
      setMessage({
        type: 'error',
        text: 'Bitte akzeptieren Sie die Datenschutzbestimmungen.',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, source: 'homepage' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Vielen Dank! Sie erhalten eine Bestätigung per E-Mail.',
        });
        setEmail('');
        setConsent(false);

        // Call onSuccess callback to trigger AccountCreationModal
        if (onSuccess) {
          onSuccess(email);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Ein Fehler ist aufgetreten.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Verbindungsfehler. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`newsletter-signup ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-graphite-dark mb-2">
            E-Mail-Adresse
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihre@email.ch"
            className="input w-full"
            disabled={loading}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2">
          <input
            id="newsletter-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 text-accent-burgundy border-graphite-light rounded focus:ring-accent-burgundy"
            disabled={loading}
          />
          <label htmlFor="newsletter-consent" className="text-sm text-graphite">
            Ich akzeptiere die{' '}
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-burgundy hover:text-accent-burgundy/80 underline"
            >
              Datenschutzbestimmungen
            </a>{' '}
            und möchte den Newsletter erhalten.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !consent}
          className="w-full bg-accent-burgundy hover:bg-accent-burgundy/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Wird abonniert...' : 'Newsletter abonnieren'}
        </button>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
