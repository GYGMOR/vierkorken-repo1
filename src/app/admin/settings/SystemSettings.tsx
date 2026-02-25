'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const SEASONS: { value: Season; label: string; icon: string; description: string }[] = [
  { value: 'winter', label: 'Winter', icon: '❄️', description: 'Schneeflocken & Winter-Video' },
  { value: 'spring', label: 'Frühling', icon: '🌸', description: 'Kirschblüten & Frühlings-Video' },
  { value: 'summer', label: 'Sommer', icon: '☀️', description: 'Sonnenstrahlen & Sommer-Video' },
  { value: 'autumn', label: 'Herbst', icon: '🍂', description: 'Fallende Blätter & Herbst-Video' },
];

export function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [currentSeason, setCurrentSeason] = useState<Season>('winter');
  const [loading, setLoading] = useState(false);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [seasonMessage, setSeasonMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchSubscriberCount();
    fetchSeason();
  }, []);

  async function fetchSeason() {
    try {
      const res = await fetch('/api/admin/settings/season');
      const data = await res.json();
      if (data.success) {
        setCurrentSeason(data.season);
      }
    } catch (error) {
      console.error('Failed to fetch season:', error);
    }
  }

  async function updateSeason(season: Season) {
    setSeasonLoading(true);
    setSeasonMessage(null);

    try {
      const res = await fetch('/api/admin/settings/season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentSeason(season);
        setSeasonMessage({
          type: 'success',
          text: `Jahreszeit auf "${SEASONS.find(s => s.value === season)?.label}" geändert. Die Seite wird die neuen Effekte anzeigen.`,
        });
      } else {
        setSeasonMessage({ type: 'error', text: data.error || 'Fehler beim Aktualisieren' });
      }
    } catch (error) {
      setSeasonMessage({ type: 'error', text: 'Verbindungsfehler. Bitte versuchen Sie es erneut.' });
    } finally {
      setSeasonLoading(false);
    }
  }

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
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-graphite-dark">System & Wartung</h2>
          <p className="text-graphite mt-2">Verwalten Sie den Wartungsmodus und saisonale Effekte</p>
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
                className={`p-4 rounded-lg text-sm ${message.type === 'success'
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

        {/* Season Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Jahreszeit & Saisonale Effekte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-graphite text-sm">
              Wählen Sie die aktuelle Jahreszeit. Dies ändert das Header-Video und die fallenden Partikel auf der Website.
            </p>

            {/* Season Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SEASONS.map((season) => (
                <button
                  key={season.value}
                  onClick={() => updateSeason(season.value)}
                  disabled={seasonLoading}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${currentSeason === season.value
                      ? 'border-accent-burgundy bg-accent-burgundy/10 shadow-md'
                      : 'border-taupe-light hover:border-accent-burgundy/50 hover:bg-warmwhite'
                    } ${seasonLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-3xl mb-2">{season.icon}</div>
                  <div className={`font-semibold ${currentSeason === season.value ? 'text-accent-burgundy' : 'text-graphite-dark'}`}>
                    {season.label}
                  </div>
                  <div className="text-xs text-graphite mt-1">{season.description}</div>
                  {currentSeason === season.value && (
                    <div className="mt-2 text-xs text-accent-burgundy font-medium">
                      ✓ Aktiv
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Season Message */}
            {seasonMessage && (
              <div
                className={`p-4 rounded-lg text-sm ${seasonMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
              >
                {seasonMessage.text}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Hinweis zu Videos</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Die Videos müssen unter <code className="bg-blue-100 px-1 rounded">public/images/layout/</code> mit folgenden Namen gespeichert sein:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                    <li>Weinshop_Werbevideo_Winter.mp4</li>
                    <li>Weinshop_Werbevideo_Fruehling.mp4</li>
                    <li>Weinshop_Werbevideo_Sommer.mp4</li>
                    <li>Weinshop_Werbevideo_Herbst.mp4</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
