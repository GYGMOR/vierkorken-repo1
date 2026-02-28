import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

// Simple Icons since they are currently inline in page.tsx
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg
        className={className || "w-4 h-4 text-wine"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
    </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
    <svg
        className={className || "w-4 h-4 text-wine"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
    <svg
        className={className || "w-4 h-4 text-wine mt-1 flex-shrink-0"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
    </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
    <svg
        className={className || "w-4 h-4 text-wine/70"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
    </svg>
);

export function EventCard({ event, isAdmin, onEdit }: { event: any; isAdmin?: boolean; onEdit?: (e: React.MouseEvent) => void }) {
    const { addItem } = useCart();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const spotsLeft = event.capacity - event.booked;
    const isAlmostFull = spotsLeft <= 5;

    // Description truncation logic
    const maxLength = 150;
    const shouldTruncate = event.description && event.description.length > maxLength;
    const displayText = isExpanded || !shouldTruncate
        ? event.description
        : event.description?.slice(0, maxLength) + '...';

    const handleBooking = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowBookingModal(true);
        setError(null);
    };

    const toggleDescription = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleAddToCart = () => {
        if (ticketQuantity > spotsLeft) {
            setError(`Nur noch ${spotsLeft} Plätze verfügbar!`);
            return;
        }

        if (ticketQuantity < 1) {
            setError('Mindestens 1 Ticket erforderlich');
            return;
        }

        // Add each ticket separately to cart with capacity info
        for (let i = 0; i < ticketQuantity; i++) {
            addItem({
                id: `${event.id}-${Date.now()}-${i}`,
                name: event.title,
                price: event.memberPrice || event.price,
                type: 'event',
                slug: event.slug,
                eventDate: `${event.date} ${event.time}`,
                imageUrl: event.image,
                maxCapacity: event.capacity,
                currentCapacity: event.booked,
            });
        }

        setShowBookingModal(false);
        setTicketQuantity(1);
    };

    return (
        <>
            <Link href={`/events/${event.slug}`} className="block h-full group relative">
                {/* Admin Edit Button */}
                {isAdmin && onEdit && (
                    <button
                        onClick={onEdit}
                        className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur text-graphite hover:text-accent-burgundy rounded-full shadow-md border border-taupe-light transition-colors"
                        title="Event bearbeiten"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}

                <Card hover className="overflow-hidden h-full">
                    {/* Event Image */}
                    <div className="relative h-48 bg-gradient-to-br from-wood-light/40 to-wine/10 overflow-hidden">
                        {event.image && event.image !== '/events/default.jpg' ? (
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('❌ Image failed to load:', event.image);
                                    e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => console.log('✅ Image loaded:', event.image)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <CalendarIcon className="w-16 h-16 text-wine/30" />
                            </div>
                        )}
                    </div>

                    <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {event.type}
                                </Badge>
                                {event.status === 'DRAFT' && (
                                    <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-xs text-white">
                                        ENTWURF
                                    </Badge>
                                )}
                            </div>
                            {event.minLoyaltyLevel && event.minLoyaltyLevel > 1 && (
                                <Badge variant="gold" className="text-xs">
                                    Level {event.minLoyaltyLevel}+
                                </Badge>
                            )}
                        </div>
                        <CardTitle>{event.title}</CardTitle>
                        {event.subtitle && (
                            <p className="text-body-sm text-graphite/60 mt-1">{event.subtitle}</p>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-body-sm text-graphite">{displayText}</p>
                            {shouldTruncate && (
                                <button
                                    onClick={toggleDescription}
                                    className="text-accent-burgundy text-sm font-medium hover:underline mt-2"
                                >
                                    {isExpanded ? 'Weniger anzeigen' : 'Weiterlesen'}
                                </button>
                            )}
                        </div>

                        {/* Event Details */}
                        <div className="space-y-2 text-body-sm text-graphite/80">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-wine" />
                                <span>
                                    {new Date(event.date).toLocaleDateString('de-CH', {
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-wine" />
                                <span>{event.time} Uhr ({event.duration} Min)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <LocationIcon className="w-4 h-4 text-wine mt-1 flex-shrink-0" />
                                <span className="line-clamp-2">{event.venue}</span>
                            </div>

                            {/* Capacity display for admins */}
                            {isAdmin && (
                                <div className="flex items-center gap-2 pt-2 border-t border-taupe-light/30 mt-2 text-wine">
                                    <UserGroupIcon className="w-4 h-4 text-wine/80" />
                                    <span className="font-medium">
                                        {event.booked} / {event.capacity} gebucht ({spotsLeft} Frei)
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-taupe-light/50 flex items-center justify-between">
                            <div className="flex flex-col">
                                {event.memberPrice && event.memberPrice < event.price ? (
                                    <>
                                        <span className="text-xs text-graphite/60 line-through">CHF {event.price.toFixed(2)}</span>
                                        <span className="text-h4 font-serif text-wine">CHF {event.memberPrice.toFixed(2)}</span>
                                        <span className="text-[10px] text-accent-gold uppercase tracking-wider font-medium">Club Preis</span>
                                    </>
                                ) : (
                                    <span className="text-h4 font-serif text-wine">CHF {event.price.toFixed(2)}</span>
                                )}
                            </div>
                            <Button
                                variant={spotsLeft === 0 ? "outline" : "primary"}
                                onClick={spotsLeft === 0 ? undefined : handleBooking}
                                disabled={spotsLeft === 0}
                            >
                                {spotsLeft === 0 ? 'Ausverkauft' : 'Ticket'}
                            </Button>
                        </div>

                        {isAlmostFull && spotsLeft > 0 && (
                            <p className="text-xs text-accent-burgundy font-medium text-center mt-2">
                                Nur noch {spotsLeft} {spotsLeft === 1 ? 'Platz' : 'Plätze'} frei!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </Link>

            {/* Booking Modal (In-line) */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-serif text-wine-dark">Tickets: {event.title}</h3>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="text-graphite/60 hover:text-wine transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-body-sm text-graphite">{event.subtitle}</p>
                                <div className="flex items-center justify-between py-4 border-y border-taupe-light/50">
                                    <span className="text-graphite font-medium">Anzahl Tickets</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                            className="w-8 h-8 rounded-full border border-taupe flex items-center justify-center text-graphite hover:border-wine hover:text-wine transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-medium">{ticketQuantity}</span>
                                        <button
                                            onClick={() => setTicketQuantity(Math.min(spotsLeft, ticketQuantity + 1))}
                                            className="w-8 h-8 rounded-full border border-taupe flex items-center justify-center text-graphite hover:border-wine hover:text-wine transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-lg font-medium pt-2">
                                    <span>Total</span>
                                    <span className="text-wine">
                                        CHF {((event.memberPrice || event.price) * ticketQuantity).toFixed(2)}
                                    </span>
                                </div>

                                {error && (
                                    <p className="text-sm text-accent-burgundy text-center">{error}</p>
                                )}

                                <Button
                                    className="w-full mt-6"
                                    onClick={handleAddToCart}
                                >
                                    In den Warenkorb
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
