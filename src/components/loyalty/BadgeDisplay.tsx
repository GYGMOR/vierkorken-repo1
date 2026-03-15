import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  iconType: string;
  rarity: string;
  earnedAt: Date;
}

export interface BadgeDisplayProps {
  badges: BadgeData[];
  className?: string;
}

export function BadgeDisplay({ badges, className }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-taupe-light/30 mb-4">
          <BadgeIcon className="w-10 h-10 text-taupe" />
        </div>
        <p className="text-body text-graphite/60">
          Noch keine Badges erhalten. Sammeln Sie Badges durch Käufe und Events!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeData }) {
  const rarityColors = {
    common: 'from-taupe-light to-taupe',
    rare: 'from-blue-200 to-blue-400',
    epic: 'from-purple-200 to-purple-400',
    legendary: 'from-accent-gold to-accent-burgundy',
  };

  const bgGradient =
    rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.common;

  return (
    <div className="card p-6 text-center space-y-3 card-hover">
      {/* Icon */}
      <div
        className={cn(
          'inline-flex items-center justify-center w-16 h-16 rounded-full',
          'bg-gradient-to-br',
          bgGradient
        )}
      >
        <BadgeIconType type={badge.iconType} />
      </div>

      {/* Name */}
      <h4 className="font-serif text-body font-semibold text-graphite-dark">
        {badge.name}
      </h4>

      {/* Description */}
      <p className="text-body-sm text-graphite/70 line-clamp-2">
        {badge.description}
      </p>

      {/* Earned Date */}
      <p className="text-xs text-graphite/50">
        Erhalten: {formatDate(badge.earnedAt, 'short')}
      </p>
    </div>
  );
}

// Badge Icon Types (simplified monoline style)
function BadgeIconType({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    'moon-glass': <MoonGlassIcon />,
    'cup-leaf': <CupLeafIcon />,
    'compass-vine': <CompassVineIcon />,
    'time-grape': <TimeGrapeIcon />,
    'ticket-glass': <TicketGlassIcon />,
    'vine-monogram': <VineMonogramIcon />,
  };

  return icons[type] || <BadgeIcon className="w-8 h-8 text-warmwhite" />;
}

// Simplified Badge Icons
function MoonGlassIcon() {
  return (
    <svg className="w-8 h-8 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function CupLeafIcon() {
  return (
    <svg className="w-8 h-8 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z" />
    </svg>
  );
}

function CompassVineIcon() {
  return (
    <svg className="w-8 h-8 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  );
}

function TimeGrapeIcon() {
  return (
    <svg className="w-8 h-8 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TicketGlassIcon() {
  return (
    <svg className="w-8 h-8 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function VineMonogramIcon() {
  return (
    <svg className="w-8 h-8 text-warmwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
