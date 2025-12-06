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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Period = 'daily' | 'monthly' | 'quarterly' | 'yearly';

const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3', '#A0522D'];

export default function WebStatsPage() {
  const [period, setPeriod] = useState<Period>('daily');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/stats/web?period=${period}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching web stats:', error);
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

  const {
    summary,
    timeSeriesData,
    topPages,
    trafficByCountry,
    trafficByRegion,
    deviceStats,
    browserStats,
    peakHours,
    topReferrers,
  } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-graphite-dark">
              Web-Statistiken
            </h1>
            <p className="text-graphite mt-1">
              Analyse des Website-Traffics und Besucherverhaltens
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Seitenaufrufe"
            value={summary.totalViews.toLocaleString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Sitzungen"
            value={summary.uniqueSessions.toLocaleString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            color="bg-green-50"
            iconColor="text-green-600"
          />
          <KPICard
            title="Benutzer"
            value={summary.uniqueUsers.toLocaleString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="bg-purple-50"
            iconColor="text-purple-600"
          />
          <KPICard
            title="Bounce Rate"
            value={`${summary.bounceRate.toFixed(1)}%`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="bg-orange-50"
            iconColor="text-orange-600"
          />
          <KPICard
            title="Ø Verweildauer"
            value={`${Math.round(summary.avgTimeOnPage)}s`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-pink-50"
            iconColor="text-pink-600"
          />
        </div>

        {/* Traffic Over Time */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-graphite-dark mb-4">
            Traffic-Entwicklung
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B4513" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B4513" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D2691E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#D2691E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="period" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#8B4513"
                fillOpacity={1}
                fill="url(#colorViews)"
                name="Seitenaufrufe"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#D2691E"
                fillOpacity={1}
                fill="url(#colorSessions)"
                name="Sitzungen"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pages and Traffic by Country */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-graphite-dark mb-4">
              Meistbesuchte Seiten (Top 10)
            </h2>
            <div className="space-y-3">
              {topPages.slice(0, 10).map((page: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-warmwhite-light rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-graphite-dark truncate">
                      {page.title}
                    </p>
                    <p className="text-xs text-graphite/60">{page.path}</p>
                  </div>
                  <span className="ml-4 text-sm font-semibold text-graphite-dark">
                    {page.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic by Country */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-graphite-dark mb-4">
              Traffic nach Land
            </h2>
            <div className="space-y-3">
              {trafficByCountry.slice(0, 10).map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-warmwhite-light rounded-lg"
                >
                  <span className="text-sm font-medium text-graphite-dark">
                    {item.country}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-taupe-light rounded-full h-2">
                      <div
                        className="bg-accent-burgundy h-2 rounded-full"
                        style={{
                          width: `${(item.views / summary.totalViews) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-graphite-dark w-16 text-right">
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Stats and Browser Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Stats */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-graphite-dark mb-4">
              Gerätetypen
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.device}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {deviceStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Browser Stats */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-graphite-dark mb-4">
              Browser
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={browserStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis
                  type="category"
                  dataKey="browser"
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
                <Bar dataKey="count" fill="#8B4513" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-graphite-dark mb-4">
            Besucherzeiten (24h)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="hour"
                stroke="#666"
                style={{ fontSize: '12px' }}
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
                labelFormatter={(hour) => `${hour}:00 Uhr`}
              />
              <Bar
                dataKey="views"
                fill="#8B4513"
                name="Aufrufe"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Referrers */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-graphite-dark mb-4">
            Traffic-Quellen
          </h2>
          <div className="space-y-3">
            {topReferrers.map((referrer: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-warmwhite-light rounded-lg"
              >
                <span className="text-sm font-medium text-graphite-dark">
                  {referrer.referrer}
                </span>
                <span className="text-sm font-semibold text-graphite-dark">
                  {referrer.views.toLocaleString()} Besuche
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Traffic */}
        {trafficByRegion.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-graphite-dark mb-4">
              Traffic nach Region (Top 10)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-taupe-light">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-dark">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-dark">
                      Region / Land
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-graphite-dark">
                      Aufrufe
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-graphite-dark">
                      Anteil
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trafficByRegion.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-taupe-light/50 hover:bg-warmwhite-light"
                    >
                      <td className="py-3 px-4 text-sm text-graphite">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-graphite-dark">
                        {item.region}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-graphite">
                        {item.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-graphite">
                        {((item.views / summary.totalViews) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
