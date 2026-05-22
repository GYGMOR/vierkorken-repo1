'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GiftDetailModal } from './GiftDetailModal';

interface Gift {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  pointsRequired: number;
}

interface SwipeableGiftCardsProps {
  gifts: Gift[];
  userPoints: number;
  isLoggedIn: boolean;
  userId: string;
}

export function SwipeableGiftCards({ gifts, userPoints, isLoggedIn, userId }: SwipeableGiftCardsProps) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  if (gifts.length === 0) {
    return (
      <section>
        <div className="text-center mb-10">
          <h2 className="text-h2 font-serif font-light text-graphite-dark mb-4">Verfügbare Prämien</h2>
        </div>
        <div className="text-center py-12 text-graphite/60">
          <p>Derzeit sind keine Prämien verfügbar. Schauen Sie bald wieder vorbei!</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-h2 font-serif font-light text-graphite-dark mb-3">Verfügbare Prämien</h2>
        <p className="text-body-lg text-graphite">
          Tauschen Sie Ihre Punkte gegen exklusive Prämien ein.
        </p>
        {isLoggedIn && (
          <p className="text-sm text-graphite/60 mt-1">
            Ihr Punktestand: <span className="font-semibold text-accent-burgundy">{userPoints.toLocaleString('de-CH')} PTS</span>
          </p>
        )}
      </div>

      {/* Horizontal scrollable cards */}
      <div className="-mx-4 px-4">
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {gifts.map((gift) => {
            const canAfford = isLoggedIn && userPoints >= gift.pointsRequired;
            return (
              <button
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className="snap-start flex-shrink-0 w-44 sm:w-52 bg-white rounded-2xl shadow-md overflow-hidden border-2 border-transparent hover:border-accent-gold focus:border-accent-gold transition-all active:scale-95 text-left"
              >
                {/* Image */}
                <div className="relative w-full bg-warmwhite-light" style={{ aspectRatio: '3/4' }}>
                  {gift.image ? (
                    <Image
                      src={gift.image}
                      alt={gift.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 176px, 208px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-14 h-14 text-graphite/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  )}
                  {/* Points badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold shadow ${
                    canAfford ? 'bg-accent-gold text-white' : 'bg-graphite/75 text-white'
                  }`}>
                    {gift.pointsRequired.toLocaleString('de-CH')} PTS
                  </div>
                  {/* Affordable indicator */}
                  {canAfford && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Einlösbar
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-3">
                  <p className="font-semibold text-sm text-graphite-dark line-clamp-2 leading-snug">{gift.name}</p>
                  <p className="text-xs text-graphite/50 mt-1 line-clamp-1">{gift.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint for desktop: show scroll indicator if many cards */}
      {gifts.length > 4 && (
        <p className="text-center text-xs text-graphite/40 mt-2">← Wischen für mehr Prämien →</p>
      )}

      {selectedGift && (
        <GiftDetailModal
          gift={selectedGift}
          userPoints={userPoints}
          isLoggedIn={isLoggedIn}
          userId={userId}
          onClose={() => setSelectedGift(null)}
        />
      )}
    </section>
  );
}
