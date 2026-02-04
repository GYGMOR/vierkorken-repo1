'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { EventImageCarousel } from '@/components/events/EventImageCarousel';

// Mock data for events
import { useSession } from 'next-auth/react';
import { EventEditModal } from '@/components/events/EventEditModal';
const UPCOMING_EVENTS = [
  {
    id: '1',
    slug: 'burgundy-tasting-november',
    title: 'Burgunderweine Verkostung',
    subtitle: 'Eine Reise durch die Côte d\'Or',
    date: '2024-11-25',
    time: '18:00',
    duration: 180,
    venue: 'VIER KORKEN Weinlounge',
    type: 'Verkostung',
    price: 95,
    memberPrice: 85,
    capacity: 20,
    booked: 14,
    image: '/events/burgundy.jpg',
    description: 'Entdecken Sie die Finesse und Eleganz burgundischer Weine.',
    minLoyaltyLevel: null,
  },
  {
    id: '2',
    slug: 'italian-wine-dinner',
    title: 'Italienisches Weindinner',
    subtitle: '5-Gang Menü mit toskanischen Weinen',
    date: '2024-12-08',
    time: '19:00',
    duration: 240,
    venue: 'Ristorante Castello',
    type: 'Wine Dinner',
    price: 145,
    memberPrice: 130,
    capacity: 24,
    booked: 18,
    image: '/events/italian-dinner.jpg',
    description: 'Genießen Sie ein exquisites italienisches Menü mit perfekt abgestimmten Weinen.',
    minLoyaltyLevel: 2,
  },
  {
    id: '3',
    slug: 'champagne-masterclass',
    title: 'Champagner Masterclass',
    subtitle: 'Die Kunst der Flaschengärung',
    date: '2024-12-15',
    time: '15:00',
    duration: 150,
    venue: 'VIER KORKEN Weinlounge',
    type: 'Masterclass',
    price: 125,
    memberPrice: 110,
    capacity: 16,
    booked: 8,
    image: '/events/champagne.jpg',
    description: 'Lernen Sie die Geschichte und Herstellung von Champagner kennen.',
    minLoyaltyLevel: 3,
  },
];



export default function EventsPage() {
  const [events, setEvents] = useState<typeof UPCOMING_EVENTS>([]);
  const [loading, setLoading] = useState(true);

  // Admin state
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        cache: 'no-store', // Always fetch fresh data
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.events && data.events.length > 0) {
          // Transform API data to match component format
          const transformedEvents = data.events.map((event: any) => ({
            id: event.id,
            slug: event.slug,
            title: event.title,
            subtitle: event.subtitle || '',
            date: new Date(event.startDateTime).toISOString().split('T')[0],
            time: new Date(event.startDateTime).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
            duration: event.duration || 0,
            venue: event.venue,
            type: event.eventType,
            price: event.price,
            memberPrice: event.memberPrice || event.price,
            capacity: event.maxCapacity,
            booked: event.currentCapacity,
            image: event.featuredImage || '/events/default.jpg',
            description: event.description,
            minLoyaltyLevel: event.minLoyaltyLevel,
          }));
          setEvents(transformedEvents);
          console.log('✅ Loaded events from database:', transformedEvents.length);
          console.log('📸 Event images:', transformedEvents.map((e: any) => ({ title: e.title, image: e.image })));
        } else {
          // Fallback to mock data if no events in DB
          console.log('⚠️ No events in database, using mock data');
          setEvents(UPCOMING_EVENTS);
        }
      } else {
        // Fallback to mock data on error
        console.log('⚠️ API error, using mock data');
        setEvents(UPCOMING_EVENTS);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to mock data
      console.log('⚠️ Exception loading events, using mock data');
      setEvents(UPCOMING_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Reload events when page becomes visible (user returns from detail page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible again, reloading events...');
        fetchEvents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check for admin status
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user.role === 'ADMIN') {
            setIsAdmin(true);
          }
        })
        .catch(() => setIsAdmin(false));
    }
  }, [session]);

  const handleEdit = (event: any, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setShowEditModal(true);
  };

  const handleSave = () => {
    fetchEvents(); // Reload events
    setShowEditModal(false);
    setEditingEvent(null);
  };

  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-accent-burgundy/10 border-b border-taupe-light overflow-hidden">
        {/* Hintergrundbild - transparent */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/layout/weingläser.jpg"
            alt="Weingläser Hintergrund"
            fill
            className="object-cover opacity-15"
            quality={90}
            priority
          />
        </div>

        {/* Content - über dem Bild */}
        <div className="container-custom py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BackButton href="/" className="mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 backdrop-blur-sm">
              <span className="text-accent-burgundy font-medium text-sm">EVENTS</span>
            </div>
            <h1 className="text-display font-serif font-light text-graphite-dark">
              Exklusive Weinerlebnisse
            </h1>
            <p className="text-body-lg text-graphite">
              Nehmen Sie an Verkostungen, Masterclasses und exklusiven Weindinners teil.
              Entdecken Sie neue Weine und treffen Sie Gleichgesinnte.
            </p>
          </div>
        </div>
      </div>

      {/* Event Image Carousel */}
      <EventImageCarousel />

      <div className="container-custom py-12 space-y-12">
        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-graphite text-lg">Keine Events verfügbar</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdmin={isAdmin}
                onEdit={(e) => handleEdit(event, e)}
              />
            ))}
          </div>
        )}

        {/* Benefits Section */}
        <section className="mt-16">
          <Card className="p-12 bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-h2 font-serif font-light text-wine-dark">
                Loyalty Club Vorteile
              </h2>
              <p className="text-body-lg text-graphite">
                Als Mitglied des Loyalty Clubs erhalten Sie exklusive Vorteile bei Events
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <BenefitCard
                  icon={<DiscountIcon />}
                  title="Ermässigte Preise"
                  description="Spezielle Mitgliederpreise für alle Events"
                />
                <BenefitCard
                  icon={<EarlyAccessIcon />}
                  title="Früher Zugang"
                  description="Buchen Sie Events vor allen anderen"
                />
                <BenefitCard
                  icon={<PointsIcon />}
                  title="Punkte sammeln"
                  description="+150 Loyalty Punkte pro Event"
                />
              </div>
              <Link href="/club">
                <Button size="lg" className="mt-6">
                  Mehr zum Loyalty Club
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>

      {/* Admin Floating Action Button */}
      {isAdmin && (
        <button
          onClick={handleCreate}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-accent-burgundy text-white rounded-full shadow-strong flex items-center justify-center hover:scale-110 transition-transform"
          title="Neues Event erstellen"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      )}

      {/* Admin Edit Modal */}
      {showEditModal && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}

function EventCard({ event, isAdmin, onEdit }: { event: typeof UPCOMING_EVENTS[0]; isAdmin?: boolean; onEdit?: (e: React.MouseEvent) => void }) {
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
              <Badge variant="secondary" className="text-xs">
                {event.type}
              </Badge>
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
                <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                <span>{formatDate(event.date)} um {event.time} Uhr</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                <span>{event.duration} Minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon className="w-4 h-4 flex-shrink-0" />
                <span>{event.venue}</span>
              </div>
            </div>

            {/* Availability */}
            <div className="pt-4 border-t border-taupe-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-medium text-graphite/60">
                  Verfügbarkeit
                </span>
                <span className={`text-sm font-semibold ${spotsLeft <= 5 ? 'text-red-600' :
                  spotsLeft <= 10 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                  {spotsLeft} / {event.capacity} frei
                </span>
              </div>
              <div className="h-2 bg-taupe-light rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${spotsLeft <= 5 ? 'bg-red-600' :
                    spotsLeft <= 10 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                  style={{ width: `${(spotsLeft / event.capacity) * 100}%` }}
                />
              </div>
              {spotsLeft <= 5 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  ⚠️ Nur noch {spotsLeft} Plätze verfügbar!
                </p>
              )}
            </div>

            {/* Price & CTA */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-h4 font-serif text-graphite-dark">CHF {event.price}</div>
                {event.memberPrice && (
                  <div className="text-body-sm text-accent-burgundy">
                    Mitglieder: CHF {event.memberPrice}
                  </div>
                )}
              </div>
              <Button size="sm" onClick={handleBooking}>
                Buchen
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3 font-serif text-wine-dark">
                Tickets buchen
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-graphite hover:text-wine"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-wine-dark">{event.title}</h3>
                <p className="text-body-sm text-graphite/60">{event.subtitle}</p>
                <p className="text-body-sm text-graphite mt-2">
                  {formatDate(event.date)} um {event.time} Uhr
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-wine-dark mb-2">
                  Anzahl Tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                    className="w-10 h-10 rounded-lg border border-taupe hover:border-graphite flex items-center justify-center transition-colors"
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={spotsLeft}
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 text-center border border-taupe rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={() => setTicketQuantity(Math.min(spotsLeft, ticketQuantity + 1))}
                    className="w-10 h-10 rounded-lg border border-taupe hover:border-graphite flex items-center justify-center transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-graphite/60 mt-2">
                  Noch {spotsLeft} von {event.capacity} Plätzen verfügbar
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="pt-4 border-t border-taupe-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-graphite">Gesamt</span>
                  <span className="text-h3 font-serif text-wine-dark">
                    CHF {((event.memberPrice || event.price) * ticketQuantity).toFixed(2)}
                  </span>
                </div>
                <Button onClick={handleAddToCart} className="w-full">
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

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-burgundy/10 text-accent-burgundy">
        {icon}
      </div>
      <h3 className="font-serif text-body-lg font-semibold text-graphite-dark">{title}</h3>
      <p className="text-body-sm text-graphite/70">{description}</p>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function DiscountIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function EarlyAccessIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function PointsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
