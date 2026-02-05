'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

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

// Mock Events Data
const EVENTS: Event[] = [
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
    description: 'Entdecken Sie die Finesse und Eleganz burgundischer Weine. In dieser exklusiven Verkostung führen wir Sie durch die verschiedenen Appellationen der Côte d\'Or und verkosten gemeinsam 8 ausgewählte Weine.',
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
    description: 'Genießen Sie ein exquisites italienisches Menü mit perfekt abgestimmten Weinen aus der Toskana. Jeder Gang wird von unserem Sommelier begleitet und die Weine werden ausführlich vorgestellt.',
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
    description: 'Lernen Sie die Geschichte und Herstellung von Champagner kennen. Diese Masterclass führt Sie durch die verschiedenen Produktionsmethoden und wir verkosten 6 verschiedene Champagner.',
    minLoyaltyLevel: 3,
  },
];

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
            // Fallback to mock data if event not found in DB
            console.log('⚠️ Event not found in database, using mock data');
            const foundEvent = EVENTS.find(e => e.slug === slug);
            setEvent(foundEvent || null);
          }
        } else {
          // Fallback to mock data if API fails
          console.log('⚠️ API error, using mock data');
          const foundEvent = EVENTS.find(e => e.slug === slug);
          setEvent(foundEvent || null);
        }
      } catch (error) {
        console.error('Error loading event:', error);
        // Fallback to mock data
        console.log('⚠️ Exception loading event, using mock data');
        const foundEvent = EVENTS.find(e => e.slug === slug);
        setEvent(foundEvent || null);
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
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 font-serif text-graphite-dark mb-4">Event nicht gefunden</h1>
          <Link href="/events" className="btn btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const availableTickets = event.capacity - event.booked;
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="min-h-screen bg-warmwhite">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Tickets in den Warenkorb gelegt!
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-elegant border-b border-taupe-light/30">
        <div className="container-custom py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-graphite hover:text-graphite-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Zurück</span>
            </button>

            <Link href="/warenkorb" className="text-graphite hover:text-graphite-dark transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-burgundy text-warmwhite text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative w-full rounded-lg overflow-hidden flex justify-center bg-transparent">
              {event.image && event.image !== '/events/default.jpg' ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto max-h-[600px] object-contain rounded-lg"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', event.image);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('✅ Image loaded:', event.image)}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg className="w-24 h-24 text-taupe" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 mb-3">
                <span className="text-accent-burgundy font-medium text-sm">{event.type}</span>
              </div>
              <h1 className="text-display font-serif font-light text-graphite-dark mb-2">
                {event.title}
              </h1>
              <p className="text-h4 text-graphite">{event.subtitle}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-h2 font-serif text-accent-burgundy">
                {formatPrice(event.price)}
              </span>
              <span className="text-graphite">/ Ticket</span>
            </div>

            {event.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-graphite leading-relaxed">{event.description}</p>
              </div>
            )}

            <div className="border-t border-taupe-light pt-6 space-y-3">
              <h3 className="font-semibold text-graphite-dark">Event-Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-graphite/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-graphite-dark font-medium">
                    {new Date(event.date).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} um {event.time} Uhr
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-graphite/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-graphite-dark font-medium">
                    {event.duration} Minuten
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-graphite/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-graphite-dark font-medium">
                    {event.venue}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-graphite/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-graphite-dark font-medium">
                        Verfügbarkeit
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${availableTickets <= 5 ? 'text-red-600' : availableTickets <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      {availableTickets} / {event.capacity} Plätze frei
                    </span>
                  </div>
                  <div className="w-full bg-taupe-light rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${availableTickets <= 5 ? 'bg-red-600' :
                          availableTickets <= 10 ? 'bg-orange-500' :
                            'bg-green-500'
                        }`}
                      style={{ width: `${(availableTickets / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleBookTickets}
                disabled={isSoldOut}
                className="btn btn-primary w-full md:w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? 'Ausverkauft' : 'Tickets buchen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-taupe-light">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 font-serif text-graphite-dark">Tickets buchen</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-graphite hover:text-graphite-dark"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Count */}
              <div>
                <label className="block text-sm font-medium text-graphite-dark mb-2">
                  Anzahl Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableTickets}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.max(1, Math.min(availableTickets, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                />
              </div>

              {/* Address Selection */}
              <div>
                <label className="block text-sm font-medium text-graphite-dark mb-2">
                  Rechnungsadresse
                </label>
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex items-start gap-3 p-4 border border-taupe-light rounded-lg cursor-pointer hover:bg-warmwhite transition-colors"
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-graphite-dark">{addr.label}</p>
                        <p className="text-sm text-graphite">
                          {addr.firstName} {addr.lastName}<br />
                          {addr.street}<br />
                          {addr.postalCode} {addr.city}, {addr.country}<br />
                          {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}

                  <label className="flex items-start gap-3 p-4 border border-taupe-light rounded-lg cursor-pointer hover:bg-warmwhite transition-colors">
                    <input
                      type="radio"
                      name="address"
                      value="new"
                      checked={selectedAddress === 'new'}
                      onChange={() => setSelectedAddress('new')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-graphite-dark">Neue Adresse eingeben</p>
                    </div>
                  </label>

                  {selectedAddress === 'new' && (
                    <div className="p-4 bg-warmwhite rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Vorname"
                          value={newAddress.firstName}
                          onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                          className="px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                        />
                        <input
                          type="text"
                          placeholder="Nachname"
                          value={newAddress.lastName}
                          onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                          className="px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Strasse und Hausnummer"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="PLZ"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                        />
                        <input
                          type="text"
                          placeholder="Ort"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="col-span-2 px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Telefon"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-taupe-light pt-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-graphite-dark">Gesamt:</span>
                  <span className="font-serif text-2xl text-accent-burgundy">
                    {formatPrice(event.price * ticketCount)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="btn btn-primary flex-1"
                >
                  In den Warenkorb
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
