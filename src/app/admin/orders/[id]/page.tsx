'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';

interface OrderItem {
  id: string;
  wineName: string;
  winery: string;
  vintage: number | null;
  bottleSize: number;
  quantity: number;
  unitPrice: number | string; // Can be Decimal from Prisma
  totalPrice: number | string; // Can be Decimal from Prisma
  variant?: {
    wine: {
      name: string;
      winery: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string | null;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    additional?: string;
  };
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    additional?: string;
  };
  items: OrderItem[];
  subtotal: number | string; // Can be Decimal from Prisma
  shippingCost: number | string; // Can be Decimal from Prisma
  taxAmount: number | string; // Can be Decimal from Prisma
  discountAmount: number | string; // Can be Decimal from Prisma
  total: number | string; // Can be Decimal from Prisma
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
        setTrackingNumber(data.order.trackingNumber || '');
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'SHIPPED' && trackingNumber && { trackingNumber })
        }),
      });

      if (response.ok) {
        await loadOrder();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const printPackingSlip = () => {
    window.print();
  };

  // Helper to convert Decimal to number
  const toNumber = (value: number | string): number => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'secondary'> = {
      PENDING: 'secondary',
      CONFIRMED: 'primary',
      PROCESSING: 'primary',
      SHIPPED: 'primary',
      DELIVERED: 'primary',
      CANCELLED: 'secondary',
    };

    const labels: Record<string, string> = {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      PROCESSING: 'In Bearbeitung',
      SHIPPED: 'Versendet',
      DELIVERED: 'Zugestellt',
      CANCELLED: 'Storniert',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Keine Adresse';
    return (
      <>
        <p>{address.street}</p>
        {address.additional && <p>{address.additional}</p>}
        <p>{address.postalCode} {address.city}</p>
        <p>{address.country}</p>
      </>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <BackButton href="/admin/orders" />
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-graphite/60">Bestellung nicht gefunden</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <BackButton href="/admin/orders" />
            <div>
              <h1 className="text-3xl font-serif font-light text-graphite-dark">
                Bestellung {order.orderNumber}
              </h1>
              <p className="mt-2 text-graphite">
                Bestellt am {new Date(order.createdAt).toLocaleDateString('de-CH', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            <Button
              onClick={printPackingSlip}
              variant="secondary"
              size="sm"
            >
              Packzettel drucken
            </Button>
          </div>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block">
          <h1 className="text-2xl font-serif font-bold text-graphite-dark">
            VIERKORKEN - Packzettel
          </h1>
          <p className="text-lg mt-2">Bestellung: {order.orderNumber}</p>
          <p className="text-sm text-graphite">
            Datum: {new Date(order.createdAt).toLocaleDateString('de-CH')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kundeninformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-graphite/60 mb-1">Name</p>
                <p className="font-semibold text-graphite-dark">
                  {order.customerFirstName} {order.customerLastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-graphite/60 mb-1">E-Mail</p>
                <p className="text-graphite-dark">{order.customerEmail}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <p className="text-sm text-graphite/60 mb-1">Telefon</p>
                  <p className="text-graphite-dark">{order.customerPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Lieferadresse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-graphite-dark">
                {formatAddress(order.shippingAddress)}
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Rechnungsadresse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-graphite-dark">
                {formatAddress(order.billingAddress)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Tracking */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Status & Versand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-graphite/60 mb-2">Aktueller Status</p>
                  <div className="flex gap-2">
                    {order.status === 'CONFIRMED' && (
                      <Button
                        onClick={() => updateOrderStatus('SHIPPED')}
                        disabled={updating}
                        size="sm"
                      >
                        Als versendet markieren
                      </Button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <Button
                        onClick={() => updateOrderStatus('DELIVERED')}
                        disabled={updating}
                        size="sm"
                      >
                        Als zugestellt markieren
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {order.status === 'CONFIRMED' && (
                <div>
                  <label className="block text-sm text-graphite/60 mb-2">
                    Tracking-Nummer (optional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
                    placeholder="z.B. 00340434292135100186"
                  />
                </div>
              )}

              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-graphite/60 mb-1">Tracking-Nummer</p>
                  <p className="font-mono text-graphite-dark">{order.trackingNumber}</p>
                </div>
              )}

              {order.shippedAt && (
                <div>
                  <p className="text-sm text-graphite/60 mb-1">Versendet am</p>
                  <p className="text-graphite-dark">
                    {new Date(order.shippedAt).toLocaleDateString('de-CH', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {order.deliveredAt && (
                <div>
                  <p className="text-sm text-graphite/60 mb-1">Zugestellt am</p>
                  <p className="text-graphite-dark">
                    {new Date(order.deliveredAt).toLocaleDateString('de-CH', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Bestellpositionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-graphite">
                      Produkt
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-graphite">
                      Weingut
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-graphite">
                      Jahrgang
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-graphite">
                      Grösse
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-graphite">
                      Menge
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-graphite">
                      Einzelpreis
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-graphite">
                      Gesamt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-graphite-dark">
                        {item.wineName}
                      </td>
                      <td className="px-4 py-3 text-sm text-graphite">
                        {item.winery}
                      </td>
                      <td className="px-4 py-3 text-sm text-graphite text-center">
                        {item.vintage || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-graphite text-center">
                        {toNumber(item.bottleSize).toFixed(2)}L
                      </td>
                      <td className="px-4 py-3 text-sm text-graphite text-center">
                        {item.quantity}x
                      </td>
                      <td className="px-4 py-3 text-sm text-graphite text-right">
                        CHF {toNumber(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-graphite-dark text-right">
                        CHF {toNumber(item.totalPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">Zwischensumme</span>
                    <span className="text-graphite-dark">CHF {toNumber(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">Versand</span>
                    <span className="text-graphite-dark">CHF {toNumber(order.shippingCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">MwSt.</span>
                    <span className="text-graphite-dark">CHF {toNumber(order.taxAmount).toFixed(2)}</span>
                  </div>
                  {toNumber(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm text-accent-burgundy">
                      <span>Rabatt</span>
                      <span>- CHF {toNumber(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span className="text-graphite-dark">Gesamt</span>
                    <span className="text-graphite-dark">CHF {toNumber(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:space-y-4 > * + * {
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
