'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';

export default function AdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchSubscriberCount();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings/maintenance-mode');
      const data = await res.json();
      setMaintenanceMode(data.enabled);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }

  async function fetchSubscriberCount() {
    try {
      const res = await fetch('/api/maintenance/subscriber-count');
      const data = await res.json();
      setSubscriberCount(data.count);
    } catch (error) {
      console.error('Failed to fetch subscriber count:', error);
    }
  }

  async function toggleMaintenance(enabled: boolean) {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings/maintenance-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      const data = await res.json();

      if (res.ok) {
        setMaintenanceMode(enabled);
        setMessage({
          type: 'success',
          text: enabled
            ? 'Coming Soon Modus aktiviert'
            : `Coming Soon Modus deaktiviert. ${data.notified || 0} Abonnenten wurden benachrichtigt.`,
        });

        // Refresh subscriber count
        if (!enabled) {
          fetchSubscriberCount();
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Aktualisieren' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verbindungsfehler. Bitte versuchen Sie es erneut.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-graphite-dark">Einstellungen</h1>
          <p className="text-graphite mt-2">Verwalten Sie die Systemeinstellungen</p>
        </div>

        {/* Coming Soon Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon Modus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-warmwhite rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-graphite-dark text-lg">Website-Sperre</p>
                <p className="text-sm text-graphite mt-1">
                  Zeigt allen Besuchern (außer Admins) die Coming Soon Seite an. Nützlich für Wartungsarbeiten oder vor dem Launch.
                </p>
              </div>
              <Toggle
                checked={maintenanceMode}
                onChange={toggleMaintenance}
                disabled={loading}
              />
            </div>

            {/* Subscriber Info */}
            <div className="pt-4 border-t border-graphite-light/20">
              <div className="bg-warmwhite-light p-4 rounded-lg">
                <p className="text-sm text-graphite mb-2">
                  <strong className="text-graphite-dark">Registrierte Interessenten:</strong>
                </p>
                <p className="text-2xl font-bold text-accent-burgundy">
                  {subscriberCount}
                </p>
                <p className="text-xs text-graphite-light mt-1">
                  {maintenanceMode
                    ? 'Diese Personen erhalten eine Benachrichtigung, wenn Sie den Coming Soon Modus deaktivieren.'
                    : 'Bereits benachrichtigte Abonnenten werden bei dieser Zahl nicht mitgezählt.'}
                </p>
              </div>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Warning */}
            {maintenanceMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Coming Soon Modus ist aktiv
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Besucher sehen momentan nur die Coming Soon Seite. Als Admin können Sie die Website normal nutzen.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Settings Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Weitere Einstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-graphite-light text-center py-8">
              Weitere Einstellungen werden hier in Zukunft verfügbar sein.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
