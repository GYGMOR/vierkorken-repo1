'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function GiftSettingsCard() {
    const [minOrder, setMinOrder] = useState<string>('50');
    const [validityDays, setValidityDays] = useState<string>('14');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetch('/api/settings?keys=loyalty_gift_min_order,loyalty_gift_validity_days')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings) {
                    const min = data.settings.find((s: any) => s.key === 'loyalty_gift_min_order');
                    const val = data.settings.find((s: any) => s.key === 'loyalty_gift_validity_days');
                    if (min?.value) setMinOrder(min.value);
                    if (val?.value) setValidityDays(val.value);
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([
                    { key: 'loyalty_gift_min_order', value: minOrder },
                    { key: 'loyalty_gift_validity_days', value: validityDays }
                ])
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Einstellungen gespeichert!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Fehler beim Speichern.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Verbindungsfehler.' });
        }
        setIsSaving(false);
    };

    const handleTestPopup = () => {
        // Obens a new tab to user account with demo param
        window.open('/konto?demoLoyalty=true', '_blank');
    };

    if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;

    return (
        <Card className="border-accent-gold/30 bg-gradient-to-br from-white to-warmwhite shadow-md">
            <CardHeader className="border-b border-taupe-light/30">
                <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Geschenk-Bedingungen (Global)
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-graphite-dark mb-2">
                            Mindestbestellwert für Gratis-Geschenke (CHF)
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="w-full p-2 border rounded border-taupe-light focus:border-graphite bg-white"
                            value={minOrder}
                            onChange={e => setMinOrder(e.target.value)}
                        />
                        <p className="text-xs text-graphite/60 mt-1">
                            Geschenke können nur eingelöst werden, wenn der Warenkorb (ohne Geschenk) diesen Wert erreicht.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-graphite-dark mb-2">
                            Verfügbarkeit der Geschenke (Tage)
                        </label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-2 border rounded border-taupe-light focus:border-graphite bg-white"
                            value={validityDays}
                            onChange={e => setValidityDays(e.target.value)}
                        />
                        <p className="text-xs text-graphite/60 mt-1">
                            Wie lange Benutzer Zeit haben, ein Geschenk auszuwählen, nachdem sie ein neues Level erreicht haben.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-taupe-light/30">
                    <Button
                        variant="secondary"
                        onClick={handleTestPopup}
                        className="bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 hover:text-accent-gold border-accent-gold/20"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Geschenk-Popup Testen
                    </Button>

                    <div className="flex items-center gap-4">
                        {message && (
                            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </span>
                        )}
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Speichert...' : 'Einstellungen speichern'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
