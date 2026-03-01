'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoyaltyProgress } from '@/components/loyalty/LoyaltyProgress';
import { BadgeDisplay } from '@/components/loyalty/BadgeDisplay';
import { BackButton } from '@/components/ui/BackButton';
import { QRCodeModal } from '@/components/tickets/QRCodeModal';
import { generateTicketPDF } from '@/lib/ticket-pdf-generator';
import { LoyaltyGiftPopup } from '@/components/loyalty/LoyaltyGiftPopup';
import { getUnclaimedGiftsWithValidity, claimGift } from '@/app/admin/actions/loyalty';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

// Mock user data
const MOCK_USER = {
  firstName: 'Anna',
  lastName: 'Müller',
  email: 'anna.mueller@example.com',
  loyaltyPoints: 3500,
  loyaltyLevel: 3,
  memberSince: '2023-06-15',
  totalOrders: 12,
  totalSpent: 2950.0,
};

const RECENT_ORDERS = [
  {
    id: '1',
    orderNumber: 'VK-2024-001234',
    date: '2024-11-10',
    total: 285.0,
    status: 'delivered',
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'VK-2024-001198',
    date: '2024-10-22',
    total: 450.0,
    status: 'delivered',
    items: 2,
  },
  {
    id: '3',
    orderNumber: 'VK-2024-001145',
    date: '2024-10-05',
    total: 195.0,
    status: 'delivered',
    items: 1,
  },
];

const USER_BADGES = [
  {
    id: '1',
    name: 'Regionen-Entdecker',
    description: '6 verschiedene Regionen gekauft',
    iconType: 'compass-vine',
    rarity: 'rare',
    earnedAt: new Date('2024-09-15'),
  },
  {
    id: '2',
    name: 'Event-Gast',
    description: 'Teilnahme an einem Event',
    iconType: 'ticket-glass',
    rarity: 'common',
    earnedAt: new Date('2024-10-01'),
  },
];

type AccountTab = 'overview' | 'orders' | 'loyalty' | 'events' | 'settings';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [unclaimedGiftsData, setUnclaimedGiftsData] = useState<any>(null);
  const [claimingGift, setClaimingGift] = useState(false);

  // Handle tab from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as AccountTab;
      if (tab && ['overview', 'orders', 'loyalty', 'events', 'settings'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Load user profile from API
  useEffect(() => {
    if (session) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserData(data.user);
          }
        })
        .catch(err => console.error('Error loading user profile:', err))
        .finally(() => setLoadingUser(false));

      // Fetch unclaimed gifts with expiration
      getUnclaimedGiftsWithValidity(session.user.id)
        .then(res => {
          if (!res.error && res.giftsByLevel && res.giftsByLevel.length > 0) {
            setUnclaimedGiftsData(res);
          }
        })
        .catch(err => console.error('Error loading unclaimed gifts:', err));
    }
  }, [session]);

  // Load orders from API
  useEffect(() => {
    if (session) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrders(data.orders);
          }
        })
        .catch(err => console.error('Error loading orders:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [session]);

  // Load event tickets from API
  useEffect(() => {
    if (session) {
      fetch('/api/user/tickets')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTickets(data.tickets);
          }
        })
        .catch(err => console.error('Error loading tickets:', err))
        .finally(() => setLoadingTickets(false));
    }
  }, [session]);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
          <p className="text-graphite">Lädt...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  // Use real user data or fallback to MOCK_USER for loading state
  const user = userData || MOCK_USER;
  const userName = userData?.firstName || session.user?.name?.split(' ')[0] || 'Gast';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleClaimGift = async (gift: any, level: number) => {
    if (!session?.user?.id) return;
    setClaimingGift(true);
    const result = await claimGift(session.user.id, level, gift.id);
    if (result.success) {
      addItem({
        id: `gift-${gift.id}`,
        name: gift.productDetails?.cartName || gift.name,
        price: 0,
        imageUrl: gift.image || '',
        type: 'wine',
        winery: gift.productDetails?.winery || 'Loyalty Gift',
        slug: gift.productDetails?.slug,
        vintage: gift.productDetails?.vintage,
      });
      alert('Geschenk wurde dem Warenkorb hinzugefügt!');
      // Refresh gifts
      getUnclaimedGiftsWithValidity(session.user.id).then(res => {
        if (!res.error && res.giftsByLevel && res.giftsByLevel.length > 0) {
          setUnclaimedGiftsData(res);
        } else {
          setUnclaimedGiftsData(null);
        }
      });
    } else {
      alert(result.error || 'Fehler beim Einlösen des Geschenks');
    }
    setClaimingGift(false);
  };

  return (
    <div className="min-h-screen bg-warmwhite">
      {/* Navigation */}
      <Navigation />
      <LoyaltyGiftPopup />

      <div className="container-custom py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light text-graphite-dark mb-2">
                  Mein Konto
                </h1>
                <p className="text-base md:text-lg text-graphite">
                  Willkommen zurück, {userName}!
                </p>
              </div>
              <Button variant="secondary" onClick={handleLogout} className="hidden md:flex">
                Abmelden
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              Übersicht
            </TabButton>
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
            >
              Bestellungen
            </TabButton>
            <TabButton
              active={activeTab === 'loyalty'}
              onClick={() => setActiveTab('loyalty')}
            >
              Loyalty Club
            </TabButton>
            <TabButton
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
            >
              Meine Events
            </TabButton>
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            >
              Einstellungen
            </TabButton>
            <button
              onClick={handleLogout}
              className="md:hidden px-4 py-2 rounded-lg font-medium text-xs bg-warmwhite text-graphite border border-taupe hover:border-graphite whitespace-nowrap"
            >
              Abmelden
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              {/* Stats */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <StatCard
                    label="Bestellungen"
                    value={user.totalOrders.toString()}
                    icon={<OrderIcon />}
                  />
                  <StatCard
                    label="Punkte"
                    value={user.loyaltyPoints.toLocaleString('de-CH')}
                    icon={<StarIcon />}
                  />
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Letzte Bestellungen</CardTitle>
                      <Link
                        href="/konto?tab=orders"
                        className="text-body-sm text-accent-burgundy hover:text-accent-burgundy/80 transition-colors"
                      >
                        Alle anzeigen
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-burgundy mx-auto mb-2"></div>
                        <p className="text-sm text-graphite">Lade Bestellungen...</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <OrderRow key={order.id} order={order} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-graphite mb-4">Noch keine Bestellungen</p>
                        <Link href="/weine">
                          <Button size="sm">Jetzt einkaufen</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Schnellzugriff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Link href="/weine">
                        <Button variant="secondary" className="w-full">
                          <WineIcon className="w-4 h-4 mr-2" />
                          Weine entdecken
                        </Button>
                      </Link>
                      <Link href="/events">
                        <Button variant="secondary" className="w-full">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Events buchen
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Loyalty Sidebar */}
              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <LoyaltyProgress
                      currentPoints={user.loyaltyPoints}
                      currentLevel={user.loyaltyLevel}
                    />
                    <Link href="/konto?tab=loyalty" className="block mt-4">
                      <Button variant="secondary" className="w-full" size="sm">
                        Zum Loyalty Club
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-body-lg">Mitglied seit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body text-graphite mb-6">
                      {formatDate(user.memberSince)}
                    </p>
                    <ShareSection />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alle Bestellungen</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
                      <p className="text-graphite">Lade Bestellungen...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 border border-taupe-light rounded-lg hover:shadow-soft transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-graphite-dark">
                                {order.orderNumber}
                              </h3>
                              <p className="text-body-sm text-graphite/60">
                                {formatDate(order.date)}
                              </p>
                            </div>
                            <Badge variant={order.status === 'delivered' || order.status === 'confirmed' ? 'primary' : 'secondary'}>
                              {order.status === 'delivered' ? 'Zugestellt' : order.status === 'confirmed' ? 'Bestätigt' : 'In Bearbeitung'}
                            </Badge>
                          </div>

                          {/* Items Count */}
                          <div className="text-body-sm text-graphite mb-3">
                            {order.wineItemsCount > 0 && (
                              <span>{order.wineItemsCount} Wein{order.wineItemsCount > 1 ? 'e' : ''}</span>
                            )}
                            {order.wineItemsCount > 0 && order.eventTicketsCount > 0 && <span> • </span>}
                            {order.eventTicketsCount > 0 && (
                              <span>{order.eventTicketsCount} Event-Ticket{order.eventTicketsCount > 1 ? 's' : ''}</span>
                            )}
                            {!order.wineItemsCount && !order.eventTicketsCount && <span>0 Artikel</span>}
                          </div>

                          {/* Desktop: Price and Button in a row */}
                          <div className="hidden sm:flex items-center justify-between pt-3 border-t border-taupe-light">
                            <span className="font-semibold text-graphite-dark">
                              CHF {order.total.toFixed(2)}
                            </span>
                            <Link href={`/konto/bestellung/${order.id}`}>
                              <Button size="sm" variant="secondary">
                                Details
                              </Button>
                            </Link>
                          </div>

                          {/* Mobile: Price and Button stacked */}
                          <div className="sm:hidden space-y-3 pt-3 border-t border-taupe-light">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-graphite/60">Gesamtbetrag</span>
                              <span className="font-semibold text-graphite-dark">
                                CHF {order.total.toFixed(2)}
                              </span>
                            </div>
                            <Link href={`/konto/bestellung/${order.id}`} className="block">
                              <Button size="sm" variant="secondary" className="w-full">
                                Details anzeigen
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-graphite mb-4">Noch keine Bestellungen vorhanden</p>
                      <Link href="/weine">
                        <Button>Jetzt einkaufen</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meine Event-Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTickets ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
                      <p className="text-graphite">Lade Tickets...</p>
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="p-6 border border-taupe-light rounded-lg hover:shadow-soft transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-graphite-dark text-lg">
                                {ticket.event?.title || 'Event'}
                              </h3>
                              {ticket.event?.subtitle && (
                                <p className="text-body-sm text-graphite/60 mt-1">
                                  {ticket.event.subtitle}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                ticket.status === 'ACTIVE'
                                  ? 'primary'
                                  : ticket.status === 'CHECKED_IN'
                                    ? 'secondary'
                                    : 'secondary'
                              }
                            >
                              {ticket.status === 'ACTIVE'
                                ? 'Aktiv'
                                : ticket.status === 'CHECKED_IN'
                                  ? 'Eingelöst'
                                  : ticket.status}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-graphite/60 mb-1">Datum & Uhrzeit</p>
                              <p className="text-body-sm text-graphite">
                                {ticket.event?.startDateTime
                                  ? new Intl.DateTimeFormat('de-CH', {
                                    dateStyle: 'full',
                                    timeStyle: 'short',
                                  }).format(new Date(ticket.event.startDateTime))
                                  : 'Datum wird bekannt gegeben'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-graphite/60 mb-1">Veranstaltungsort</p>
                              <p className="text-body-sm text-graphite">
                                {ticket.event?.venue || 'Ort wird bekannt gegeben'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-graphite/60 mb-1">Ticket-Nummer</p>
                              <p className="text-body-sm font-mono text-graphite">
                                {ticket.ticketNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-graphite/60 mb-1">Preis</p>
                              <p className="text-body-sm text-graphite">
                                CHF {ticket.price.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-taupe-light">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowQRModal(true);
                              }}
                            >
                              <TicketIcon className="w-4 h-4 mr-2" />
                              QR-Code anzeigen
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await generateTicketPDF({
                                    ticketNumber: ticket.ticketNumber,
                                    qrCode: ticket.qrCode,
                                    holderFirstName: ticket.holderFirstName,
                                    holderLastName: ticket.holderLastName,
                                    holderEmail: ticket.holderEmail,
                                    price: ticket.price,
                                    event: {
                                      title: ticket.event?.title || '',
                                      subtitle: ticket.event?.subtitle,
                                      venue: ticket.event?.venue || '',
                                      startDateTime: ticket.event?.startDateTime || '',
                                      duration: ticket.event?.duration,
                                    },
                                  });
                                } catch (error) {
                                  console.error('Error generating PDF:', error);
                                  alert('Fehler beim Erstellen des Tickets');
                                }
                              }}
                            >
                              <DownloadIcon className="w-4 h-4 mr-2" />
                              Ticket herunterladen
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const message = 'Apple Wallet und Google Wallet Integration:\n\n' +
                                  '1. Laden Sie das Ticket als PDF herunter\n' +
                                  '2. Öffnen Sie das PDF auf Ihrem Smartphone\n' +
                                  '3. Machen Sie einen Screenshot des QR-Codes\n' +
                                  '4. Zeigen Sie den QR-Code beim Check-in vor\n\n' +
                                  'Für vollständige Wallet-Integration kontaktieren Sie bitte den Support.';
                                alert(message);
                              }}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                              </svg>
                              Zu Wallet hinzufügen
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TicketIcon className="w-16 h-16 text-graphite/20 mx-auto mb-4" />
                      <p className="text-graphite mb-4">Noch keine Event-Tickets vorhanden</p>
                      <Link href="/events">
                        <Button>Events entdecken</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              {unclaimedGiftsData && (
                <Card className="border-accent-gold/40 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-accent-gold/10 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-accent-burgundy">
                      <StarIcon />
                      Ausstehende Belohnungen
                    </CardTitle>
                    <p className="text-sm text-graphite/70">
                      Ihre Geschenke verfallen am {formatDate(unclaimedGiftsData.expiresAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {unclaimedGiftsData.giftsByLevel.map((group: any) => (
                        <div key={group.level}>
                          <h4 className="font-semibold text-graphite-dark mb-3">Level {group.level} Geschenke (Wählen Sie eines)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {group.gifts.map((gift: any) => (
                              <div key={gift.id} className="border border-taupe-light rounded-lg p-4 flex flex-col hover:border-accent-gold transition-colors">
                                {gift.image && (
                                  <div className="relative w-full h-32 mb-3 rounded overflow-hidden">
                                    <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                                  </div>
                                )}
                                <h5 className="font-medium text-graphite-dark mb-1">{gift.name}</h5>
                                <p className="text-sm text-graphite/70 flex-1 mb-4">{gift.description}</p>
                                <Button
                                  className="w-full mt-auto"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleClaimGift(gift, group.level)}
                                  disabled={claimingGift}
                                >
                                  In Warenkorb legen
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-8">
                  <LoyaltyProgress
                    currentPoints={user.loyaltyPoints}
                    currentLevel={user.loyaltyLevel}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ihre Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgeDisplay badges={USER_BADGES} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Punkte sammeln</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <PointsEarnCard
                      icon={<CartIcon />}
                      label="Einkauf"
                      points="1 CHF = 1 Punkt"
                    />
                    <PointsEarnCard
                      icon={<ReviewIcon />}
                      label="Bewertung"
                      points="+40 Punkte"
                    />
                    <PointsEarnCard
                      icon={<EventIcon />}
                      label="Event-Teilnahme"
                      points="+150 Punkte"
                    />
                    <PointsEarnCard
                      icon={<ReferralIcon />}
                      label="Empfehlung"
                      points="+250 Punkte"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Profilbild</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfilePictureUpload />
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Persönliche Daten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        Vorname
                      </label>
                      <input
                        type="text"
                        defaultValue={user.firstName}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        Nachname
                      </label>
                      <input
                        type="text"
                        defaultValue={user.lastName}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        E-Mail
                      </label>
                      <input
                        type="email"
                        defaultValue={session.user?.email || ''}
                        className="input w-full"
                      />
                    </div>
                    <Button className="w-full sm:w-auto">Änderungen speichern</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Passwort ändern</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        Aktuelles Passwort
                      </label>
                      <input type="password" className="input w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        Neues Passwort
                      </label>
                      <input type="password" className="input w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        Passwort bestätigen
                      </label>
                      <input type="password" className="input w-full" />
                    </div>
                    <Button className="w-full sm:w-auto">Passwort ändern</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Addresses Section */}
              <AddressesSection />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* QR Code Modal */}
      {selectedTicket && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTicket(null);
          }}
          ticketNumber={selectedTicket.ticketNumber}
          qrCode={selectedTicket.qrCode}
          eventTitle={selectedTicket.event?.title || 'Event'}
          eventDate={
            selectedTicket.event?.startDateTime
              ? new Intl.DateTimeFormat('de-CH', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(selectedTicket.event.startDateTime))
              : undefined
          }
          holderName={`${selectedTicket.holderFirstName} ${selectedTicket.holderLastName}`}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${active
        ? 'bg-accent-burgundy text-warmwhite'
        : 'bg-warmwhite text-graphite border border-taupe hover:border-graphite'
        }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm text-graphite/60">{label}</span>
          <div className="text-accent-burgundy">{icon}</div>
        </div>
        <div className="font-serif text-xl md:text-2xl lg:text-3xl text-graphite-dark">{value}</div>
      </CardContent>
    </Card>
  );
}

function OrderRow({ order }: { order: typeof RECENT_ORDERS[0] }) {
  return (
    <div className="flex items-center justify-between p-3 bg-warmwhite-light rounded-lg hover:shadow-soft transition-shadow">
      <div className="flex-1">
        <div className="font-medium text-graphite-dark">{order.orderNumber}</div>
        <div className="text-body-sm text-graphite/60">{formatDate(order.date)}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-graphite-dark">CHF {order.total.toFixed(2)}</div>
        <Badge
          variant={order.status === 'delivered' ? 'primary' : 'secondary'}
          className="text-xs mt-1"
        >
          {order.status === 'delivered' ? 'Zugestellt' : 'In Bearbeitung'}
        </Badge>
      </div>
    </div>
  );
}

function PointsEarnCard({
  icon,
  label,
  points,
}: {
  icon: React.ReactNode;
  label: string;
  points: string;
}) {
  return (
    <div className="p-4 bg-warmwhite-light rounded-lg border border-taupe-light/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-light text-graphite-dark">
          {icon}
        </div>
        <div>
          <p className="text-body-sm text-graphite/60">{label}</p>
          <p className="font-medium text-graphite-dark">{points}</p>
        </div>
      </div>
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
function OrderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  );
}

function ReferralIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function WineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function ProfilePictureUpload() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.profileImage) {
            setImageUrl(data.user.profileImage);
            setOriginalImageUrl(data.user.profileImage);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie ein Bild aus');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Bild ist zu groß. Maximal 5MB erlaubt.');
      return;
    }

    setIsUploading(true);

    try {
      // Store the file for later upload
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      alert('Kein Bild ausgewählt');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to server
      console.log('Uploading image to server...');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();
      const uploadedUrl = uploadData.url;

      console.log('Image uploaded successfully:', uploadedUrl);

      // Update user profile with new image URL
      const profileRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: uploadedUrl,
        }),
      });

      if (!profileRes.ok) {
        throw new Error('Failed to update profile');
      }

      console.log('Profile updated successfully');

      setOriginalImageUrl(imageUrl);
      setHasChanges(false);
      setSelectedFile(null);
      alert('Profilbild erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert(`Fehler beim Speichern des Bildes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImageUrl(originalImageUrl);
    setHasChanges(false);
    setSelectedFile(null);
  };

  const handleRemove = () => {
    setImageUrl(null);
    setHasChanges(true);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Avatar Preview */}
      <div className="relative">
        <UserAvatar
          firstName="Test"
          lastName="Benutzer"
          imageUrl={imageUrl}
          size="lg"
          className="w-24 h-24 text-2xl"
        />
        {imageUrl && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
            title="Bild entfernen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="profile-picture-upload"
        />
        <label
          htmlFor="profile-picture-upload"
          className={`btn btn-secondary cursor-pointer inline-flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <UploadIcon className="w-4 h-4" />
          {isUploading ? 'Lädt hoch...' : 'Bild hochladen'}
        </label>

        {/* Save/Cancel Buttons - nur anzeigen wenn Änderungen vorhanden */}
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1"
              size="sm"
            >
              <CheckIcon className="w-4 h-4 mr-1" />
              Beibehalten
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isUploading}
              variant="secondary"
              className="flex-1"
              size="sm"
            >
              <XIcon className="w-4 h-4 mr-1" />
              Rückgängig
            </Button>
          </div>
        )}

        <p className="text-xs text-graphite/60">
          JPG, PNG oder GIF. Maximal 5MB.
        </p>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

// Share Section Component
function ShareSection() {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vierkorken.ch';
  const referralCode = 'DEMO123'; // TODO: Generate unique referral code per user

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${shareUrl}?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Entdecke Vier Korken Wein-Boutique - Exklusive Weine und Events! ${shareUrl}?ref=${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}?ref=${referralCode}`, '_blank');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't support direct sharing via URL, so we copy the link
    handleCopyUrl();
    alert('Link kopiert! Fügen Sie ihn in Ihre Instagram Bio oder Story ein.');
  };

  return (
    <div className="border-t border-taupe-light pt-6">
      <h4 className="text-sm font-semibold text-graphite-dark mb-3">Webseite teilen</h4>
      <p className="text-xs text-graphite/70 mb-4">
        Teilen Sie Vier Korken Wein-Boutique und erhalten Sie 250 Loyalty Punkte, sobald sich jemand über Ihren Link registriert!
      </p>

      {/* Social Media Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={shareOnWhatsApp}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors text-xs font-medium"
        >
          <WhatsAppIcon className="w-4 h-4" />
          WhatsApp
        </button>
        <button
          onClick={shareOnFacebook}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1877F2] hover:bg-[#0C63D4] text-white rounded-lg transition-colors text-xs font-medium"
        >
          <FacebookIcon className="w-4 h-4" />
          Facebook
        </button>
        <button
          onClick={shareOnInstagram}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white rounded-lg transition-opacity text-xs font-medium"
        >
          <InstagramIcon className="w-4 h-4" />
          Instagram
        </button>
      </div>

      {/* Copy URL */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={`${shareUrl}?ref=${referralCode}`}
          readOnly
          className="flex-1 px-3 py-2 text-xs border border-taupe-light rounded-lg bg-warmwhite-light text-graphite"
        />
        <button
          onClick={handleCopyUrl}
          className="px-4 py-2 bg-accent-burgundy hover:bg-accent-burgundy/90 text-warmwhite rounded-lg transition-colors text-xs font-medium whitespace-nowrap"
        >
          {copied ? '✓ Kopiert!' : 'Kopieren'}
        </button>
      </div>
    </div>
  );
}

// Social Media Icons
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// Addresses Section Component
function AddressesSection() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    street: '',
    streetNumber: '',
    city: '',
    postalCode: '',
    country: 'CH',
    phone: '',
    isDefault: false,
  });

  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = () => {
    if (addresses.length >= 6) {
      alert('Sie können maximal 6 Adressen speichern.');
      return;
    }
    setFormData({
      firstName: '',
      lastName: '',
      street: '',
      streetNumber: '',
      city: '',
      postalCode: '',
      country: 'CH',
      phone: '',
      isDefault: false,
    });
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleEditAddress = (id: string) => {
    const address = addresses.find(a => a.id === id);
    if (address) {
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        street: address.street,
        streetNumber: address.streetNumber,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault,
      });
      setEditingAddress(id);
      setShowAddModal(true);
    }
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.street ||
      !formData.streetNumber || !formData.city || !formData.postalCode) {
      alert('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing address
        const response = await fetch(`/api/user/addresses/${editingAddress}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            isShipping: true,
          }),
        });

        if (response.ok) {
          await fetchAddresses();
          setShowAddModal(false);
        } else {
          alert('Fehler beim Aktualisieren der Adresse');
        }
      } else {
        // Create new address
        const response = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            isShipping: true,
          }),
        });

        if (response.ok) {
          await fetchAddresses();
          setShowAddModal(false);
        } else {
          alert('Fehler beim Erstellen der Adresse');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Fehler beim Speichern der Adresse');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Möchten Sie diese Adresse wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAddresses();
      } else {
        alert('Fehler beim Löschen der Adresse');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Fehler beim Löschen der Adresse');
    }
  };

  const handleToggleDefault = async (id: string) => {
    const address = addresses.find(a => a.id === id);
    if (!address) return;

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...address,
          isDefault: !address.isDefault,
          isShipping: true,
        }),
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error toggling default:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meine Adressen</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddAddress}
              disabled={addresses.length >= 6}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Adresse hinzufügen
            </Button>
          </div>
          <p className="text-xs text-graphite/60 mt-2">
            {addresses.length}/6 Adressen gespeichert
          </p>
        </CardHeader>
        <CardContent>
          {loadingAddresses ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-burgundy mx-auto mb-2"></div>
              <p className="text-sm text-graphite">Lade Adressen...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-graphite mb-4">Noch keine Adressen gespeichert</p>
              <Button size="sm" onClick={handleAddAddress}>
                Erste Adresse hinzufügen
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg transition-all ${address.isDefault
                    ? 'border-accent-burgundy bg-accent-burgundy/5'
                    : 'border-taupe-light hover:shadow-soft'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-graphite-dark">
                          {address.firstName} {address.lastName}
                        </h4>
                        <button
                          onClick={() => handleToggleDefault(address.id)}
                          className="text-accent-burgundy hover:text-accent-burgundy/80"
                          title={address.isDefault ? 'Als Standard entfernen' : 'Als Standard festlegen'}
                        >
                          <svg
                            className={`w-4 h-4 ${address.isDefault ? 'fill-accent-burgundy' : 'fill-none'}`}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      {address.isDefault && (
                        <Badge variant="primary" className="text-xs mb-2">Standard</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAddress(address.id)}
                        className="text-graphite hover:text-graphite-dark"
                        title="Bearbeiten"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Löschen"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-graphite space-y-1">
                    <p>{address.street} {address.streetNumber}</p>
                    <p>{address.postalCode} {address.city}</p>
                    <p>{address.country}</p>
                    {address.phone && <p>{address.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-taupe-light">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 font-serif text-graphite-dark">
                  {editingAddress ? 'Adresse bearbeiten' : 'Neue Adresse'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-graphite hover:text-graphite-dark"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-graphite-dark mb-1">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite-dark mb-1">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-graphite-dark mb-1">
                    Strasse *
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite-dark mb-1">
                    Nr. *
                  </label>
                  <input
                    type="text"
                    value={formData.streetNumber}
                    onChange={(e) => setFormData({ ...formData, streetNumber: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-graphite-dark mb-1">
                    PLZ *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-graphite-dark mb-1">
                    Ort *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite-dark mb-1">
                  Land *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite-dark mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-accent-burgundy"
                />
                <label htmlFor="default" className="text-sm text-graphite">
                  Als Standard-Adresse festlegen
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-taupe-light flex gap-3">
              <Button
                onClick={() => setShowAddModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveAddress}
                className="flex-1"
              >
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
