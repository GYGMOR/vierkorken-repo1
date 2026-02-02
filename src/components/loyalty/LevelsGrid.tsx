'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LevelEditor } from './LevelEditor';
import { InfoModal } from './InfoModal';

// Helper function needed here too
function getLevelColor(level: number): string {
    switch (level) {
        case 1: return 'from-taupe-light to-taupe';
        case 2: return 'from-sand to-sand-medium';
        case 3: return 'from-rose-medium to-rose-deep';
        case 4: return 'from-wine/50 to-wine/70';
        case 5: return 'from-wine/70 to-wine';
        case 6: return 'from-accent-gold/60 to-accent-gold/80';
        case 7: return 'from-accent-gold to-wine';
        default: return 'from-taupe-light to-taupe';
    }
}

interface LevelsGridProps {
    levels: any[]; // Using any[] for simplicity to match Prisma type passed down
    currentLevel: number;
    isAdmin: boolean;
}

export function LevelsGrid({ levels, currentLevel, isAdmin }: LevelsGridProps) {
    const [selectedLevel, setSelectedLevel] = useState<any | null>(null);

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map((level) => {
                    const isCurrent = level.level === currentLevel;
                    // Ensure benefits is an array
                    const benefits = Array.isArray(level.benefits) ? level.benefits as string[] : [];
                    const pointsDisplay = level.maxPoints
                        ? `${level.minPoints.toLocaleString('de-CH')}–${level.maxPoints.toLocaleString('de-CH')}`
                        : `${level.minPoints.toLocaleString('de-CH')}+`;

                    return (
                        <div
                            key={level.level}
                            onClick={() => setSelectedLevel(level)}
                            className="cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                            <Card
                                hover
                                className={`relative group h-full ${isCurrent ? 'ring-2 ring-accent-burgundy border-2 border-taupe-light shadow-lg' : 'border-2 border-taupe-light shadow-lg'}`}
                            >
                                {/* ADMIN EDITOR */}
                                {isAdmin && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <LevelEditor
                                            level={level.level}
                                            initialName={level.name}
                                            initialBenefits={benefits}
                                            initialDescription={level.description || ''}
                                        />
                                    </div>
                                )}

                                <CardHeader>
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(level.level)} text-warmwhite`}
                                        >
                                            <span className="font-serif text-2xl font-bold">
                                                {level.level}
                                            </span>
                                        </div>
                                        {isCurrent && (
                                            <Badge variant="accent" className="text-xs">
                                                Aktuell
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle>{level.name}</CardTitle>
                                    <div className="space-y-1 mt-2">
                                        <p className="text-body-sm text-graphite/60">
                                            {pointsDisplay} Punkte
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {benefits.slice(0, 3).map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2 text-body-sm text-graphite">
                                                <CheckIcon className="w-5 h-5 text-accent-burgundy flex-shrink-0 mt-0.5" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                        {benefits.length > 3 && (
                                            <li className="text-xs text-graphite/60 italic pt-1">
                                                + {benefits.length - 3} weitere Vorteile...
                                            </li>
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>

            <InfoModal
                isOpen={!!selectedLevel}
                onClose={() => setSelectedLevel(null)}
                title={selectedLevel?.name || ''}
                description={selectedLevel?.description || ''}
                icon={
                    selectedLevel ? (
                        <div
                            className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getLevelColor(selectedLevel.level)} text-warmwhite shadow-lg`}
                        >
                            <span className="font-serif text-3xl font-bold">
                                {selectedLevel.level}
                            </span>
                        </div>
                    ) : null
                }
            >
                {selectedLevel && (
                    <div className="mt-4 border-t border-taupe-light pt-4">
                        <h4 className="font-medium text-graphite-dark mb-3">Vorteile auf diesem Level:</h4>
                        <ul className="space-y-3">
                            {(Array.isArray(selectedLevel.benefits) ? selectedLevel.benefits : []).map((benefit: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-body text-graphite">
                                    <div className="mt-1 bg-accent-burgundy/10 p-1 rounded-full">
                                        <CheckIcon className="w-4 h-4 text-accent-burgundy" />
                                    </div>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </InfoModal>
        </>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );
}
