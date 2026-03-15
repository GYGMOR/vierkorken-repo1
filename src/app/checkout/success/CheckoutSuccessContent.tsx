'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const [hasCleared, setHasCleared] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    const orderIdFromParams = orderId || searchParams.get('orderId');

    if (!sessionId && !orderIdFromParams) {
      setError('Keine Session-ID oder Order-ID gefunden');
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function processCheckout() {
      try {
        // Barzahlung (nur orderId, kein sessionId)
        if (!sessionId && orderIdFromParams) {
          if (!hasCleared) {
            clearCart();
            setHasCleared(true);
          }

          const orderResponse = await fetch(`/api/orders/${orderIdFromParams}`);
          const orderData = await orderResponse.json();

          if (!isMounted) return;

          if (orderData.success) {
            setSessionData({
              id: orderData.order.orderNumber,
              amount_total: Math.round(orderData.order.total * 100),
              payment_status:
                orderData.order.paymentStatus === 'PENDING' ? 'pending' : 'paid',
              customer_email: orderData.order.customerEmail,
              payment_method: orderData.order.paymentMethod,
            });
          } else {
            setError(
              orderData.error || 'Bestellung konnte nicht geladen werden',
            );
          }

          setLoading(false);
          return;
        }

        // Stripe-Zahlung (sessionId + orderId)
        if (sessionId && orderIdFromParams) {
          // Only confirm once
          if (!hasConfirmed) {
            setHasConfirmed(true);

            const confirmResponse = await fetch(
              `/api/orders/${orderIdFromParams}/confirm`,
              {
                method: 'POST',
              },
            );

            if (!isMounted) return;

            if (!confirmResponse.ok) {
              throw new Error('Bestellung konnte nicht bestätigt werden');
            }
          }

          if (!hasCleared) {
            clearCart();
            setHasCleared(true);
          }

          const sessionResponse = await fetch(
            `/api/checkout/session?session_id=${sessionId}`,
          );
          const sessionData = await sessionResponse.json();

          if (!isMounted) return;

          if (sessionData.error) {
            setError(sessionData.error);
          } else {
            setSessionData(sessionData);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error processing checkout:', err);
        setError('Fehler beim Verarbeiten der Bestellung');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    processCheckout();

    return () => {
      isMounted = false;
    };
  }, [sessionId, orderId, searchParams, clearCart, hasCleared, hasConfirmed]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-warmwhite py-6 md:py-12 px-4">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6 md:p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4" />
                  <p className="text-graphite">Lade Bestelldaten...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-warmwhite py-6 md:py-12 px-4">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Fehler</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <p className="text-graphite mb-4 text-sm md:text-base">{error}</p>
                  <Link href="/">
                    <Button className="w-full sm:w-auto">Zurück zur Startseite</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite py-6 md:py-12 px-4">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <Card className="border-green-200 mb-4 md:mb-6">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-h2 font-serif text-graphite-dark mb-2">
                  Bestellung erfolgreich!
                </h1>
                <p className="text-sm md:text-base text-graphite">
                  Vielen Dank für Ihre Bestellung. Wir haben Ihre Bestellung erhalten
                  und werden sie schnellstmöglich bearbeiten.
                </p>
              </CardContent>
            </Card>

            {/* Order Details */}
            {sessionData && (
              <Card className="mb-4 md:mb-6">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Bestelldetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-sm md:text-base text-graphite">Bestellnummer:</span>
                    <span className="font-semibold text-sm md:text-base text-graphite-dark break-all">
                      {sessionData.id}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-sm md:text-base text-graphite">Betrag:</span>
                    <span className="font-semibold text-sm md:text-base text-graphite-dark">
                      CHF {(sessionData.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-sm md:text-base text-graphite">Zahlungsstatus:</span>
                    <span
                      className={`font-semibold text-sm md:text-base ${
                        sessionData.payment_status === 'paid'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {sessionData.payment_status === 'paid'
                        ? 'Bezahlt'
                        : 'Ausstehend'}
                    </span>
                  </div>
                  {sessionData.customer_email && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm md:text-base text-graphite">E-Mail:</span>
                      <span className="text-sm md:text-base text-graphite-dark break-all">
                        {sessionData.customer_email}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Wie geht es weiter?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-accent-burgundy text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm md:text-base">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base text-graphite-dark">
                      Bestellbestätigung per E-Mail
                    </p>
                    <p className="text-xs md:text-sm text-graphite">
                      Sie erhalten in Kürze eine Bestätigung an Ihre E-Mail-Adresse.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-accent-burgundy text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm md:text-base">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base text-graphite-dark">
                      Bestellung wird vorbereitet
                    </p>
                    <p className="text-xs md:text-sm text-graphite">
                      Wir bereiten Ihre Bestellung sorgfältig vor.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-accent-burgundy text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm md:text-base">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base text-graphite-dark">Versand</p>
                    <p className="text-xs md:text-sm text-graphite">
                      Sie erhalten eine Versandbestätigung, sobald Ihre Bestellung
                      unterwegs ist.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link href="/konto" className="flex-1">
                <Button variant="secondary" className="w-full text-sm md:text-base h-11 md:h-12">
                  Zu meinen Bestellungen
                </Button>
              </Link>
              <Link href="/weine" className="flex-1">
                <Button className="w-full text-sm md:text-base h-11 md:h-12">Weiter einkaufen</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
