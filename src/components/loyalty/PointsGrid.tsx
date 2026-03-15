'use client';

import { useState } from 'react';
import { LoyaltyProgramRule } from '@prisma/client';
import { InfoModal } from './InfoModal';
import { RuleEditor } from './RuleEditor';

interface PointsGridProps {
    rules: LoyaltyProgramRule[];
    isAdmin: boolean;
}

export function PointsGrid({ rules, isAdmin }: PointsGridProps) {
    const [selectedRule, setSelectedRule] = useState<LoyaltyProgramRule | null>(null);

    return (
        <>
            <div className="grid sm:grid-cols-2 gap-4">
                {rules.map((rule) => {
                    return (
                        <div
                            key={rule.id}
                            className="relative group cursor-pointer transition-transform hover:scale-[1.02]"
                            onClick={() => setSelectedRule(rule)}
                        >
                            {/* Admin Editor - Stop propagation handled inside RuleEditor */}
                            {isAdmin && (
                                <RuleEditor
                                    identifier={rule.identifier}
                                    initialName={rule.name}
                                    initialPoints={rule.points}
                                    initialDescription={rule.description || ''}
                                />
                            )}

                            <PointsCard
                                iconType={rule.icon}
                                label={rule.name}
                                points={rule.points}
                            />
                        </div>
                    );
                })}
            </div>

            <InfoModal
                isOpen={!!selectedRule}
                onClose={() => setSelectedRule(null)}
                title={selectedRule?.name || ''}
                description={selectedRule?.description || ''}
                icon={selectedRule ? <PointsIcon iconType={selectedRule.icon} large /> : null}
            />
        </>
    );
}

function PointsCard({ iconType, label, points }: { iconType: string; label: string; points: string }) {
    return (
        <div className="p-4 bg-warmwhite-light rounded-lg border-2 border-taupe-light shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-light text-graphite-dark">
                    <PointsIcon iconType={iconType} />
                </div>
                <div>
                    <p className="text-body-sm text-graphite/60">{label}</p>
                    <p className="font-medium text-graphite-dark">{points}</p>
                </div>
            </div>
        </div>
    );
}

function PointsIcon({ iconType, large = false }: { iconType: string, large?: boolean }) {
    const className = large ? "w-10 h-10 text-accent-burgundy" : "w-5 h-5";

    const icons: Record<string, React.ReactNode> = {
        cart: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
        review: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        event: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
        referral: (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    };

    return <>{icons[iconType] || icons.cart}</>;
}
