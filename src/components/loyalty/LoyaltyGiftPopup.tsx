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
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Demo Mode Support moved inside useEffect to handle client-side logic correctly and prioritize it

    useEffect(() => {
        // Check for demo param purely on client side
        const searchParams = new URLSearchParams(window.location.search);
        const isDemo = searchParams.get('demoLoyalty') === 'true';

        if (isDemo) {
            setIsDemoMode(true);
            // Mock data for demo - SHOW THIS EVEN IF LOGGED IN
            setGiftGroups([{
                level: 3,
                gifts: [
                    { id: 'demo1', name: 'Château Margaux 2015', description: 'Ein exzellenter Jahrgang.', image: '/images/wines/demo1.jpg' },
                    { id: 'demo2', name: 'Opus One 2018', description: 'Kalifornische Perfektion.', image: '/images/wines/demo2.jpg' },
                    { id: 'demo3', name: 'Dom Pérignon 2012', description: 'Champagner der Extraklasse.', image: '/images/wines/demo3.jpg' }
                ]
            }]);
            setIsOpen(true);
            setShowConfetti(true);
            return;
        }

        if (session?.user?.id) {
            checkGifts(session.user.id);
        }
    }, [session]);

    const checkGifts = async (userId: string) => {
        const result = await getUnclaimedGifts(userId);
        if (result.giftsByLevel && result.giftsByLevel.length > 0) {
            setGiftGroups(result.giftsByLevel);
            setIsOpen(true);
            setShowConfetti(true);
        }
    };

    const handleClaim = async (gift: any) => {
        setLoading(true);

        if (isDemoMode) {
            alert('Dies ist eine Demo. Das Geschenk wurde "eingelöst"!');
            setIsOpen(false);
            setLoading(false);
            return;
        }

        if (!session?.user?.id) return;

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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    {showConfetti && <Confetti />}

                    {/* Golden Glow Backdrop */}
                    <div className="absolute inset-0 bg-gradient-radial from-accent-gold/20 via-transparent to-transparent opacity-50 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
                        className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-accent-gold/30"
                    >
                        {/* Shimmering Golden Border */}
                        <div className="absolute inset-0 z-0 p-[3px] rounded-2xl bg-gradient-to-r from-accent-gold via-yellow-200 to-accent-gold animate-shimmer bg-[length:200%_100%]">
                            <div className="absolute inset-[3px] bg-warmwhite rounded-xl" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center p-8 md:p-14 text-center">

                            {/* Level Badge */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-accent-gold via-yellow-400 to-accent-burgundy flex items-center justify-center text-white font-serif text-5xl shadow-strong ring-4 ring-white/50"
                            >
                                {currentGroup.level}
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-yellow-600 to-accent-gold font-bold mb-3 drop-shadow-sm"
                            >
                                Herzlichen Glückwunsch!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-2xl text-graphite-dark font-medium mb-10"
                            >
                                Sie haben Level <span className="text-accent-burgundy font-bold">{currentGroup.level}</span> erreicht
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-graphite/70 mb-12 max-w-2xl text-lg"
                            >
                                Wählen Sie <b>eines</b> der folgenden Exklusiv-Geschenke als Belohnung.
                                <br />Es wird kostenlos Ihrem Warenkorb hinzugefügt.
                            </motion.p>

                            {/* Gift Selection Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                {currentGroup.gifts.map((gift: any, index: number) => (
                                    <motion.button
                                        key={gift.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + (index * 0.15) }}
                                        onClick={() => handleClaim(gift)}
                                        disabled={loading}
                                        className="group relative flex flex-col items-center bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-taupe-light/30 hover:border-accent-gold transform hover:-translate-y-2 hover:scale-105"
                                    >
                                        {/* Gift Image Container */}
                                        <div className="relative w-full aspect-[3/4] mb-5 rounded-lg overflow-hidden bg-gray-50 shadow-inner group-hover:shadow-none transition-all">
                                            {gift.image ? (
                                                <Image
                                                    src={gift.image}
                                                    alt={gift.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-200">
                                                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4" /></svg>
                                                </div>
                                            )}

                                            {/* Flash Effect on Hover */}
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-accent-gold to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                GESCHENK
                                            </div>
                                        </div>

                                        <h3 className="font-serif text-xl text-graphite-dark group-hover:text-accent-burgundy transition-colors font-medium mb-2">
                                            {gift.name}
                                        </h3>
                                        <p className="text-sm text-graphite/60 line-clamp-2 mb-6 px-2">
                                            {gift.description}
                                        </p>

                                        <div className="mt-auto px-8 py-3 bg-graphite text-white rounded-full text-base font-medium group-hover:bg-accent-burgundy transition-colors shadow-md w-full">
                                            Auswählen
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="mt-10 text-sm italic text-graphite/40"
                            >
                                * Nur solange der Vorrat reicht. Änderungen vorbehalten.
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
