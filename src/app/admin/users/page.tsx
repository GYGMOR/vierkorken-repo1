'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { getLoyaltyLevelName } from '@/lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            Benutzer verwalten
          </h1>
          <p className="mt-2 text-graphite">Alle Benutzer und ihre Aktivitäten</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen..."
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Alle Rollen</option>
                <option value="CUSTOMER">Kunde</option>
                <option value="ADMIN">Admin</option>
                <option value="SOMMELIER">Sommelier</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benutzer ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">Laden...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Rolle</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Loyalty</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Bestellungen</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Registriert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.role === 'SOMMELIER' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent-gold to-accent-burgundy text-white text-sm font-bold">
                                {user.loyaltyLevel}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-graphite-dark">
                                  {getLoyaltyLevelName(user.loyaltyLevel)}
                                </div>
                                <div className="text-xs text-graphite/60">
                                  {user.loyaltyPoints.toLocaleString('de-CH')} Punkte
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{user._count.orders}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('de-CH')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {/* Header with Name and Role */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-graphite-dark">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'SOMMELIER' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Loyalty Info */}
                      <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold to-accent-burgundy text-white text-sm font-bold flex-shrink-0">
                          {user.loyaltyLevel}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-graphite-dark">
                            {getLoyaltyLevelName(user.loyaltyLevel)}
                          </div>
                          <div className="text-xs text-graphite/60">
                            {user.loyaltyPoints.toLocaleString('de-CH')} Punkte
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Bestellungen:</span>
                          <span className="ml-2 font-medium">{user._count.orders}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Registriert:</span>
                          <span className="ml-2 font-medium">
                            {new Date(user.createdAt).toLocaleDateString('de-CH')}
                          </span>
                        </div>
                      </div>
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
