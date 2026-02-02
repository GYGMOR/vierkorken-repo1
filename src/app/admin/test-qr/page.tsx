'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import QRCode from 'qrcode';

interface Ticket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  event: {
    title: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  status: string;
}

export default function TestQRPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [qrImages, setQrImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/test-qr');
      const data = await res.json();

      if (data.success) {
        setTickets(data.data);

        // Generate QR codes for all tickets
        const qrPromises = data.data.map(async (ticket: Ticket) => {
          const qrDataUrl = await QRCode.toDataURL(ticket.qrCode, {
            width: 300,
            margin: 2,
          });
          return { id: ticket.id, qrDataUrl };
        });

        const qrResults = await Promise.all(qrPromises);
        const qrMap: { [key: string]: string } = {};
        qrResults.forEach(({ id, qrDataUrl }) => {
          qrMap[id] = qrDataUrl;
        });
        setQrImages(qrMap);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-light text-graphite-dark">
            Test QR-Codes
          </h1>
          <p className="mt-2 text-graphite">
            Hier kannst du die QR-Codes deiner Tickets sehen und mit dem Scanner testen
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
            <p className="mt-4 text-graphite">Lade Tickets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.slice(0, 9).map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{ticket.event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {qrImages[ticket.id] && (
                      <div className="bg-white p-4 rounded-lg border-2 border-accent-burgundy">
                        <img
                          src={qrImages[ticket.id]}
                          alt={`QR Code ${ticket.ticketNumber}`}
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-semibold">Ticket:</span> {ticket.ticketNumber}
                      </div>
                      <div>
                        <span className="font-semibold">Inhaber:</span> {ticket.user.firstName} {ticket.user.lastName}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-2 py-1 rounded text-xs ${
                          ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="pt-2 font-mono text-xs text-gray-500 break-all">
                        {ticket.qrCode}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 So testest du:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Öffne diese Seite auf einem Gerät</li>
            <li>Öffne den Scanner auf einem anderen Gerät (oder Browser)</li>
            <li>Scanne einen der QR-Codes oben</li>
            <li>Du solltest grünes ✅ Feedback sehen</li>
            <li>Das Ticket wird als "CHECKED_IN" markiert</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}
