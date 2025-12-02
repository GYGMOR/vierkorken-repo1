import { cn } from '@/lib/utils';

export interface SensorikProfileProps {
  dryness?: number; // 1-10 (1=sweet, 10=dry)
  body?: number; // 1-10 (1=light, 10=full)
  acidity?: number; // 1-10 (1=soft, 10=vibrant)
  tannin?: number; // 1-10 (1=soft, 10=firm)
  className?: string;
}

export function SensorikProfile({
  dryness,
  body,
  acidity,
  tannin,
  className,
}: SensorikProfileProps) {
  const profiles = [
    {
      label: 'Trockenheit',
      value: dryness,
      min: 'Süß',
      max: 'Trocken',
      show: dryness !== undefined,
    },
    {
      label: 'Körper',
      value: body,
      min: 'Leicht',
      max: 'Voll',
      show: body !== undefined,
    },
    {
      label: 'Säure',
      value: acidity,
      min: 'Mild',
      max: 'Lebhaft',
      show: acidity !== undefined,
    },
    {
      label: 'Tannin',
      value: tannin,
      min: 'Weich',
      max: 'Präsent',
      show: tannin !== undefined,
    },
  ];

  const visibleProfiles = profiles.filter((p) => p.show);

  if (visibleProfiles.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="font-serif text-h4 text-graphite-dark">Sensorikprofil</h3>

      <div className="space-y-4">
        {visibleProfiles.map((profile) => (
          <ProfileBar
            key={profile.label}
            label={profile.label}
            value={profile.value!}
            minLabel={profile.min}
            maxLabel={profile.max}
          />
        ))}
      </div>
    </div>
  );
}

interface ProfileBarProps {
  label: string;
  value: number; // 1-10
  minLabel: string;
  maxLabel: string;
}

function ProfileBar({ label, value, minLabel, maxLabel }: ProfileBarProps) {
  // Convert 1-10 to percentage
  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-body-sm">
        <span className="font-medium text-graphite">{label}</span>
        <span className="text-graphite/60">{value}/10</span>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-warmwhite-dark rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-burgundy to-accent-gold rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-graphite/50">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
