'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { createGiftActivation } from '@/app/admin/actions/loyalty';

interface Gift {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  pointsRequired: number;
}

interface GiftDetailModalProps {
  gift: Gift;
  userPoints: number;
  isLoggedIn: boolean;
  userId: string;
  onClose: () => void;
}

export function GiftDetailModal({ gift, userPoints, isLoggedIn, userId, onClose }: GiftDetailModalProps) {
  const canAfford = userPoints >= gift.pointsRequired;
  const [activating, setActivating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(1800);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); setToken(null); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (token && qrRef.current) {
      QRCode.toCanvas(qrRef.current, `VIERKORKEN:GIFT:${token}`, {
        width: 220,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#ffffff' },
      });
    }
  }, [token]);

  const handleActivate = async () => {
    if (!canAfford || !isLoggedIn || !userId) return;
    setActivating(true);
    setError(null);
    const result = await createGiftActivation(userId, gift.id);
    setActivating(false);
    if ('error' in result && result.error) {
      setError(result.error);
    } else if ('token' in result && result.token) {
      setToken(result.token);
      setCountdown(1800);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full h-52 flex-shrink-0 bg-warmwhite-light">
          {gift.image ? (
            <Image src={gift.image} alt={gift.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-20 h-20 text-graphite/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-3 bg-accent-burgundy text-white px-3 py-1 rounded-full font-bold text-sm shadow">
            {gift.pointsRequired.toLocaleString('de-CH')} PTS
          </div>
        </div>

        <div className="p-5 overflow-y-auto">
          <h3 className="font-serif text-2xl text-graphite-dark mb-1">{gift.name}</h3>
          {gift.description && (
            <p className="text-graphite/70 text-sm mb-4">{gift.description}</p>
          )}

          <div className="flex justify-between items-center text-sm mb-5 p-3 bg-warmwhite-light rounded-xl">
            <span className="text-graphite/60">Ihre Punkte</span>
            <span className={`font-bold text-base ${canAfford ? 'text-green-600' : 'text-accent-burgundy'}`}>
              {userPoints.toLocaleString('de-CH')} PTS
            </span>
          </div>

          {token ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100">
                <canvas ref={qrRef} className="rounded-lg" />
              </div>
              <p className="text-sm text-graphite/70 text-center">
                Zeigen Sie diesen QR-Code dem Personal zum Einlösen
              </p>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${countdown < 300 ? 'text-red-600' : 'text-graphite/60'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gültig für {fmt(countdown)} Minuten
              </div>
              <button
                onClick={() => setToken(null)}
                className="text-xs text-graphite/40 underline"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
              )}
              <button
                onClick={handleActivate}
                disabled={!canAfford || !isLoggedIn || activating}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
                  canAfford && isLoggedIn
                    ? 'bg-green-500 hover:bg-green-600 text-white active:scale-95 shadow-md'
                    : 'bg-graphite/15 text-graphite/40 cursor-not-allowed'
                }`}
              >
                {activating
                  ? 'Wird aktiviert...'
                  : !isLoggedIn
                  ? 'Anmelden zum Einlösen'
                  : !canAfford
                  ? `Noch ${(gift.pointsRequired - userPoints).toLocaleString('de-CH')} Punkte fehlen`
                  : 'Aktivieren'}
              </button>
              {!isLoggedIn && (
                <p className="text-center text-xs text-graphite/50 mt-3">
                  <a href="/login" className="underline">Jetzt anmelden</a> um Prämien einzulösen
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
