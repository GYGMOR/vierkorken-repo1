'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EditableText } from '@/components/admin/EditableText';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const GIFT_CARD_AMOUNTS = [20, 30, 50, 70, 100, 150, 200];

export default function GiftCardsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user.role === 'ADMIN') setIsAdmin(true);
        });
    }
  }, [session]);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    setError('');

    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount < 10) {
      setError('Bitte wählen Sie einen Betrag von mindestens CHF 10.-');
      return;
    }

    if (!recipientEmail) {
      setError('Bitte geben Sie die E-Mail-Adresse des Empfängers ein');
      return;
    }

    if (!senderName) {
      setError('Bitte geben Sie Ihren Namen ein');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipientEmail,
          recipientName,
          senderName,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Kauf des Gutscheins');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-burgundy/10 mb-4">
                <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <EditableText
                settingKey="gutschein_page_header_title"
                defaultValue="Geschenkgutscheine"
                isAdmin={isAdmin}
                as="h1"
                className="text-h1 font-serif font-light text-graphite-dark mb-4"
              />
              <EditableText
                settingKey="gutschein_page_header_subtitle"
                defaultValue="Schenken Sie Weingenuss. Unsere Geschenkgutscheine sind das perfekte Geschenk für jeden Anlass und können online eingelöst werden."
                isAdmin={isAdmin}
                as="p"
                className="text-body-lg text-graphite max-w-2xl mx-auto"
                multiline={true}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Amount Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Betrag wählen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Predefined Amounts */}
                  <div className="grid grid-cols-3 gap-3">
                    {GIFT_CARD_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${selectedAmount === amount
                            ? 'border-accent-burgundy bg-accent-burgundy/5'
                            : 'border-taupe hover:border-graphite'
                          }`}
                      >
                        <div className="font-serif text-h4 text-graphite-dark">
                          CHF {amount}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="divider">oder</div>

                  {/* Custom Amount */}
                  <div>
                    <label className="block text-sm font-medium text-graphite-dark mb-2">
                      Eigener Betrag
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite">
                        CHF
                      </span>
                      <Input
                        type="number"
                        min="10"
                        step="1"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        className="pl-14"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-graphite/60 mt-1">
                      Mindestbetrag: CHF 10.-
                    </p>
                  </div>

                  {/* Selected Amount Display */}
                  {(selectedAmount || customAmount) && (
                    <div className="p-4 bg-accent-burgundy/5 rounded-lg border border-accent-burgundy/20">
                      <div className="flex items-center justify-between">
                        <span className="text-body text-graphite">Gutscheinwert:</span>
                        <span className="font-serif text-h3 text-accent-burgundy">
                          CHF {selectedAmount || parseFloat(customAmount || '0').toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right: Recipient Details */}
              <Card>
                <CardHeader>
                  <CardTitle>2. Empfänger & Nachricht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Ihr Name"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Max Mustermann"
                  />

                  <Input
                    label="Name des Empfängers"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Optional"
                  />

                  <Input
                    label="E-Mail des Empfängers"
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="empfaenger@example.com"
                  />

                  <div>
                    <label className="block text-sm font-medium text-graphite-dark mb-2">
                      Persönliche Nachricht (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={250}
                      className="input"
                      placeholder="Ihre persönliche Nachricht an den Empfänger..."
                    />
                    <p className="text-xs text-graphite/60 mt-1">
                      {message.length}/250 Zeichen
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-900">
                        Der Gutschein wird nach erfolgreichem Kauf per E-Mail an den Empfänger verschickt.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <div className="mt-8">
              <Button
                onClick={handlePurchase}
                disabled={isProcessing || !selectedAmount && !customAmount}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Wird verarbeitet...' : 'Jetzt kaufen'}
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-burgundy/10 mb-4">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-h4 text-graphite-dark mb-2">
                    Sofortige Zustellung
                  </h3>
                  <p className="text-body-sm text-graphite">
                    Der Gutschein wird direkt nach dem Kauf per E-Mail zugestellt
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-burgundy/10 mb-4">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-h4 text-graphite-dark mb-2">
                    Flexibel einlösbar
                  </h3>
                  <p className="text-body-sm text-graphite">
                    Online einlösbar für alle Weine und Events in unserem Shop
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-burgundy/10 mb-4">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-h4 text-graphite-dark mb-2">
                    Lange Gültigkeit
                  </h3>
                  <p className="text-body-sm text-graphite">
                    Der Gutschein ist 3 Jahre ab Kaufdatum gültig
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
