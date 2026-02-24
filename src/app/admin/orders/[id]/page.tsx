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
    firstName?: string;
    lastName?: string;
    company?: string;
    street: string;
    streetNumber?: string;
    city: string;
    postalCode: string;
    country: string;
    additional?: string;
    phone?: string;
  };
  billingAddress: {
    firstName?: string;
    lastName?: string;
    company?: string;
    street: string;
    streetNumber?: string;
    city: string;
    postalCode: string;
    country: string;
    additional?: string;
    phone?: string;
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
  const [selectedStatus, setSelectedStatus] = useState('');

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
        setSelectedStatus(data.order.status);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrderChanges = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          trackingNumber: trackingNumber || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadOrder();
        // Show success message
        alert('Bestellung aktualisiert. Kunde wurde per E-Mail benachrichtigt.');
      } else {
        alert('Fehler beim Aktualisieren der Bestellung: ' + (result.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Fehler beim Aktualisieren der Bestellung');
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = () => {
    if (!order) return false;
    return (
      selectedStatus !== order.status ||
      trackingNumber !== (order.trackingNumber || '')
    );
  };

  const deleteOrder = async () => {
    if (!order) return;

    const confirmed = confirm(
      `Möchten Sie die Bestellung ${order.orderNumber} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Bestellung wurde gelöscht');
        router.push('/admin/orders');
      } else {
        alert('Fehler beim Löschen der Bestellung: ' + (result.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Fehler beim Löschen der Bestellung');
    } finally {
      setUpdating(false);
    }
  };

  const printPackingSlip = () => {
    if (!order) return;

    const shipping = order.shippingAddress;
    const recipientName = `${shipping.firstName || order.customerFirstName} ${shipping.lastName || order.customerLastName}`.trim();

    const labelHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Paketzettel - ${order.orderNumber}</title>
          <style>
            @page {
              size: A6 landscape;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              width: 148mm;
              height: 105mm;
              padding: 8mm;
              background: white;
            }
            .label-container {
              width: 100%;
              height: 100%;
              border: 2px solid #000;
              display: flex;
              flex-direction: column;
            }
            .header {
              background: #6D2932;
              color: white;
              padding: 4mm 6mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header h1 {
              font-size: 14pt;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .header .order-info {
              text-align: right;
              font-size: 9pt;
            }
            .content {
              display: flex;
              flex: 1;
            }
            .sender {
              width: 40%;
              padding: 5mm;
              border-right: 1px dashed #999;
              font-size: 9pt;
              display: flex;
              flex-direction: column;
            }
            .sender-label {
              font-size: 7pt;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 2mm;
              border-bottom: 1px solid #ddd;
              padding-bottom: 1mm;
            }
            .sender-address {
              line-height: 1.5;
            }
            .sender-company {
              font-weight: bold;
              font-size: 10pt;
              margin-bottom: 1mm;
            }
            .recipient {
              width: 60%;
              padding: 5mm;
              display: flex;
              flex-direction: column;
            }
            .recipient-label {
              font-size: 7pt;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 2mm;
              border-bottom: 1px solid #ddd;
              padding-bottom: 1mm;
            }
            .recipient-address {
              font-size: 14pt;
              font-weight: bold;
              line-height: 1.4;
              flex: 1;
            }
            .recipient-name {
              font-size: 16pt;
              margin-bottom: 2mm;
            }
            .recipient-postal {
              font-size: 18pt;
              margin-top: 3mm;
            }
            .footer {
              border-top: 1px solid #ddd;
              padding: 3mm 6mm;
              font-size: 8pt;
              color: #666;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <h1>Vier Korken Wein-Boutique</h1>
              <div class="order-info">
                <div><strong>${order.orderNumber}</strong></div>
                <div>${new Date(order.createdAt).toLocaleDateString('de-CH')}</div>
              </div>
            </div>
            <div class="content">
              <div class="sender">
                <div class="sender-label">Absender</div>
                <div class="sender-address">
                  <div class="sender-company">Vier Korken Wein-Boutique</div>
                  <div>Wein-Boutique</div>
                  <div>Steinbrunnengasse 3a</div>
                  <div><strong>5707 Seengen</strong></div>
                  <div style="margin-top: 2mm;">Schweiz</div>
                </div>
              </div>
              <div class="recipient">
                <div class="recipient-label">Empfänger</div>
                <div class="recipient-address">
                  <div class="recipient-name">${recipientName}</div>
                  ${shipping.company ? `<div>${shipping.company}</div>` : ''}
                  <div>${shipping.street}${shipping.streetNumber ? ' ' + shipping.streetNumber : ''}</div>
                  ${shipping.additional ? `<div>${shipping.additional}</div>` : ''}
                  <div class="recipient-postal">${shipping.postalCode} ${shipping.city}</div>
                  <div>${shipping.country || 'Schweiz'}</div>
                </div>
              </div>
            </div>
            <div class="footer">
              <span>Bitte nicht knicken - Wein</span>
              <span>${order.items.length} Artikel | ${order.items.reduce((sum, item) => sum + item.quantity, 0)} Flaschen</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=600,height=450');
    if (printWindow) {
      printWindow.document.write(labelHtml);
      printWindow.document.close();
    }
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
        {(address.firstName || address.lastName) && (
          <p className="font-semibold">{address.firstName} {address.lastName}</p>
        )}
        {address.company && <p>{address.company}</p>}
        <p>
          {address.street}
          {address.streetNumber && ` ${address.streetNumber}`}
        </p>
        {address.additional && <p>{address.additional}</p>}
        <p>{address.postalCode} {address.city}</p>
        <p>{address.country}</p>
        {address.phone && <p>Tel: {address.phone}</p>}
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
            <Button
              onClick={deleteOrder}
              variant="secondary"
              size="sm"
              disabled={updating}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Löschen
            </Button>
          </div>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block">
          <h1 className="text-2xl font-serif font-bold text-graphite-dark">
            Vier Korken Wein-Boutique - Packzettel
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
              {/* Status Selection */}
              <div>
                <label className="block text-sm text-graphite/60 mb-2">
                  Bestellstatus
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy bg-white"
                >
                  <option value="PENDING">Ausstehend</option>
                  <option value="CONFIRMED">Bestätigt</option>
                  <option value="PROCESSING">In Bearbeitung</option>
                  <option value="SHIPPED">Versendet</option>
                  <option value="DELIVERED">Zugestellt</option>
                  <option value="CANCELLED">Storniert</option>
                  <option value="REFUNDED">Erstattet</option>
                </select>
              </div>

              {/* Tracking Number */}
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
                <p className="mt-1 text-xs text-graphite/60">
                  Wird in der Versand-E-Mail an den Kunden gesendet
                </p>
              </div>

              {/* Changes indicator */}
              {hasChanges() && (
                <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-3">
                  <p className="text-sm text-graphite-dark font-semibold mb-1">
                    Nicht gespeicherte Änderungen:
                  </p>
                  <ul className="text-sm text-graphite space-y-1">
                    {selectedStatus !== order.status && (
                      <li>• Status: {getStatusBadge(order.status)} → {getStatusBadge(selectedStatus)}</li>
                    )}
                    {trackingNumber !== (order.trackingNumber || '') && (
                      <li>
                        • Tracking: {order.trackingNumber || '(leer)'} → {trackingNumber || '(leer)'}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Save Button */}
              <Button
                onClick={saveOrderChanges}
                disabled={updating || !hasChanges()}
                className="w-full"
              >
                {updating ? 'Speichern...' : 'Änderungen speichern & E-Mail senden'}
              </Button>

              {/* Timestamps */}
              {order.shippedAt && (
                <div className="pt-4 border-t">
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
                <div className={order.shippedAt ? '' : 'pt-4 border-t'}>
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
