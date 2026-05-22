'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getUserByScannerId } from '../actions/scanner';
import { redeemGiftActivation } from '../actions/loyalty';

const GIFT_QR_PREFIX = 'VIERKORKEN:GIFT:';

type ScanMode = 'customer' | 'gift-success' | 'idle';

interface GiftRedemptionResult {
  customerName: string;
  giftName: string;
  pointsDeducted: number;
  newBalance: number;
}

export default function LoyaltyScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [giftRedemption, setGiftRedemption] = useState<GiftRedemptionResult | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customer && !showCameraScanner && !giftRedemption && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [customer, showCameraScanner, giftRedemption]);

  const processScannedValue = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setMessage(null);

    if (trimmed.startsWith(GIFT_QR_PREFIX)) {
      // Gift redemption QR code
      const token = trimmed.slice(GIFT_QR_PREFIX.length);
      const result = await redeemGiftActivation(token);
      setIsLoading(false);
      setScanInput('');

      if ('error' in result && result.error) {
        setMessage({ text: result.error, type: 'error' });
        scanInputRef.current?.focus();
      } else if ('success' in result && result.success) {
        setGiftRedemption({
          customerName: result.customerName!,
          giftName: result.giftName!,
          pointsDeducted: result.pointsDeducted!,
          newBalance: result.newBalance!,
        });
      }
    } else {
      // Customer card scan (user ID)
      const result = await getUserByScannerId(trimmed);
      setIsLoading(false);

      if (result.error) {
        setMessage({ text: result.error, type: 'error' });
        setScanInput('');
        scanInputRef.current?.focus();
      } else if (result.user) {
        setCustomer(result.user);
        setTimeout(() => { amountInputRef.current?.focus(); }, 100);
      }
    }
  }, []);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processScannedValue(scanInput);
  };

  const handleCameraScanResult = useCallback((scannedId: string) => {
    setShowCameraScanner(false);
    setScanInput(scannedId);
    processScannedValue(scannedId);
  }, [processScannedValue]);

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !amount) return;

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount < 1) {
      setMessage({ text: 'Bitte einen gültigen Betrag (>= 1 CHF) eingeben.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/loyalty-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: customer.id, amount: numAmount }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Fehler beim Verbuchen');

      setMessage({
        text: `Erfolgreich! ${data.pointsAdded} Punkte für ${data.customerName} verbucht. Neuer Stand: ${data.newBalance} Punkte.`,
        type: 'success',
      });
      handleReset();
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCustomer(null);
    setAmount('');
    setScanInput('');
    setIsLoading(false);
    setShowCameraScanner(false);
    setGiftRedemption(null);
  };

  // Gift redemption success screen
  if (giftRedemption) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-16 text-center">
          {/* Green checkmark */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-serif font-light text-graphite-dark mb-2">Prämie eingelöst!</h2>
          <p className="text-graphite/70 mb-8">Die Prämie wurde erfolgreich abgebucht.</p>

          <div className="w-full bg-white rounded-2xl shadow-md border border-taupe-light/50 p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-graphite/60 text-sm">Kunde</span>
              <span className="font-semibold text-graphite-dark">{giftRedemption.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-graphite/60 text-sm">Prämie</span>
              <span className="font-semibold text-graphite-dark">{giftRedemption.giftName}</span>
            </div>
            <div className="h-px bg-taupe-light/40" />
            <div className="flex justify-between items-center">
              <span className="text-graphite/60 text-sm">Abgezogene Punkte</span>
              <span className="font-bold text-accent-burgundy">-{giftRedemption.pointsDeducted.toLocaleString('de-CH')} PTS</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-graphite/60 text-sm">Neuer Kontostand</span>
              <span className="font-bold text-graphite-dark">{giftRedemption.newBalance.toLocaleString('de-CH')} PTS</span>
            </div>
          </div>

          <Button onClick={handleReset} className="w-full">
            Nächsten Kunden scannen
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            Treueprogramm Scanner
          </h1>
          <p className="mt-2 text-graphite">
            Kundenkarte (QR oder Barcode) scannen und Punkte gutschreiben — oder Prämien-QR einlösen.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={!customer ? 'border-accent-burgundy shadow-md' : 'opacity-70'}>
            <CardHeader>
              <CardTitle>1. Karte Scannen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScanSubmit}>
                <div className="space-y-4">
                  <p className="text-sm text-graphite">
                    Kundenkarte scannen (Punkte gutschreiben) <strong>oder</strong> Prämien-QR scannen (Prämie einlösen).
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-graphite-dark mb-1">
                      Scan-Eingabe
                    </label>
                    <div className="flex gap-2">
                      <input
                        ref={scanInputRef}
                        type="text"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="Warten auf Scan..."
                        className="flex-1 px-4 py-2 bg-warmwhite-light border border-taupe rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/50 focus:border-accent-burgundy font-mono"
                        disabled={!!customer || isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowCameraScanner(true)}
                        disabled={!!customer || isLoading}
                        className="flex items-center justify-center w-11 h-11 bg-accent-burgundy text-white rounded-lg hover:bg-accent-burgundy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        title="Kamera-Scanner öffnen"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!!customer || !scanInput || isLoading}
                  >
                    {isLoading && !customer ? 'Wird verarbeitet...' : 'Scannen / Suchen'}
                  </Button>
                  {customer && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full mt-2"
                      onClick={handleReset}
                    >
                      Anderen Kunden scannen
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className={customer ? 'border-accent-burgundy shadow-md' : 'opacity-50 pointer-events-none'}>
            <CardHeader>
              <CardTitle>2. Betrag & Punkte</CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-6">
                  <div className="bg-warmwhite-light p-4 rounded-lg border border-taupe-light">
                    <h3 className="font-semibold text-graphite-dark text-lg mb-1">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-sm text-graphite mb-3">{customer.email}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-graphite">Aktuelle Punkte:</span>
                      <span className="font-bold text-accent-burgundy text-lg">{customer.loyaltyPoints}</span>
                    </div>
                  </div>

                  <form onSubmit={handleAmountSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite-dark mb-1">
                        Einkaufsbetrag (CHF)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite/60 font-medium">CHF</span>
                        <input
                          ref={amountInputRef}
                          type="number"
                          step="0.01"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="z.B. 86.99"
                          className="w-full pl-12 pr-4 py-3 bg-white border border-taupe rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy/50 focus:border-accent-burgundy font-semibold text-lg"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <p className="text-xs text-graphite/60 mt-2">
                        Punkte werden abgerundet (z.B. 86.99 CHF = 86 Punkte).
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-6 text-lg"
                      disabled={!amount || isLoading}
                    >
                      {isLoading ? 'Wird verbucht...' : 'Punkte gutschreiben'}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-graphite/60 py-8">
                  <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  <p>Bitte zuerst einen Kunden scannen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showCameraScanner && (
        <CameraScannerModal
          onResult={handleCameraScanResult}
          onClose={() => setShowCameraScanner(false)}
        />
      )}
    </AdminLayout>
  );
}

function CameraScannerModal({
  onResult,
  onClose,
}: {
  onResult: (value: string) => void;
  onClose: () => void;
}) {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const hasResultRef = useRef(false);

  useEffect(() => {
    let scanner: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode('camera-scanner-region');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText: string) => {
            if (hasResultRef.current) return;
            hasResultRef.current = true;
            scanner.stop().then(() => { onResult(decodedText); }).catch(() => { onResult(decodedText); });
          },
          () => {}
        );

        setIsStarting(false);
      } catch (err: any) {
        setIsStarting(false);
        if (err?.toString().includes('NotAllowedError')) {
          setError('Kamerazugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.');
        } else if (err?.toString().includes('NotFoundError')) {
          setError('Keine Kamera gefunden.');
        } else {
          setError(`Kamera konnte nicht gestartet werden: ${err?.message || err}`);
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onResult]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-warmwhite rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-taupe-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-burgundy/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-graphite-dark">Kamera-Scanner</h2>
              <p className="text-xs text-graphite/60">Kundenkarte oder Prämien-QR scannen</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-graphite hover:bg-taupe-light/50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium mb-2">Scanner-Fehler</p>
              <p className="text-sm text-graphite">{error}</p>
            </div>
          ) : (
            <>
              {isStarting && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-burgundy mr-3" />
                  <span className="text-graphite">Kamera wird gestartet...</span>
                </div>
              )}
              <div
                id="camera-scanner-region"
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: isStarting ? 0 : 300 }}
              />
            </>
          )}
        </div>

        <div className="p-4 border-t border-taupe-light bg-warmwhite-light/50">
          <p className="text-xs text-graphite/60 text-center">
            Halten Sie die Kundenkarte <strong>oder</strong> den Prämien-QR-Code vor die Kamera.
          </p>
        </div>
      </div>
    </div>
  );
}
