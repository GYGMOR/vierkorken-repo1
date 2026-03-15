import { cn } from '@/lib/utils';

export interface FoodPairingProps {
  pairings: string[];
  className?: string;
}

export function FoodPairing({ pairings, className }: FoodPairingProps) {
  if (!pairings || pairings.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-serif text-h4 text-graphite-dark">Food Pairing</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pairings.map((pairing, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 bg-warmwhite-light rounded-lg border border-taupe-light/50"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-light flex items-center justify-center">
              <ForkKnifeIcon className="w-5 h-5 text-graphite-dark" />
            </div>
            <p className="text-body text-graphite">{pairing}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForkKnifeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 3v12m0 0l-3 6m3-6l3 6m6-12a3 3 0 11-6 0V3h6v6z"
      />
    </svg>
  );
}
