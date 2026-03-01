'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders?filter=${filter}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusBadge = (status: string, deliveryMethod?: string) => {
    const variants: Record<string, 'primary' | 'secondary'> = {
      PENDING: 'secondary',
      CONFIRMED: 'primary',
      PROCESSING: 'primary',
      SHIPPED: 'primary',
      DELIVERED: 'primary',
      CANCELLED: 'secondary',
    };

    const isPickup = deliveryMethod === 'PICKUP';

    const labels: Record<string, string> = {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      PROCESSING: 'In Bearbeitung',
      SHIPPED: isPickup ? 'Abholbereit' : 'Versendet',
      DELIVERED: isPickup ? 'Abgeholt' : 'Zugestellt',
      CANCELLED: 'Storniert',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-graphite-dark">
              Bestellungen
            </h1>
            <p className="mt-2 text-graphite">
              Alle Bestellungen verwalten und bearbeiten
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'Alle'}
              {f === 'pending' && 'Ausstehend'}
              {f === 'confirmed' && 'Bestätigt'}
              {f === 'shipped' && 'Versendet'}
              {f === 'delivered' && 'Zugestellt'}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
              </div>
            ) : orders.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">
                          Bestellnummer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">
                          Kunde
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">
                          Betrag
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-graphite-dark">
                              {order.orderNumber}
                              {(order.isGift || order.hasNote) && (
                                <span className="ml-2" title={order.isGift ? "Enthält Geschenke" : "Enthält eine Kudennotiz"}>
                                  {order.isGift ? "🎁" : "📝"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-graphite-dark">
                              {order.customerFirstName} {order.customerLastName}
                            </div>
                            <div className="text-xs text-graphite/60">
                              {order.customerEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite">
                            {new Date(order.createdAt).toLocaleDateString('de-CH')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-graphite-dark">
                            CHF {order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status, order.deliveryMethod)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                              >
                                Details
                              </Button>
                              {order.status === 'CONFIRMED' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                                >
                                  {order.deliveryMethod === 'PICKUP' ? 'Bereitstellen' : 'Versenden'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      {/* Header: Order Number & Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-xs text-graphite/60 mb-1">Bestellnummer</div>
                          <div className="flex items-center text-sm font-medium text-graphite-dark">
                            {order.orderNumber}
                            {(order.isGift || order.hasNote) && (
                              <span className="ml-2" title={order.isGift ? "Enthält Geschenke" : "Enthält eine Kudennotiz"}>
                                {order.isGift ? "🎁" : "📝"}
                              </span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(order.status, order.deliveryMethod)}
                      </div>

                      {/* Customer Info */}
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="text-xs text-graphite/60 mb-1">Kunde</div>
                        <div className="text-sm text-graphite-dark">
                          {order.customerFirstName} {order.customerLastName}
                        </div>
                        <div className="text-xs text-graphite/60 mt-1">
                          {order.customerEmail}
                        </div>
                      </div>

                      {/* Date & Amount Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-xs text-graphite/60 mb-1">Datum</div>
                          <div className="text-sm text-graphite-dark">
                            {new Date(order.createdAt).toLocaleDateString('de-CH')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-graphite/60 mb-1">Betrag</div>
                          <div className="text-sm font-semibold text-graphite-dark">
                            CHF {order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="flex-1"
                        >
                          Details
                        </Button>
                        {order.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                          >
                            {order.deliveryMethod === 'PICKUP' ? 'Bereitstellen' : 'Versenden'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-graphite/60">
                Keine Bestellungen gefunden
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
