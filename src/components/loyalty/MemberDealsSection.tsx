'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Deal {
    id: string;
    title: string;
    description?: string | null;
    image?: string | null;
    originalPrice: number | string;
    dealPrice: number | string;
    dealLabel: string;
    variantId?: string | null;
}

interface MemberDealsSectionProps {
    deals: Deal[];
    isLoggedIn: boolean;
}

function DealCard({ deal, isLoggedIn }: { deal: Deal; isLoggedIn: boolean }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const original = Number(deal.originalPrice);
    const price = Number(deal.dealPrice);
    const discount = original > 0 ? Math.round((1 - price / original) * 100) : 0;

    const handleAddToCart = () => {
        addItem({
            id: `deal-${deal.id}`,
            name: deal.title,
            price,
            imageUrl: deal.image || undefined,
            type: 'divers',
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="group relative bg-white rounded-xl border border-taupe-light/60 overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Image */}
            <div className="relative w-full aspect-[4/3] bg-gray-100">
                {deal.image ? (
                    <Image src={deal.image} alt={deal.title} fill className="object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                        </svg>
                    </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-accent-burgundy text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {deal.dealLabel}
                    </span>
                    {discount > 0 && (
                        <span className="bg-accent-gold text-graphite-dark text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            -{discount}%
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-serif text-base font-medium text-graphite-dark line-clamp-1">{deal.title}</h3>
                {deal.description && (
                    <p className="text-xs text-graphite/60 mt-1 line-clamp-2">{deal.description}</p>
                )}

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-400 line-through">CHF {original.toFixed(2)}</span>
                    <span className="text-lg font-bold text-accent-burgundy">CHF {price.toFixed(2)}</span>
                </div>

                {isLoggedIn ? (
                    <button
                        onClick={handleAddToCart}
                        className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all ${
                            added
                                ? 'bg-green-500 text-white'
                                : 'bg-accent-burgundy text-white hover:bg-accent-burgundy/90'
                        }`}
                    >
                        {added ? '✓ Im Warenkorb' : 'In den Warenkorb'}
                    </button>
                ) : (
                    <Link href="/login" className="block mt-3">
                        <button className="w-full py-2 rounded-lg text-sm font-medium bg-graphite-dark/10 text-graphite-dark hover:bg-graphite-dark/20 transition-colors">
                            Anmelden für Mitglieder-Preis
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export function MemberDealsSection({ deals, isLoggedIn }: MemberDealsSectionProps) {
    if (deals.length === 0) return null;

    return (
        <section>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 mb-3">
                    <span className="text-accent-burgundy font-medium text-sm">MITGLIEDER-AKTIONEN</span>
                </div>
                <h2 className="font-serif text-3xl font-light text-graphite-dark">Exklusive Angebote</h2>
                <p className="text-graphite/70 mt-2 text-sm max-w-md mx-auto">
                    {isLoggedIn
                        ? 'Diese Sonderpreise sind nur für Club-Mitglieder verfügbar.'
                        : 'Melden Sie sich an, um exklusive Mitglieder-Preise zu erhalten.'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} />
                ))}
            </div>
        </section>
    );
}
