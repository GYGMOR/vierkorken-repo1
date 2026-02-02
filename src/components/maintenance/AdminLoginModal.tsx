'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';

interface AdminLoginModalProps {
  onClose: () => void;
}

export function AdminLoginModal({ onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ungültige Anmeldedaten');
      } else if (result?.ok) {
        // Login successful - reload page (middleware will check admin status)
        window.location.reload();
      }
    } catch (err) {
      setError('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-strong max-w-md w-full mx-4 p-6 md:p-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-light text-graphite-dark">
            Admin Login
          </h2>
          <button
            onClick={onClose}
            className="text-graphite hover:text-graphite-dark transition-colors p-1"
            aria-label="Schließen"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-graphite-dark mb-2">
              E-Mail
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="admin@vierkorken.ch"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-graphite-dark mb-2">
              Passwort
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-burgundy hover:bg-accent-burgundy/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Anmeldung...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-taupe-light">
          <p className="text-xs text-graphite-light text-center">
            Nur für autorisierte Administratoren
          </p>
        </div>
      </div>
    </div>
  );
}
