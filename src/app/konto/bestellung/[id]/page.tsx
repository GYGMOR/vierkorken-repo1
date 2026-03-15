'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { generateInvoicePDF } from '@/lib/pdf-generator';

// Mock order data - TODO: Replace with real data from API
const MOCK_ORDER = {
  id: '1',
  orderNumber: 'VK-2024-001234',
  date: '2024-11-10',
  status: 'delivered',
  paymentStatus: 'paid',

  // Customer
  customerFirstName: 'Anna',
  customerLastName: 'Müller',
  customerEmail: 'anna.mueller@example.com',
  customerPhone: '+41 79 123 45 67',

  // Addresses
  shippingAddress: {
    firstName: 'Anna',
    lastName: 'Müller',
    street: 'Musterstrasse',
    streetNumber: '123',
    postalCode: '8000',
    city: 'Zürich',
    country: 'Schweiz',
  },
  billingAddress: {
    firstName: 'Anna',
    lastName: 'Müller',
    company: 'Muster GmbH',
    street: 'Musterstrasse',
    streetNumber: '123',
    postalCode: '8000',
    city: 'Zürich',
    country: 'Schweiz',
  },

  // Items
  items: [
    {
      id: '1',
      wineName: 'Château Margaux',
      winery: 'Château Margaux',
      vintage: 2015,
      bottleSize: 0.75,
      quantity: 2,
      unitPrice: 850.00,
      totalPrice: 1700.00,
    },
    {
      id: '2',
      wineName: 'Barolo Riserva',
      winery: 'Giacomo Conterno',
      vintage: 2016,
      bottleSize: 0.75,
      quantity: 1,
      unitPrice: 320.00,
      totalPrice: 320.00,
    },
  ],

  // Pricing
  subtotal: 2020.00,
  shippingCost: 15.00,
  taxAmount: 162.81,
  discountAmount: 0,
  total: 2197.81,

  // Tax details for invoice
  taxRate: 8.1, // Swiss VAT

  // Shipping
  shippingMethod: 'Standard',
  trackingNumber: 'CH1234567890',
  shippedAt: '2024-11-11',
  deliveredAt: '2024-11-13',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load order from API
  useEffect(() => {
    if (params.id) {
      fetch(`/api/orders/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrder(data.order);
          } else {
            setError(data.error || 'Bestellung nicht gefunden');
          }
        })
        .catch(err => {
          console.error('Error loading order:', err);
          setError('Fehler beim Laden der Bestellung');
        })
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleDownloadInvoice = async () => {
    setIsGeneratingPdf(true);
    try {
      console.log('📄 Generating PDF for order:', order);

      // Ensure all required fields are present
      if (!order.billingAddress) {
        console.error('❌ Missing billingAddress');
        alert('Fehler: Rechnungsadresse fehlt');
        setIsGeneratingPdf(false);
        return;
      }

      if (!order.items || order.items.length === 0) {
        if (!order.eventTickets || order.eventTickets.length === 0) {
          console.error('❌ No items or tickets');
          alert('Fehler: Keine Artikel in der Bestellung');
          setIsGeneratingPdf(false);
          return;
        }
      }

      await generateInvoicePDF(order);
      console.log('✅ PDF generated successfully');
    } catch (error: any) {
      console.error('❌ Error generating invoice:', error);
      console.error('Error details:', error.message);
      console.error('Order data:', order);
      alert(`Fehler beim Erstellen der Rechnung: ${error.message}`);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 500);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Navigation />
        <div className="container-custom py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
            <p className="text-graphite">Lade Bestellung...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Navigation />
        <div className="container-custom py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-serif text-graphite-dark mb-4">Bestellung nicht gefunden</h1>
            <p className="text-graphite mb-6">{error || 'Die gewünschte Bestellung konnte nicht gefunden werden.'}</p>
            <Link href="/konto?tab=orders">
              <Button>Zurück zu Bestellungen</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="primary">Zugestellt</Badge>;
      case 'shipped':
        return <Badge variant="accent">Versandt</Badge>;
      case 'processing':
        return <Badge variant="secondary">In Bearbeitung</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />

      <div className="container-custom py-6 md:py-8 lg:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-graphite hover:text-graphite-dark transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm md:text-base">Zurück zu Bestellungen</span>
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light text-graphite-dark mb-2">
                Bestellung {order.orderNumber}
              </h1>
              <p className="text-sm md:text-base text-graphite">
                Bestellt am {formatDate(order.date)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {getStatusBadge(order.status)}
              <Button
                onClick={handleDownloadInvoice}
                disabled={isGeneratingPdf}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                {isGeneratingPdf ? 'Generiere...' : 'Rechnung (PDF)'}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Bestellte Artikel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border border-taupe-light rounded-lg hover:shadow-soft transition-shadow"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-graphite-dark mb-1">
                            {item.wineName}
                          </h3>
                          <p className="text-sm text-graphite mb-1">
                            {item.winery} • {item.vintage}
                          </p>
                          <p className="text-sm text-graphite/60">
                            {item.bottleSize}l Flasche
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-graphite/60 mb-1">
                            {item.quantity}x {formatPrice(item.unitPrice)}
                          </p>
                          <p className="font-semibold text-graphite-dark">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Event Tickets */}
              {order.eventTickets && order.eventTickets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Event-Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.eventTickets.map((ticket: any) => (
                        <div
                          key={ticket.id}
                          className="flex gap-4 p-4 border border-taupe-light rounded-lg hover:shadow-soft transition-shadow"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-graphite-dark mb-1">
                              {ticket.event?.title || 'Event'}
                            </h3>
                            {ticket.event?.subtitle && (
                              <p className="text-sm text-graphite mb-1">
                                {ticket.event.subtitle}
                              </p>
                            )}
                            <p className="text-sm text-graphite/60">
                              Ticket: {ticket.ticketNumber}
                            </p>
                            {ticket.event?.startDateTime && (
                              <p className="text-sm text-graphite/60 mt-1">
                                {new Intl.DateTimeFormat('de-CH', {
                                  dateStyle: 'full',
                                  timeStyle: 'short',
                                }).format(new Date(ticket.event.startDateTime))}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-graphite-dark">
                              {formatPrice(ticket.price)}
                            </p>
                            <Badge
                              variant={ticket.status === 'ACTIVE' ? 'primary' : 'secondary'}
                              className="mt-2"
                            >
                              {ticket.status === 'ACTIVE' ? 'Aktiv' : ticket.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delivery Method & Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Lieferung</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Delivery Method */}
                  <div className="mb-4">
                    <p className="text-sm text-graphite/60 mb-1">Liefermethode</p>
                    <div className="flex items-center gap-2">
                      {order.deliveryMethod === 'PICKUP' ? (
                        <>
                          <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="font-medium text-graphite-dark">Abholung im Geschäft</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                          <span className="font-medium text-graphite-dark">Lieferung nach Hause</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="divider my-3"></div>

                  {/* Shipping Address */}
                  {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 ? (
                    <div className="text-sm text-graphite space-y-1">
                      <p className="text-sm text-graphite/60 mb-2">
                        {order.deliveryMethod === 'PICKUP' ? 'Kontaktdaten' : 'Lieferadresse'}
                      </p>
                      {(order.shippingAddress.firstName || order.shippingAddress.lastName) && (
                        <p className="font-semibold text-graphite-dark">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                      )}
                      {(order.shippingAddress.street || order.shippingAddress.streetNumber) && (
                        <p>
                          {order.shippingAddress.street} {order.shippingAddress.streetNumber}
                        </p>
                      )}
                      {(order.shippingAddress.postalCode || order.shippingAddress.city) && (
                        <p>
                          {order.shippingAddress.postalCode} {order.shippingAddress.city}
                        </p>
                      )}
                      {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                      {order.shippingAddress.phone && (
                        <p className="mt-2 text-graphite/80">Tel: {order.shippingAddress.phone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-graphite/60">Keine Lieferadresse hinterlegt</p>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Rechnungsadresse</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.billingAddress && Object.keys(order.billingAddress).length > 0 ? (
                    <div className="text-sm text-graphite space-y-1">
                      {order.billingAddress.company && (
                        <p className="font-semibold text-graphite-dark">
                          {order.billingAddress.company}
                        </p>
                      )}
                      {(order.billingAddress.firstName || order.billingAddress.lastName) && (
                        <p className="font-semibold text-graphite-dark">
                          {order.billingAddress.firstName} {order.billingAddress.lastName}
                        </p>
                      )}
                      {(order.billingAddress.street || order.billingAddress.streetNumber) && (
                        <p>
                          {order.billingAddress.street} {order.billingAddress.streetNumber}
                        </p>
                      )}
                      {(order.billingAddress.postalCode || order.billingAddress.city) && (
                        <p>
                          {order.billingAddress.postalCode} {order.billingAddress.city}
                        </p>
                      )}
                      {order.billingAddress.country && <p>{order.billingAddress.country}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-graphite/60">Keine Rechnungsadresse hinterlegt</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Bestellübersicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">Zwischensumme</span>
                    <span className="text-graphite-dark">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">Versand</span>
                    <span className="text-graphite-dark">{formatPrice(order.shippingCost)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-accent-burgundy">
                      <span>Rabatt</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">MwSt. ({order.taxRate}%)</span>
                    <span className="text-graphite-dark">{formatPrice(order.taxAmount)}</span>
                  </div>
                  <div className="divider my-3"></div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-graphite-dark">Gesamt</span>
                    <span className="font-serif text-xl text-graphite-dark">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              {order.trackingNumber && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sendungsverfolgung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-graphite/60 mb-1">Tracking-Nummer</p>
                      <p className="font-mono text-sm text-graphite-dark">
                        {order.trackingNumber}
                      </p>
                    </div>
                    {order.shippedAt && (
                      <div>
                        <p className="text-sm text-graphite/60 mb-1">Versandt am</p>
                        <p className="text-sm text-graphite-dark">
                          {formatDate(order.shippedAt)}
                        </p>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div>
                        <p className="text-sm text-graphite/60 mb-1">Zugestellt am</p>
                        <p className="text-sm text-graphite-dark">
                          {formatDate(order.deliveredAt)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Zahlung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-graphite">Status</span>
                      <Badge variant={order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'primary' : 'secondary'}>
                        {order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'Bezahlt' : 'Ausstehend'}
                      </Badge>
                    </div>
                    {order.paymentMethod && (
                      <div className="flex justify-between text-sm">
                        <span className="text-graphite">Zahlungsmethode</span>
                        <span className="text-graphite-dark font-medium">
                          {order.paymentMethod === 'cash' ? 'Barzahlung' :
                            order.paymentMethod === 'card' ? 'Kreditkarte' :
                              order.paymentMethod === 'twint' ? 'TWINT' :
                                order.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gift Options */}
              {(order.items?.some((item: any) => item.isGift || item.giftWrap) || order.customerNote) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Geschenkoptionen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items?.some((item: any) => item.isGift) && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          <span className="text-graphite-dark">Dies ist ein Geschenk</span>
                        </div>
                      )}
                      {order.items?.some((item: any) => item.giftWrap) && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-graphite-dark">Mit Geschenkverpackung</span>
                        </div>
                      )}
                      {order.customerNote && (
                        <div className="mt-3 p-3 bg-warmwhite-light rounded-lg">
                          <p className="text-xs text-graphite/60 mb-1">Grußkarte</p>
                          <p className="text-sm text-graphite italic">
                            "{order.customerNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
