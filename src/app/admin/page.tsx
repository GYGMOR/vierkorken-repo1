'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Check if user is admin
    if (session?.user?.email) {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats);
          }
        })
        .catch(err => console.error('Error loading stats:', err))
        .finally(() => setLoading(false));
    }
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            Dashboard
          </h1>
          <p className="mt-2 text-graphite">
            Übersicht über alle wichtigen Kennzahlen
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-graphite/60">Bestellungen (Gesamt)</p>
                  <p className="text-3xl font-bold text-graphite-dark mt-2">
                    {stats?.totalOrders || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-accent-burgundy/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-4">
                +{stats?.ordersThisMonth || 0} diesen Monat
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-graphite/60">Umsatz (Gesamt)</p>
                  <p className="text-3xl font-bold text-graphite-dark mt-2">
                    CHF {(stats?.totalRevenue || 0).toLocaleString('de-CH')}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-4">
                +CHF {(stats?.revenueThisMonth || 0).toLocaleString('de-CH')} diesen Monat
              </p>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-graphite/60">Benutzer</p>
                  <p className="text-3xl font-bold text-graphite-dark mt-2">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-4">
                +{stats?.newUsersThisMonth || 0} diesen Monat
              </p>
            </CardContent>
          </Card>

          {/* Event Tickets */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-graphite/60">Event-Tickets</p>
                  <p className="text-3xl font-bold text-graphite-dark mt-2">
                    {stats?.totalTickets || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-4">
                +{stats?.ticketsThisMonth || 0} diesen Monat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Bestellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-graphite-dark">{order.orderNumber}</p>
                      <p className="text-sm text-graphite/60">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-graphite-dark">CHF {order.total.toFixed(2)}</p>
                      <p className="text-xs text-graphite/60">{new Date(order.createdAt).toLocaleDateString('de-CH')}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-graphite/60 py-8">Noch keine Bestellungen</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Kommende Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.upcomingEvents?.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-graphite-dark">{event.title}</p>
                      <p className="text-sm text-graphite/60">{new Date(event.startDateTime).toLocaleDateString('de-CH')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-graphite-dark">{event.currentCapacity}/{event.maxCapacity}</p>
                      <p className="text-xs text-graphite/60">Teilnehmer</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-graphite/60 py-8">Keine kommenden Events</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
