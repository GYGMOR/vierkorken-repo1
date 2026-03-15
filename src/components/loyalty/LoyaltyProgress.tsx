import { cn } from '@/lib/utils';
import { getLoyaltyLevelName } from '@/lib/utils';

export interface LoyaltyProgressProps {
  currentPoints: number;
  currentLevel: number;
  nextLevelPoints?: number;
  className?: string;
}

const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, max: 499, name: 'Novize' },
  { level: 2, min: 500, max: 1499, name: 'Kellerfreund' },
  { level: 3, min: 1500, max: 4999, name: 'Kenner' },
  { level: 4, min: 5000, max: 11999, name: 'Sommelier-Kreis' },
  { level: 5, min: 12000, max: 24999, name: 'Weinguts-Partner' },
  { level: 6, min: 25000, max: 59999, name: 'Connaisseur-Elite' },
  { level: 7, min: 60000, max: Infinity, name: 'Grand-Cru Ehrenmitglied' },
];

export function LoyaltyProgress({
  currentPoints,
  currentLevel,
  nextLevelPoints,
  className,
}: LoyaltyProgressProps) {
  const currentLevelData = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel);
  const nextLevelData = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);

  if (!currentLevelData) return null;

  // Calculate progress percentage
  const pointsInCurrentLevel = currentPoints - currentLevelData.min;
  const pointsNeededForNextLevel = nextLevelData
    ? nextLevelData.min - currentLevelData.min
    : 0;
  const progressPercentage = nextLevelData
    ? (pointsInCurrentLevel / pointsNeededForNextLevel) * 100
    : 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Level Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-h4 text-graphite-dark">
            {getLoyaltyLevelName(currentLevel)}
          </h3>
          <p className="text-body-sm text-graphite/60 mt-1">
            Level {currentLevel}
          </p>
        </div>

        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent-gold to-accent-burgundy">
          <span className="font-serif text-2xl font-bold text-warmwhite">
            {currentLevel}
          </span>
        </div>
      </div>

      {/* Points Display */}
      <div className="p-4 bg-warmwhite-light rounded-lg border border-taupe-light/50">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl text-graphite-dark">
            {currentPoints.toLocaleString('de-CH')}
          </span>
          <span className="text-body-sm text-graphite/60">Punkte</span>
        </div>
      </div>

      {/* Progress Bar */}
      {nextLevelData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-graphite/70">Fortschritt zum nächsten Level</span>
            <span className="font-medium text-graphite">
              {pointsInCurrentLevel.toLocaleString('de-CH')} /{' '}
              {pointsNeededForNextLevel.toLocaleString('de-CH')}
            </span>
          </div>

          {/* Bar */}
          <div className="relative h-3 bg-warmwhite-dark rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-burgundy via-accent-gold to-accent-burgundy rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>

          <p className="text-body-sm text-graphite/60">
            Noch {(nextLevelData.min - currentPoints).toLocaleString('de-CH')} Punkte bis{' '}
            <span className="font-medium text-graphite-dark">{nextLevelData.name}</span>
          </p>
        </div>
      )}

      {/* Max Level Reached */}
      {currentLevel === 7 && (
        <div className="p-4 bg-gradient-to-br from-accent-gold/10 to-accent-burgundy/10 rounded-lg border border-accent-gold/20">
          <div className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-body text-graphite text-center">
              Herzlichen Glückwunsch! Sie haben das höchste Level erreicht.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
