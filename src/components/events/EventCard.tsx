import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
    </svg>
);

export function EventCard({ event, isAdmin, onEdit }: { event: any; isAdmin?: boolean; onEdit?: (e: React.MouseEvent) => void }) {
    const { data: session } = useSession();
    const { addItem } = useCart();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showClubPrompt, setShowClubPrompt] = useState(false);
    const [userSkippedLogin, setUserSkippedLogin] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const isLoggedIn = !!session?.user;
    const hasClubPrice = event.memberPrice && Number(event.memberPrice) < Number(event.price);
    const effectiveUnitPrice = (isLoggedIn && hasClubPrice) ? Number(event.memberPrice) : Number(event.price);

    const spotsLeft = event.capacity - event.booked;
    const isAlmostFull = spotsLeft <= 5;

    // Strip HTML tags for plain-text card preview
    const plainDescription = event.description
        ? event.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : '';
    const maxLength = 150;
    const shouldTruncate = plainDescription.length > maxLength;
    const displayText = isExpanded || !shouldTruncate
        ? plainDescription
        : plainDescription.slice(0, maxLength) + '...';

    const handleBooking = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);

        // If user is not logged in and event has a cheaper club price and user hasn't skipped prompt yet
        if (!isLoggedIn && hasClubPrice && !userSkippedLogin) {
            setShowClubPrompt(true);
        } else {
            setShowBookingModal(true);
        }
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
                price: effectiveUnitPrice,
                type: 'event',
                slug: event.slug,
                eventDate: event.date === event.endDate 
                    ? `${new Date(event.date).toLocaleDateString('de-CH')} ${event.time}`
                    : `${new Date(event.date).toLocaleDateString('de-CH')} – ${new Date(event.endDate).toLocaleDateString('de-CH')} ${event.time}`,
                imageUrl: event.image,
                maxCapacity: event.capacity,
                currentCapacity: event.booked
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

                <Card hover className="h-full">
                    {/* Event Image */}
                    <div className="relative h-48 bg-gradient-to-br from-wood-light/40 to-wine/10 overflow-hidden">
                        {event.image && event.image !== '/events/default.jpg' ? (
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-contain p-2"
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
                                    {event.date === event.endDate ? (
                                        new Date(`${event.date}T12:00:00`).toLocaleDateString('de-CH', {
                                            weekday: 'short',
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            timeZone: 'Europe/Zurich',
                                        })
                                    ) : (
                                        `${new Date(`${event.date}T12:00:00`).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Zurich' })} – ${new Date(`${event.endDate}T12:00:00`).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Zurich' })}`
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-wine" />
                                <span>
                                    {event.endTime && event.endTime !== event.time
                                        ? `${event.time} – ${event.endTime} Uhr`
                                        : `${event.time} Uhr`}
                                </span>
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
                                {isLoggedIn && hasClubPrice ? (
                                    <>
                                        <span className="text-h4 font-serif text-wine">CHF {Number(event.memberPrice).toFixed(2)}</span>
                                        <span className="text-[10px] text-accent-gold uppercase tracking-wider font-semibold">Dein Club-Preis</span>
                                        <span className="text-[11px] text-graphite/50 line-through">Regulär CHF {Number(event.price).toFixed(2)}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-h4 font-serif text-wine">CHF {Number(event.price).toFixed(2)}</span>
                                        <span className="text-[11px] text-graphite/60 font-medium">Regulärer Preis</span>
                                        {hasClubPrice && (
                                            <span className="text-[11px] text-accent-gold font-medium">
                                                Club-Preis: CHF {Number(event.memberPrice).toFixed(2)}
                                            </span>
                                        )}
                                    </>
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

            {/* Club Login Prompt Modal (Popup 1) */}
            {showClubPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-taupe-light/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-accent-gold/15 text-accent-gold mx-auto flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-serif font-bold text-graphite-dark">
                                Sparen Sie mit dem VIER KORKEN Club!
                            </h3>

                            <p className="text-sm text-graphite/80 leading-relaxed">
                                Als registriertes Club-Mitglied buchen Sie dieses Event zum Vorzugspreis von{' '}
                                <strong className="text-accent-burgundy font-bold">CHF {Number(event.memberPrice).toFixed(2)}</strong>{' '}
                                statt <span className="line-through">CHF {Number(event.price).toFixed(2)}</span>.
                            </p>

                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => {
                                        window.location.href = `/login?callbackUrl=${encodeURIComponent(`/events/${event.slug}`)}`;
                                    }}
                                    className="w-full py-3 px-4 bg-accent-burgundy hover:bg-accent-burgundy/90 text-white font-medium rounded-xl transition-colors shadow-md"
                                >
                                    Jetzt Anmelden / Konto erstellen
                                </button>
                                <button
                                    onClick={() => {
                                        setShowClubPrompt(false);
                                        setUserSkippedLogin(true);
                                        setShowBookingModal(true);
                                    }}
                                    className="w-full py-2.5 px-4 bg-transparent hover:bg-taupe-light/30 text-graphite/70 text-sm font-medium rounded-xl transition-colors border border-taupe-light"
                                >
                                    Als Gast fortfahren (regulär CHF {Number(event.price).toFixed(2)})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    <span>Total ({isLoggedIn && hasClubPrice ? 'Club-Preis' : 'Regulär'})</span>
                                    <span className="text-wine">
                                        CHF {(effectiveUnitPrice * ticketQuantity).toFixed(2)}
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
