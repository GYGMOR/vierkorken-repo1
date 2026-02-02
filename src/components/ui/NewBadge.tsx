
import React from 'react';

interface NewBadgeProps {
    className?: string;
}

export function NewBadge({ className = '' }: NewBadgeProps) {
    return (
        <div className={`relative flex items-center justify-center w-12 h-12 ${className}`}>
            {/* Star Shape SVG */}
            <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-[#556B2F] drop-shadow-sm"
                fill="currentColor"
            >
                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                {/* Do not use complex paths if simple star is preferred, but user asked for "Eckiger stern" (jagged star) */}
                {/* Let's try a polygon for a multi-point star burst similar to "News" stickers */}
                <path d="M12 0L14.6 3.6L19 2.6L19.6 7L24 8.6L22 12.6L24.6 16.4L20.6 18.2L20.4 22.6L16 21.4L13.4 25L10.6 21.4L6.2 22.6L6 18.2L2 16.4L4.6 12.6L2.6 8.6L7 7L7.6 2.6L12 0Z" transform="scale(0.8) translate(3, 3)" />
            </svg>
            {/* "NEU" Text */}
            <span className="absolute text-white font-bold text-[10px] tracking-widest pt-0.5">
                NEU
            </span>
        </div>
    );
}
