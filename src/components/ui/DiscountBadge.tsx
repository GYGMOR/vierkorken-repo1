import React from 'react';

export function DiscountBadge({ percentage }: { percentage: number }) {
    if (!percentage || percentage <= 0) return null;

    return (
        <div className="flex items-center justify-center w-12 h-12 bg-red-700 text-white rounded-full font-bold shadow-md animate-pulse-slow">
            {percentage}%
        </div>
    );
}
