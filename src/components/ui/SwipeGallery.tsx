'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SwipeGalleryProps {
    images: string[];
}

export function SwipeGallery({ images }: SwipeGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="w-full">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-strong group">
                <Image
                    src={images[currentIndex]}
                    alt={`Gallery image ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 border-[6px] border-white/20 rounded-2xl pointer-events-none"></div>

                {/* Controls */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-graphite rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-graphite rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden transition-all ${currentIndex === idx ? 'ring-2 ring-accent-burgundy ring-offset-2 opacity-100' : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
