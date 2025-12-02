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
  }, [sessionId, orderId, searchParams, clearCart, hasCleared]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-warmwhite py-12">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-12 text-center">
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
        <div className="min-h-screen bg-warmwhite py-12">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Fehler</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-graphite mb-4">{error}</p>
                  <Link href="/">
                    <Button>Zurück zur Startseite</Button>
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
      <div className="min-h-screen bg-warmwhite py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <Card className="border-green-200 mb-6">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
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
                <h1 className="text-h2 font-serif text-graphite-dark mb-2">
                  Bestellung erfolgreich!
                </h1>
                <p className="text-graphite">
                  Vielen Dank für Ihre Bestellung. Wir haben Ihre Bestellung erhalten
                  und werden sie schnellstmöglich bearbeiten.
                </p>
              </CardContent>
            </Card>

            {/* Order Details */}
            {sessionData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Bestelldetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-graphite">Bestellnummer:</span>
                    <span className="font-semibold text-graphite-dark">
                      {sessionData.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite">Betrag:</span>
                    <span className="font-semibold text-graphite-dark">
                      CHF {(sessionData.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite">Zahlungsstatus:</span>
                    <span
                      className={`font-semibold ${
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
                    <div className="flex justify-between">
                      <span className="text-graphite">E-Mail:</span>
                      <span className="text-graphite-dark">
                        {sessionData.customer_email}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Wie geht es weiter?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-burgundy text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-graphite-dark">
                      Bestellbestätigung per E-Mail
                    </p>
                    <p className="text-sm text-graphite">
                      Sie erhalten in Kürze eine Bestätigung an Ihre E-Mail-Adresse.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-burgundy text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-graphite-dark">
                      Bestellung wird vorbereitet
                    </p>
                    <p className="text-sm text-graphite">
                      Wir bereiten Ihre Bestellung sorgfältig vor.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-burgundy text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-graphite-dark">Versand</p>
                    <p className="text-sm text-graphite">
                      Sie erhalten eine Versandbestätigung, sobald Ihre Bestellung
                      unterwegs ist.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/konto" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Zu meinen Bestellungen
                </Button>
              </Link>
              <Link href="/weine" className="flex-1">
                <Button className="w-full">Weiter einkaufen</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
