'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  validFrom: string;
  validUntil: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  description: string | null;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    maxUses: '',
    maxUsesPerUser: '1',
    description: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const prefix = formData.type === 'GIFT_CARD' ? 'GESCHENK' : 'RABATT';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code: `${prefix}${randomPart}` });
  };

  const handleCreateCoupon = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          type: formData.type,
          value: parseFloat(formData.value),
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          validFrom: new Date(formData.validFrom),
          validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          maxUsesPerUser: parseInt(formData.maxUsesPerUser),
          description: formData.description || null,
        }),
      });

      if (response.ok) {
        alert('Gutschein erfolgreich erstellt!');
        setShowCreateForm(false);
        loadCoupons();
        // Reset form
        setFormData({
          code: '',
          type: 'PERCENTAGE',
          value: '',
          minOrderAmount: '',
          maxDiscount: '',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: '',
          maxUses: '',
          maxUsesPerUser: '1',
          description: '',
        });
      } else {
        const data = await response.json();
        alert(`Fehler: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Fehler beim Erstellen des Gutscheins');
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        loadCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Möchten Sie diesen Gutschein wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-serif">Gutscheinverwaltung</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Abbrechen' : '+ Neuer Gutschein'}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Neuen Gutschein erstellen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gutscheincode</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="CODE123"
                    />
                    <Button variant="secondary" onClick={generateCode}>
                      Generieren
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Typ</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    <option value="PERCENTAGE">Prozent (%)</option>
                    <option value="FIXED_AMOUNT">Fester Betrag (CHF)</option>
                    <option value="GIFT_CARD">Geschenkgutschein</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Wert"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'PERCENTAGE' ? '15' : '50.00'}
                  required
                />

                <Input
                  label="Min. Bestellwert (CHF)"
                  type="number"
                  step="0.01"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="Optional"
                />

                {formData.type === 'PERCENTAGE' && (
                  <Input
                    label="Max. Rabatt (CHF)"
                    type="number"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Optional"
                  />
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Gültig ab"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />

                <Input
                  label="Gültig bis"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  placeholder="Optional (unbegrenzt)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Max. Verwendungen (gesamt)"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Optional (unbegrenzt)"
                />

                <Input
                  label="Max. Verwendungen pro Benutzer"
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Beschreibung"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional"
              />

              <Button onClick={handleCreateCoupon} className="w-full">
                Gutschein erstellen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Coupons List */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Gutscheine ({coupons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-graphite">Lädt...</p>
            ) : coupons.length === 0 ? (
              <p className="text-center text-graphite">Keine Gutscheine vorhanden</p>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="p-4 border rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg font-bold text-accent-burgundy">
                          {coupon.code}
                        </code>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {coupon.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.value}%`
                            : `CHF ${coupon.value}`}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-graphite mb-1">{coupon.description}</p>
                      )}
                      <div className="text-xs text-graphite/70">
                        Verwendet: {coupon.currentUses}/{coupon.maxUses || '∞'} |{' '}
                        Gültig: {new Date(coupon.validFrom).toLocaleDateString('de-CH')} -{' '}
                        {coupon.validUntil
                          ? new Date(coupon.validUntil).toLocaleDateString('de-CH')
                          : '∞'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                      >
                        {coupon.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-red-600"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
