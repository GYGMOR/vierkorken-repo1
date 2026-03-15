'use client';

import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import jsQR from 'jsqr';

interface ScanResult {
  valid: boolean;
  message: string;
  ticket?: {
    ticketNumber: string;
    event: string;
    holder: string;
    holderEmail?: string;
    checkedInAt?: string;
  };
  error?: string;
}

export default function AdminTicketScanner() {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<ScanResult & { timestamp: Date }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastScannedRef = useRef<string>('');
  const scanningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (scanning) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [scanning]);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          tick();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Fehler beim Zugriff auf die Kamera. Bitte Kamera-Berechtigungen überprüfen.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const tick = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleScanSuccess(code.data);
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const handleScanSuccess = async (qrText: string) => {
    // Prevent duplicate scans
    if (qrText === lastScannedRef.current || scanningRef.current) {
      return;
    }

    lastScannedRef.current = qrText;
    scanningRef.current = true;

    console.log('✅ QR Code scanned:', qrText);

    // Play success sound
    playBeep();

    // Send to API for validation
    try {
      const res = await fetch('/api/admin/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrText }),
      });

      const result: ScanResult = await res.json();

      setLastScan(result);
      setScanHistory((prev) => [{ ...result, timestamp: new Date() }, ...prev.slice(0, 9)]);

      // Resume scanning after 3 seconds
      setTimeout(() => {
        setLastScan(null);
        lastScannedRef.current = '';
        scanningRef.current = false;
      }, 3000);
    } catch (error: any) {
      console.error('Error scanning ticket:', error);
      setLastScan({
        valid: false,
        message: 'Fehler beim Scannen',
        error: error.message,
      });

      setTimeout(() => {
        setLastScan(null);
        lastScannedRef.current = '';
        scanningRef.current = false;
      }, 3000);
    }
  };

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const toggleScanning = () => {
    setScanning(!scanning);
    if (scanning) {
      // Reset when stopping
      lastScannedRef.current = '';
      scanningRef.current = false;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            Ticket Scanner
          </h1>
          <p className="mt-2 text-graphite">
            Scanne QR-Codes der Event-Tickets für Check-in
          </p>
        </div>

        {/* Scanner Control */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button
                onClick={toggleScanning}
                className={`w-full md:w-auto ${scanning ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {scanning ? '📷 Scanner stoppen' : '📷 Scanner starten'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scanner Area */}
        {scanning && (
          <Card>
            <CardHeader>
              <CardTitle>Kamera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-md mx-auto">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border-4 border-accent-burgundy"
                    style={{ maxHeight: '400px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scan target overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-4 border-white rounded-lg opacity-50"></div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy text-white rounded-lg">
                    <div className="animate-pulse">●</div>
                    <span>Scanning...</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-graphite text-center mt-4">
                Halte den QR-Code mittig vor die Kamera
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scan Result */}
        {lastScan && (
          <Card className={`border-4 ${lastScan.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-6xl mb-4 ${lastScan.valid ? 'animate-bounce' : 'animate-pulse'}`}>
                  {lastScan.valid ? '✅' : '❌'}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${lastScan.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {lastScan.message}
                </h2>
                {lastScan.ticket && (
                  <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                    <div className="flex justify-between">
                      <span className="font-semibold">Ticket:</span>
                      <span>{lastScan.ticket.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Event:</span>
                      <span>{lastScan.ticket.event}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Name:</span>
                      <span>{lastScan.ticket.holder}</span>
                    </div>
                    {lastScan.ticket.holderEmail && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Email:</span>
                        <span className="text-sm">{lastScan.ticket.holderEmail}</span>
                      </div>
                    )}
                  </div>
                )}
                {lastScan.error && (
                  <div className="mt-4 text-red-700 text-sm">
                    {lastScan.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Letzte Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      scan.valid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{scan.valid ? '✅' : '❌'}</span>
                        <div>
                          <div className="font-medium">{scan.message}</div>
                          {scan.ticket && (
                            <div className="text-sm text-graphite">
                              {scan.ticket.ticketNumber} - {scan.ticket.holder}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-graphite">
                        {scan.timestamp.toLocaleTimeString('de-CH')}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{scan.valid ? '✅' : '❌'}</span>
                        <div className="flex-1">
                          <div className="font-medium">{scan.message}</div>
                          <div className="text-xs text-graphite mt-1">
                            {scan.timestamp.toLocaleTimeString('de-CH')}
                          </div>
                        </div>
                      </div>
                      {scan.ticket && (
                        <div className="pl-11 text-sm text-graphite">
                          <div>{scan.ticket.ticketNumber}</div>
                          <div>{scan.ticket.holder}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
