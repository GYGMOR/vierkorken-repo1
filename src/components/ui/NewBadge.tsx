
import React from 'react';

interface NewBadgeProps {
    className?: string;
}

export function NewBadge({ className = '' }: NewBadgeProps) {
    return (
        <div className={`relative flex items-center justify-center w-14 h-14 ${className}`}>
            {/* Star Shape SVG - Gold Starburst */}
            <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-[#D4AF37] drop-shadow-md"
                fill="currentColor"
            >
                {/* 12-point starburst */}
                <path d="M12,0 L14.5,4.5 L19.5,4.5 L17,8.5 L19.5,13 L15,14.5 L12,19 L9,14.5 L4.5,13 L7,8.5 L4.5,4.5 L9.5,4.5 Z" transform="scale(1.1) translate(-1, -1)" />
                {/* Alternative jagged "sticker" shape */}
                <path d="M12 2.5L14.8 5.8L19 5.2L19.2 9.5L23 11.5L20.5 15L22 19L17.8 19.8L16.5 23.8L12.5 21.5L8.5 23.8L7.2 19.8L3 19L4.5 15L2 11.5L5.8 9.5L6 5.2L10.2 5.8L12 2.5Z" />
            </svg>
            {/* "NEU" Text */}
            <span className="absolute text-white font-bold text-[10px] tracking-widest pt-0.5">
                NEU
            </span>
        </div>
    );
}
