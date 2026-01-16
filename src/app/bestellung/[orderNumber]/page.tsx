'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface TimelineStep {
  status: string;
  label: string;
  date: string | null;
  completed: boolean;
  trackingNumber?: string;
  isCancelled?: boolean;
}

interface OrderItem {
  id: string;
  wineName: string;
  winery: string;
  vintage: number | null;
  bottleSize: number;
  quantity: number;
}

interface EventTicket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  holderFirstName: string | null;
  holderLastName: string | null;
  event: {
    title: string;
    startDateTime: string;
    venue: string;
  };
}

interface TrackingData {
  order: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    deliveryMethod: string;
    trackingNumber: string | null;
    customerFirstName: string;
    customerEmail: string;
    shippingAddress: any;
    items: OrderItem[];
    tickets?: EventTicket[];
    createdAt: string;
  };
  timeline: TimelineStep[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.orderNumber) {
      fetch(`/api/orders/track/${params.orderNumber}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setData(result);
          } else {
            setError(result.error || 'Bestellung nicht gefunden');
          }
        })
        .catch((err) => {
          console.error('Error loading order:', err);
          setError('Fehler beim Laden der Bestellung');
        })
        .finally(() => setLoading(false));
    }
  }, [params.orderNumber]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Ausstehend', color: 'bg-yellow-500' };
      case 'CONFIRMED':
        return { label: 'Bestätigt', color: 'bg-blue-500' };
      case 'PROCESSING':
        return { label: 'In Bearbeitung', color: 'bg-indigo-500' };
      case 'SHIPPED':
        return { label: 'Versendet', color: 'bg-purple-500' };
      case 'DELIVERED':
        return { label: 'Zugestellt', color: 'bg-green-500' };
      case 'READY_FOR_PICKUP':
        return { label: 'Bereit zur Abholung', color: 'bg-teal-500' };
      case 'CANCELLED':
        return { label: 'Storniert', color: 'bg-red-500' };
      default:
        return { label: status, color: 'bg-gray-500' };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Navigation />
        <div className="container-custom py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
            <p className="text-graphite">Lade Bestellstatus...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Navigation />
        <div className="container-custom py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-graphite-dark mb-4">Bestellung nicht gefunden</h1>
            <p className="text-graphite mb-6">
              {error || 'Die gewünschte Bestellung konnte nicht gefunden werden. Bitte überprüfen Sie die Bestellnummer.'}
            </p>
            <Link
              href="/"
              className="inline-block bg-accent-burgundy text-white px-6 py-3 rounded-lg hover:bg-accent-burgundy/90 transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { order, timeline } = data;
  const statusInfo = getStatusInfo(order.status);
  const isCancelled = order.status === 'CANCELLED';

  // Swiss Post tracking URL
  const trackingUrl = order.trackingNumber
    ? `https://service.post.ch/vgn/showTrackAndTrace.do?formattedParcelCodes=${order.trackingNumber}`
    : null;

  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />

      <div className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-light text-graphite-dark mb-2">
              Sendungsverfolgung
            </h1>
            <p className="text-graphite">
              Verfolgen Sie den Status Ihrer Bestellung
            </p>
          </div>

          {/* Order Info Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-graphite mb-1">Bestellnummer</p>
                  <p className="text-xl font-semibold text-graphite-dark font-mono">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-graphite mt-1">
                    Bestellt am {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <Badge
                    variant={isCancelled ? 'secondary' : 'primary'}
                    className={`${statusInfo.color} text-white`}
                  >
                    {statusInfo.label}
                  </Badge>
                  <p className="text-sm text-graphite mt-2">
                    {order.deliveryMethod === 'PICKUP' ? 'Abholung im Geschäft' : 'Versand'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Greeting */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-soft">
            <p className="text-lg text-graphite-dark">
              Hallo {order.customerFirstName},
            </p>
            <p className="text-graphite mt-2">
              {isCancelled
                ? 'Ihre Bestellung wurde leider storniert. Bei Fragen kontaktieren Sie uns bitte.'
                : order.status === 'DELIVERED'
                ? 'Ihre Bestellung wurde erfolgreich zugestellt. Vielen Dank für Ihren Einkauf!'
                : 'Hier können Sie den aktuellen Status Ihrer Bestellung verfolgen.'}
            </p>
          </div>

          {/* Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bestellverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {timeline.map((step, index) => {
                  const isLast = index === timeline.length - 1;
                  const isActive = step.completed && !step.isCancelled;

                  return (
                    <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                      {/* Timeline line and dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            step.isCancelled
                              ? 'border-red-500 bg-red-500'
                              : isActive
                              ? 'border-accent-burgundy bg-accent-burgundy'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isActive && !step.isCancelled && (
                            <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 mt-2 ${
                              isActive ? 'bg-accent-burgundy' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <p
                          className={`font-medium ${
                            step.isCancelled
                              ? 'text-red-600'
                              : isActive
                              ? 'text-graphite-dark'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-graphite mt-1">
                            {formatDate(step.date)}
                          </p>
                        )}
                        {step.trackingNumber && (
                          <div className="mt-3 p-3 bg-warmwhite-light rounded-lg">
                            <p className="text-sm text-graphite mb-2">
                              Tracking-Nummer: <span className="font-mono font-medium">{step.trackingNumber}</span>
                            </p>
                            {trackingUrl && (
                              <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-accent-burgundy hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Bei der Post verfolgen
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Bestellte Artikel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-warmwhite-light rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-graphite-dark">{item.wineName}</p>
                        <p className="text-sm text-graphite">
                          {item.winery} {item.vintage && `• ${item.vintage}`} • {item.bottleSize}l
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-graphite-dark">{item.quantity}x</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Tickets */}
          {order.tickets && order.tickets.length > 0 && (
            <Card className="mb-8 border-2 border-accent-burgundy/20">
              <CardHeader className="bg-accent-burgundy/5">
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Event-Tickets ({order.tickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {order.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-graphite-dark text-lg">{ticket.event.title}</p>
                          <p className="text-sm text-graphite mt-1">
                            {new Intl.DateTimeFormat('de-CH', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(ticket.event.startDateTime))}
                          </p>
                          <p className="text-sm text-graphite">{ticket.event.venue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-graphite">Ticket-Nr.</p>
                          <p className="font-mono text-sm font-medium text-accent-burgundy">{ticket.ticketNumber}</p>
                        </div>
                      </div>
                      {(ticket.holderFirstName || ticket.holderLastName) && (
                        <p className="text-sm text-graphite mt-2">
                          Inhaber: {ticket.holderFirstName} {ticket.holderLastName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Info about tickets in email */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Hinweis:</strong> Ihre Tickets mit QR-Codes wurden per E-Mail an <span className="font-medium">{order.customerEmail}</span> gesendet.
                  </p>
                </div>

                {/* Register account banner */}
                <div className="mt-4 p-4 bg-accent-burgundy/5 border border-accent-burgundy/20 rounded-lg">
                  <p className="text-graphite-dark font-medium mb-2">
                    Tickets jederzeit abrufen?
                  </p>
                  <p className="text-sm text-graphite mb-3">
                    Erstellen Sie ein Konto mit Ihrer E-Mail-Adresse, um Ihre Tickets jederzeit im Kundenportal anzusehen.
                  </p>
                  <Link
                    href={`/registrieren?email=${encodeURIComponent(order.customerEmail)}`}
                    className="inline-flex items-center gap-2 bg-accent-burgundy text-white px-4 py-2 rounded-lg hover:bg-accent-burgundy/90 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Konto erstellen
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address for Pickup */}
          {order.deliveryMethod === 'PICKUP' && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Abholadresse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-graphite-dark">VIER KORKEN</p>
                    <p className="text-graphite">Steinbrunnengasse 3A</p>
                    <p className="text-graphite">5707 Seengen AG</p>
                    <p className="text-graphite">Schweiz</p>
                    <p className="text-sm text-graphite mt-2">
                      Öffnungszeiten: Mo-Fr 9:00-18:00, Sa 10:00-16:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <div className="text-center p-6 bg-white rounded-xl shadow-soft">
            <p className="text-graphite mb-2">
              Fragen zu Ihrer Bestellung?
            </p>
            <a
              href="mailto:info@vierkorken.ch"
              className="text-accent-burgundy hover:underline font-medium"
            >
              info@vierkorken.ch
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
