'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  qrCode: string;
  eventTitle: string;
  eventDate?: string;
  holderName: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  ticketNumber,
  qrCode,
  eventTitle,
  eventDate,
  holderName,
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        qrCode,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#6B1B29', // Burgundy
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );

      // Also generate data URL for download
      QRCode.toDataURL(qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#6B1B29',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR data URL:', err));
    }
  }, [isOpen, qrCode]);

  if (!isOpen) return null;

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `ticket-${ticketNumber}-qr.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-warmwhite rounded-lg shadow-xl max-w-md w-full p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-serif font-light text-graphite-dark mb-2">
            Ticket QR-Code
          </h2>
          <p className="text-sm text-graphite">{eventTitle}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6 p-6 bg-white rounded-lg shadow-soft">
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>

        {/* Ticket Info */}
        <div className="bg-taupe-light rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-graphite/60">Ticket-Nummer:</span>
            <span className="font-mono font-semibold text-graphite-dark">{ticketNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-graphite/60">Inhaber:</span>
            <span className="font-semibold text-graphite-dark">{holderName}</span>
          </div>
          {eventDate && (
            <div className="flex justify-between text-sm">
              <span className="text-graphite/60">Datum:</span>
              <span className="font-semibold text-graphite-dark">{eventDate}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-accent-burgundy/5 border border-accent-burgundy/20 rounded-lg p-4 mb-6">
          <p className="text-xs text-graphite text-center">
            Zeigen Sie diesen QR-Code beim Check-in vor Ort vor
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleDownloadQR}
          >
            QR-Code speichern
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Schließen
          </Button>
        </div>
      </div>
    </div>
  );
}
