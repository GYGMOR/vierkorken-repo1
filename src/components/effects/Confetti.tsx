'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function Confetti() {
    useEffect(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#D4B982', '#A41D32', '#FFFFFF'] // Gold, Burgundy, White
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#D4B982', '#A41D32', '#FFFFFF']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }, []);

    return null;
}
