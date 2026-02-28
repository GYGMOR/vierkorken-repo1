'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { ShareButton } from '@/components/ui/ShareButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  duration: number;
  venue: string;
  type: string;
  price: number;
  memberPrice: number;
  capacity: number;
  booked: number;
  image: string;
  description: string;
  minLoyaltyLevel: number | null;
}

// Address interface for the booking modal
interface Address {
  id: number;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, itemCount } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<number | 'new'>('new');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Schweiz',
    phone: '',
  });
  const [showToast, setShowToast] = useState(false);

  const isLoggedIn = !!session;

  useEffect(() => {
    // Load event from API
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${slug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.event) {
            // Transform API data to match Event interface
            const transformedEvent = {
              id: data.event.id,
              slug: data.event.slug,
              title: data.event.title,
              subtitle: data.event.subtitle || '',
              date: new Date(data.event.startDateTime).toISOString().split('T')[0],
              time: new Date(data.event.startDateTime).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
              duration: data.event.duration || 0,
              venue: data.event.venue,
              type: data.event.eventType,
              price: data.event.price,
              memberPrice: data.event.memberPrice || data.event.price,
              capacity: data.event.maxCapacity,
              booked: data.event.currentCapacity,
              image: data.event.featuredImage || '/events/default.jpg',
              description: data.event.description,
              minLoyaltyLevel: data.event.minLoyaltyLevel,
            };
            setEvent(transformedEvent);
            console.log('✅ Loaded event from database:', transformedEvent.title, 'Capacity:', transformedEvent.booked, '/', transformedEvent.capacity);
            console.log('📸 Event image:', transformedEvent.image);
            console.log('📸 Raw featuredImage from API:', data.event.featuredImage);
          } else {
            console.log('⚠️ Event not found in database');
            setEvent(null);
          }
        } else {
          console.log('⚠️ API error');
          setEvent(null);
        }
      } catch (error) {
        console.error('Error loading event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // Load user addresses if logged in
    if (isLoggedIn) {
      // TODO: Load from API
      // For now, load from mock data
      const mockAddresses: Address[] = [
        {
          id: 1,
          label: 'Privat',
          firstName: session?.user?.name?.split(' ')[0] || '',
          lastName: session?.user?.name?.split(' ')[1] || '',
          street: 'Musterstrasse 123',
          city: 'Zürich',
          postalCode: '8000',
          country: 'Schweiz',
          phone: '044 123 45 67',
          isDefault: true,
        },
      ];
      setAddresses(mockAddresses);
      if (mockAddresses.length > 0) {
        setSelectedAddress(mockAddresses[0].id);
      }
    }
  }, [slug, isLoggedIn, session]);

  const handleBookTickets = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (!event) return;

    // Get address data
    let addressData;
    if (selectedAddress === 'new') {
      addressData = newAddress;
    } else {
      addressData = addresses.find(a => a.id === selectedAddress);
    }

    // Add to cart with capacity information
    for (let i = 0; i < ticketCount; i++) {
      addItem({
        id: event.id,
        name: `${event.title} - Ticket`,
        price: event.price,
        imageUrl: event.image,
        type: 'event',
        slug: event.slug,
        eventDate: `${event.date} ${event.time}`,
        maxCapacity: event.capacity,
        currentCapacity: event.booked,
      });
    }

    // Show success
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Close modal
    setShowBookingModal(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h2 font-serif text-graphite-dark mb-4">Event nicht gefunden</h1>
            <Link href="/events" className="btn btn-primary">
              Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const availableTickets = event.capacity - event.booked;
  const isSoldOut = availableTickets <= 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite pb-20">
        {/* Toast */}
        {showToast && (
          <div className="fixed top-24 right-4 z-[60] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tickets in den Warenkorb gelegt!
          </div>
        )}

        {/* Navigation Bar */}
        <div className="bg-warmwhite-light/80 backdrop-blur-md sticky top-0 z-30 border-b border-taupe-light/30">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/events"
                className="flex items-center gap-2 text-graphite hover:text-accent-burgundy transition-colors group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium font-serif">Zurück zur Übersicht</span>
              </Link>

              <div className="flex items-center gap-4">
                <ShareButton url={`/events/${event.slug}`} title={event.title} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container-custom py-8 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left: Image Container */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant bg-taupe-light/20 border border-taupe-light/30 group flex justify-center items-center bg-white/50">
                <img
                  src={event.image || '/events/default.jpg'}
                  alt={event.title}
                  className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right: Info & Pricing */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-accent-burgundy/10 text-accent-burgundy border-accent-burgundy/20 hover:bg-accent-burgundy/20">
                    {event.type}
                  </Badge>
                  {event.minLoyaltyLevel && event.minLoyaltyLevel > 1 && (
                    <Badge className="bg-accent-gold/10 text-accent-gold border-accent-gold/20">
                      Level {event.minLoyaltyLevel}+ Exklusiv
                    </Badge>
                  )}
                </div>

                <h1 className="text-h1 font-serif text-graphite-dark leading-tight">
                  {event.title}
                </h1>

                {event.subtitle && (
                  <p className="text-xl text-graphite/70 font-sans italic">
                    {event.subtitle}
                  </p>
                )}
              </div>

              <div className="p-6 bg-warmwhite-light rounded-2xl border border-taupe-light/50 space-y-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-graphite/40 uppercase tracking-widest font-medium">Preis pro Ticket</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-serif text-wine">
                        {formatPrice(event.memberPrice || event.price)}
                      </span>
                      {event.memberPrice && event.memberPrice < event.price && (
                        <span className="text-lg text-graphite/30 line-through">
                          {formatPrice(event.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-taupe-light/30">
                  <div className="flex items-center gap-4 text-graphite">
                    <div className="w-10 h-10 rounded-full bg-taupe-light/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString('de-CH', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-graphite/60">{event.time} Uhr ({event.duration} Min)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-graphite">
                    <div className="w-10 h-10 rounded-full bg-taupe-light/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Veranstaltungsort</p>
                      <p className="text-sm text-graphite/60">{event.venue}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleBookTickets}
                    disabled={isSoldOut}
                    className="w-full btn btn-primary py-4 text-lg shadow-elegant transition-transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                  >
                    {isSoldOut ? 'Ausverkauft' : 'Tickets reservieren'}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex-1 h-2 bg-taupe-light rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${availableTickets <= 5 ? 'bg-red-500' : 'bg-green-500/60'}`}
                        style={{ width: `${(availableTickets / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-graphite/60">
                      {availableTickets} von {event.capacity} verfügbar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-16 lg:mt-24 max-w-4xl">
            <h2 className="text-h2 font-serif text-graphite-dark mb-8 border-b border-taupe-light pb-4">
              Details zum Event
            </h2>
            <div
              className="prose prose-lg prose-stone max-w-none text-graphite leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
