'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Gift {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  pointsRequired: number;
}

interface GiftRedemptionSectionProps {
  gifts: Gift[];
  userPoints: number;
  isLoggedIn: boolean;
}

export function GiftRedemptionSection({ gifts, userPoints, isLoggedIn }: GiftRedemptionSectionProps) {
  const handleRedeem = (gift: Gift) => {
    // TODO: Implement real redemption flow
    alert(`Prämie "${gift.name}" wird eingelöst. Bitte wenden Sie sich an unser Personal.`);
  };

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-h2 font-serif font-light text-graphite-dark mb-4">
          Verfügbare Prämien
        </h2>
        <p className="text-body-lg text-graphite">
          Tauschen Sie Ihre gesammelten Punkte gegen fantastische Prämien ein.
        </p>
      </div>

      {gifts.length === 0 ? (
        <div className="text-center py-12 text-graphite/60">
          <p>Derzeit sind keine Prämien verfügbar. Schauen Sie bald wieder vorbei!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {gifts.map((gift) => {
            const canAfford = userPoints >= gift.pointsRequired;
            return (
              <Card key={gift.id} className="overflow-hidden border-2 hover:border-accent-gold transition-colors flex flex-col">
                {gift.image && (
                  <div className="w-full h-48 bg-taupe-light/30">
                    <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-graphite-dark">{gift.name}</h3>
                    <span className="bg-accent-gold/10 text-accent-burgundy px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-2">
                      {gift.pointsRequired} PTS
                    </span>
                  </div>
                  <p className="text-sm text-graphite/70 mb-6 flex-1">{gift.description}</p>
                  <Button
                    variant={canAfford && isLoggedIn ? 'primary' : 'secondary'}
                    className="w-full"
                    disabled={!canAfford || !isLoggedIn}
                    onClick={() => handleRedeem(gift)}
                  >
                    {!isLoggedIn
                      ? 'Anmelden zum Einlösen'
                      : canAfford
                      ? 'Prämie einlösen'
                      : `Noch ${gift.pointsRequired - userPoints} Punkte fehlen`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
