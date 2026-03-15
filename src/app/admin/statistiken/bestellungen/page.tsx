'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Period = 'daily' | 'monthly' | 'quarterly' | 'yearly';

const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3'];

export default function OrderStatsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/stats/orders?period=${period}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-graphite">Keine Daten verfügbar</p>
        </div>
      </AdminLayout>
    );
  }

  const { summary, timeSeriesData, topWines, revenueByType } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-graphite-dark">
              Bestellstatistiken
            </h1>
            <p className="text-graphite mt-1">
              Übersicht über Umsatz, Bestellungen und Kunden
            </p>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-graphite-dark">Zeitraum:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-4 py-2 border border-taupe-light rounded-lg bg-white text-graphite focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
            >
              <option value="daily">Täglich</option>
              <option value="monthly">Monatlich</option>
              <option value="quarterly">Vierteljährlich</option>
              <option value="yearly">Jährlich</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Gesamtumsatz"
            value={`CHF ${summary.totalRevenue.toFixed(2)}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-green-50"
            iconColor="text-green-600"
          />
          <KPICard
            title="Bestellungen"
            value={summary.totalOrders.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            color="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Ø Bestellwert"
            value={`CHF ${summary.averageOrderValue.toFixed(2)}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            color="bg-purple-50"
            iconColor="text-purple-600"
          />
          <KPICard
            title="Kunden"
            value={summary.uniqueCustomers.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-graphite-dark mb-2">
              Neue Kunden
            </h3>
            <p className="text-3xl font-bold text-green-600">{summary.newCustomers}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-graphite-dark mb-2">
              Wiederkehrende Kunden
            </h3>
            <p className="text-3xl font-bold text-blue-600">{summary.returningCustomers}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-graphite-dark mb-4">
            Umsatzentwicklung
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="period"
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8B4513"
                strokeWidth={2}
                name="Umsatz (CHF)"
                dot={{ fill: '#8B4513' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-graphite-dark mb-4">
            Bestellungen
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="period"
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="orders"
                fill="#8B4513"
                name="Anzahl Bestellungen"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Type */}
        {revenueByType.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-graphite-dark mb-4">
              Umsatz nach Weintyp
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.type}: CHF ${entry.revenue.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Selling Wines */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-graphite-dark mb-4">
            Meistverkaufte Weine (Top 10)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-taupe-light">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-dark">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-dark">
                    Wein
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-dark">
                    Weingut
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-graphite-dark">
                    Verkaufte Flaschen
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-graphite-dark">
                    Umsatz
                  </th>
                </tr>
              </thead>
              <tbody>
                {topWines.map((wine: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-taupe-light/50 hover:bg-warmwhite-light"
                  >
                    <td className="py-3 px-4 text-sm text-graphite">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-graphite-dark">
                      {wine.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-graphite">{wine.winery}</td>
                    <td className="py-3 px-4 text-sm text-right text-graphite">
                      {wine.quantity}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-graphite-dark">
                      CHF {wine.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function KPICard({
  title,
  value,
  icon,
  color,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  iconColor: string;
}) {
  return (
    <div className={`card p-6 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-graphite/80">{title}</h3>
        <div className={iconColor}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-graphite-dark">{value}</p>
    </div>
  );
}
