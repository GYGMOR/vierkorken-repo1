'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { getUnclaimedGifts, claimGift } from '@/app/admin/actions/loyalty';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from '@/components/effects/Confetti'; // Assuming this exists or I will create a simple one or skip

export function LoyaltyGiftPopup() {
    const { data: session } = useSession();
    const { addItem } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [giftGroups, setGiftGroups] = useState<any[]>([]);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            checkGifts(session.user.id);
        }
    }, [session]);

    const checkGifts = async (userId: string) => {
        const result = await getUnclaimedGifts(userId);
        if (result.giftsByLevel && result.giftsByLevel.length > 0) {
            setGiftGroups(result.giftsByLevel);
            setIsOpen(true);
        }
    };

    const handleClaim = async (gift: any) => {
        if (!session?.user?.id) return;
        setLoading(true);

        const currentGroup = giftGroups[currentGroupIndex];

        // Server Action
        const result = await claimGift(session.user.id, currentGroup.level, gift.id);

        if (result.success) {
            // Add to cart
            addItem({
                id: `gift-${gift.id}`,
                name: gift.productDetails?.cartName || gift.name,
                price: 0,
                imageUrl: gift.image,
                type: 'wine',
                winery: gift.productDetails?.winery || 'Loyalty Gift',
                slug: gift.productDetails?.slug,
                vintage: gift.productDetails?.vintage,
            });

            // Show next or close
            if (currentGroupIndex < giftGroups.length - 1) {
                setCurrentGroupIndex(prev => prev + 1);
            } else {
                setIsOpen(false);
            }
        } else {
            alert('Fehler beim Einlösen des Geschenks. Bitte versuchen Sie es später erneut.');
        }
        setLoading(false);
    };

    if (!isOpen || giftGroups.length === 0) return null;

    const currentGroup = giftGroups[currentGroupIndex];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {/* Golden animated border container */}
            <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Animated Border */}
                <div className="absolute inset-0 z-0 p-[2px] rounded-xl bg-gradient-to-r from-accent-gold via-yellow-200 to-accent-gold animate-shimmer bg-[length:200%_100%]">
                    <div className="absolute inset-[2px] bg-white rounded-xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center p-8 md:p-12 text-center">
                    <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-accent-gold to-accent-burgundy flex items-center justify-center text-white font-serif text-4xl shadow-lg">
                        {currentGroup.level}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-serif text-graphite-dark mb-2">
                        Herzlichen Glückwunsch!
                    </h2>
                    <p className="text-xl text-accent-burgundy font-medium mb-8">
                        Sie haben Level {currentGroup.level} erreicht
                    </p>
                    <p className="text-graphite/70 mb-8 max-w-2xl">
                        Als Dankeschön für Ihre Treue dürfen Sie sich eines der folgenden Geschenke aussuchen.
                        Es wird kostenlos Ihrem Warenkorb hinzugefügt.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {currentGroup.gifts.map((gift: any) => (
                            <button
                                key={gift.id}
                                onClick={() => handleClaim(gift)}
                                disabled={loading}
                                className="group relative flex flex-col items-center p-4 rounded-lg border-2 border-transparent hover:border-accent-gold/50 hover:bg-warmwhite-light transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden bg-gray-100">
                                    {gift.image ? (
                                        <Image
                                            src={gift.image}
                                            alt={gift.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4" /></svg>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-accent-gold text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                        GRATIS
                                    </div>
                                </div>
                                <h3 className="font-serif text-lg text-graphite-dark group-hover:text-accent-burgundy transition-colors">
                                    {gift.name}
                                </h3>
                                <p className="text-sm text-graphite/60 mt-1 line-clamp-2">
                                    {gift.description}
                                </p>
                                <div className="mt-4 px-6 py-2 bg-graphite text-white rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    Auswählen
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 text-xs text-graphite/40">
                        * Das Geschenk wird Ihrem Warenkorb hinzugefügt und ist beim Checkout kostenlos.
                    </div>
                </div>
            </div>
        </div>
    );
}
