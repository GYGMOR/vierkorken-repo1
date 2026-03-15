'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserDetailModal({ userId, onClose, onUpdate }: UserDetailModalProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Points adjustment
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsAdjustment = async () => {
    if (!pointsToAdd || !adjustmentReason.trim()) {
      alert('Bitte Punkte und Grund angeben');
      return;
    }

    if (!confirm(`Wirklich ${pointsToAdd > 0 ? 'hinzufügen' : 'entfernen'}: ${Math.abs(pointsToAdd)} Punkte?`)) {
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: pointsToAdd,
          reason: adjustmentReason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setPointsToAdd(0);
        setAdjustmentReason('');
        fetchUserDetails();
        onUpdate();
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Fehler: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto"></div>
          <p className="mt-4 text-graphite">Lade Benutzerdaten...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-light text-graphite-dark">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-graphite">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-graphite-dark transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
              <div className="text-sm text-graphite mb-1">Loyalty Level</div>
              <div className="text-2xl font-bold text-accent-burgundy">Level {user.loyaltyLevel}</div>
            </div>
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
              <div className="text-sm text-graphite mb-1">Punkte</div>
              <div className="text-2xl font-bold text-graphite-dark">{user.loyaltyPoints}</div>
            </div>
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
              <div className="text-sm text-graphite mb-1">Total ausgegeben</div>
              <div className="text-2xl font-bold text-graphite-dark">CHF {Number(user.totalSpent).toFixed(2)}</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
            <h3 className="font-semibold text-graphite-dark mb-3">Kontaktinformationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-graphite">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-graphite">Telefon</div>
                <div className="font-medium">{user.phone || 'Nicht angegeben'}</div>
              </div>
              <div>
                <div className="text-sm text-graphite">Rolle</div>
                <div className="font-medium">{user.role}</div>
              </div>
              <div>
                <div className="text-sm text-graphite">Registriert</div>
                <div className="font-medium">{new Date(user.createdAt).toLocaleDateString('de-CH')}</div>
              </div>
            </div>
          </div>

          {/* Points Adjustment */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-graphite-dark mb-3">Punkte verwalten</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-graphite mb-1">Punkte (+ hinzufügen, - entfernen)</label>
                  <input
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                    placeholder="z.B. 100 oder -50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                  />
                </div>
                <div>
                  <label className="block text-sm text-graphite mb-1">Grund</label>
                  <input
                    type="text"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="z.B. Punkte verloren"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                  />
                </div>
              </div>
              <Button
                onClick={handlePointsAdjustment}
                disabled={updating || !pointsToAdd || !adjustmentReason.trim()}
                className="w-full"
              >
                {updating ? 'Wird gespeichert...' : 'Punkte anpassen'}
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-accent-burgundy">{user._count.orders}</div>
              <div className="text-sm text-graphite mt-1">Bestellungen</div>
            </div>
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-accent-burgundy">{user._count.eventTickets}</div>
              <div className="text-sm text-graphite mt-1">Event Tickets</div>
            </div>
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-accent-burgundy">{user._count.reviews}</div>
              <div className="text-sm text-graphite mt-1">Bewertungen</div>
            </div>
          </div>

          {/* Recent Orders */}
          {user.orders && user.orders.length > 0 && (
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
              <h3 className="font-semibold text-graphite-dark mb-3">Letzte Bestellungen</h3>
              <div className="space-y-2">
                {user.orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-taupe-light last:border-b-0">
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-graphite">{new Date(order.createdAt).toLocaleDateString('de-CH')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">CHF {Number(order.total).toFixed(2)}</div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loyalty History */}
          {user.loyaltyHistory && user.loyaltyHistory.length > 0 && (
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
              <h3 className="font-semibold text-graphite-dark mb-3">Punkte-Verlauf (letzte 10)</h3>
              <div className="space-y-2">
                {user.loyaltyHistory.slice(0, 10).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-taupe-light last:border-b-0">
                    <div>
                      <div className="font-medium">{transaction.reason}</div>
                      <div className="text-sm text-graphite">{new Date(transaction.createdAt).toLocaleDateString('de-CH')}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </div>
                      <div className="text-sm text-graphite">→ {transaction.balanceAfter}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Tickets */}
          {user.eventTickets && user.eventTickets.length > 0 && (
            <div className="bg-warmwhite border border-taupe-light rounded-lg p-4">
              <h3 className="font-semibold text-graphite-dark mb-3">Event Tickets</h3>
              <div className="space-y-2">
                {user.eventTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-taupe-light last:border-b-0">
                    <div>
                      <div className="font-medium">{ticket.event.title}</div>
                      <div className="text-sm text-graphite">
                        {new Date(ticket.event.startDateTime).toLocaleDateString('de-CH')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{ticket.ticketNumber}</div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          ticket.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Schliessen
          </Button>
        </div>
      </div>
    </div>
  );
}
