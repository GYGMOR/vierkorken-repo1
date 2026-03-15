'use client';

import { useEffect, useState } from 'react';
import { CardTitle } from '@/components/ui/Card';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    description?: string;
    children?: React.ReactNode;
}

export function InfoModal({ isOpen, onClose, title, icon, description, children }: InfoModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/40 backdrop-blur-sm opacity-100' : 'bg-black/0 opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-warmwhite to-warmwhite-dark/50 p-6 border-b border-taupe-light/30 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-graphite/40 hover:text-graphite transition-colors rounded-full hover:bg-black/5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex flex-col items-center text-center">
                        {icon && (
                            <div className="mb-4 transform scale-125">
                                {icon}
                            </div>
                        )}
                        <h3 className="font-serif text-2xl text-graphite-dark">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-4">
                    {description ? (
                        <div className="prose prose-sm max-w-none text-graphite/80 leading-relaxed">
                            {description.split('\n').map((paragraph, i) => (
                                <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-graphite/50 italic">Keine Beschreibung verfügbar.</p>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
