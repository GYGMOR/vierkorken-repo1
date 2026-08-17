'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { getLoyaltyLevelName } from '@/lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [counts, setCounts] = useState<{ total: number; accounts: number; newsletterOnly: number; admins: number }>({
    total: 0,
    accounts: 0,
    newsletterOnly: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACCOUNT' | 'NEWSLETTER' | 'ADMIN'>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeTab !== 'ALL') params.append('type', activeTab);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        if (data.counts) setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['E-Mail', 'Vorname', 'Nachname', 'Konto-Typ', 'Loyalty Level', 'Punkte', 'Bestellungen', 'Erstellt am'];
    const rows = users.map(u => [
      `"${u.email}"`,
      `"${u.firstName || ''}"`,
      `"${u.lastName || ''}"`,
      `"${u.accountType}"`,
      u.loyaltyLevel || 1,
      u.loyaltyPoints || 0,
      u.ordersCount || 0,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString('de-CH') : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vierkorken_konten_export_${activeTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-light text-graphite-dark">
              Benutzer &amp; Abonnenten
            </h1>
            <p className="mt-1 text-graphite/70 text-sm">
              Alle registrierten Kundenkonten und Newsletter-Abonnenten auf einen Blick.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white hover:bg-taupe-light/30 text-accent-burgundy border border-accent-burgundy/30 text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV Export ({users.length})
            </button>
            <span className="text-xs bg-accent-burgundy/10 text-accent-burgundy font-medium px-3 py-2 rounded-xl border border-accent-burgundy/20">
              Gesamt: {counts.total || users.length} Konten &amp; Abonnenten
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <Card className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-taupe-light/50 pb-3">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-accent-burgundy text-white shadow-sm'
                    : 'bg-warmwhite-light text-graphite hover:bg-taupe-light/40'
                }`}
              >
                Alle ({counts.total || users.length})
              </button>
              <button
                onClick={() => setActiveTab('ACCOUNT')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'ACCOUNT'
                    ? 'bg-accent-burgundy text-white shadow-sm'
                    : 'bg-warmwhite-light text-graphite hover:bg-taupe-light/40'
                }`}
              >
                Mit Kundenkonto ({counts.accounts})
              </button>
              <button
                onClick={() => setActiveTab('NEWSLETTER')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'NEWSLETTER'
                    ? 'bg-accent-burgundy text-white shadow-sm'
                    : 'bg-warmwhite-light text-graphite hover:bg-taupe-light/40'
                }`}
              >
                Nur Newsletter ({counts.newsletterOnly})
              </button>
              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'ADMIN'
                    ? 'bg-accent-burgundy text-white shadow-sm'
                    : 'bg-warmwhite-light text-graphite hover:bg-taupe-light/40'
                }`}
              >
                Admins ({counts.admins})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="E-Mail, Vorname oder Nachname suchen..."
                className="w-full pl-10 pr-4 py-2.5 border border-taupe rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-burgundy text-sm"
              />
              <svg className="w-5 h-5 text-graphite/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Users & Subscribers List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-serif">
              {activeTab === 'ALL' && 'Alle Benutzer & Abonnenten'}
              {activeTab === 'ACCOUNT' && 'Kunden mit Konto'}
              {activeTab === 'NEWSLETTER' && 'Newsletter Abonnenten'}
              {activeTab === 'ADMIN' && 'Administratoren'}
              <span className="text-sm font-normal text-graphite/60 ml-2">({users.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-graphite/60">Daten werden geladen...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-graphite/60">Keine Einträge gefunden.</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-taupe-light/50 text-xs font-semibold text-graphite/60 uppercase tracking-wider">
                        <th className="py-3 px-4">E-Mail</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Konto-Typ</th>
                        <th className="py-3 px-4">Loyalty / Status</th>
                        <th className="py-3 px-4">Bestellungen</th>
                        <th className="py-3 px-4">Erstellt am</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-taupe-light/30 text-sm">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-warmwhite-light/60 transition-colors cursor-pointer"
                          onClick={() => {
                            if (user.hasAccount) {
                              setSelectedUserId(user.id);
                            }
                          }}
                        >
                          <td className="py-3.5 px-4 font-medium text-graphite-dark">
                            {user.email}
                          </td>
                          <td className="py-3.5 px-4 text-graphite">
                            {user.firstName || user.lastName
                              ? `${user.firstName} ${user.lastName}`.trim()
                              : '–'}
                          </td>
                          <td className="py-3.5 px-4">
                            {user.role === 'ADMIN' ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                🛡️ Admin
                              </span>
                            ) : user.hasAccount ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                👤 Kundenkonto
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✉️ Nur Newsletter
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {user.hasAccount ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-accent-gold to-accent-burgundy text-white text-xs font-bold shadow-sm">
                                  {user.loyaltyLevel}
                                </div>
                                <div className="text-xs">
                                  <div className="font-medium text-graphite-dark">
                                    {getLoyaltyLevelName(user.loyaltyLevel)}
                                  </div>
                                  <div className="text-graphite/60">
                                    {user.loyaltyPoints.toLocaleString('de-CH')} Punkte
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-medium">
                                Active Newsletter
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-graphite">
                            {user.hasAccount ? user.ordersCount || 0 : '–'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-graphite/60">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-CH') : '–'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        if (user.hasAccount) setSelectedUserId(user.id);
                      }}
                      className="p-4 border border-taupe-light/60 rounded-xl bg-white hover:border-accent-burgundy/40 transition-colors shadow-sm cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-graphite-dark text-base">
                            {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                          </h3>
                          {user.firstName && <p className="text-xs text-graphite/60 mt-0.5">{user.email}</p>}
                        </div>
                        {user.role === 'ADMIN' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Admin
                          </span>
                        ) : user.hasAccount ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Konto
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Newsletter
                          </span>
                        )}
                      </div>

                      {user.hasAccount ? (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-taupe-light/40">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-gold to-accent-burgundy text-white text-xs font-bold flex items-center justify-center">
                            {user.loyaltyLevel}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-graphite-dark">{getLoyaltyLevelName(user.loyaltyLevel)}</span>
                            <span className="text-graphite/60 ml-2">({user.loyaltyPoints} Pkt.)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-graphite/60">
                          Newsletter Abonnent seit {new Date(user.createdAt).toLocaleDateString('de-CH')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={() => {
            fetchUsers();
            setSelectedUserId(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
