'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EmailTestPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleTest = async (type: string) => {
        if (!email) {
            alert('Bitte geben Sie eine E-Mail-Adresse ein.');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/debug-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type }),
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error('Test failed:', error);
            setResult({ success: false, error: 'Netzwerkfehler' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-light text-graphite-dark">
                        E-Mail System Test
                    </h1>
                    <p className="mt-2 text-graphite">
                        Testen Sie hier den Versand verschiedener E-Mail-Typen.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Test Konfiguration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empfänger E-Mail-Adresse
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="test@example.com"
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-accent-burgundy focus:border-accent-burgundy"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                An diese Adresse werden die Test-E-Mails gesendet.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={() => handleTest('INFO')}
                                disabled={loading}
                                variant="outline"
                            >
                                1. Einfacher Test (Info-Mail)
                            </Button>

                            <Button
                                onClick={() => handleTest('ORDER')}
                                disabled={loading}
                                variant="outline"
                            >
                                2. Bestellbestätigung (Kunde)
                            </Button>

                            <Button
                                onClick={() => handleTest('ADMIN_ORDER')}
                                disabled={loading}
                                variant="outline"
                            >
                                3. neue Bestellung (Admin-Benachrichtigung)
                            </Button>

                            <Button
                                onClick={() => handleTest('PASSWORD_RESET')}
                                disabled={loading}
                                variant="outline"
                            >
                                4. Passwort zurücksetzen
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card className={result.success ? "border-green-500" : "border-red-500"}>
                        <CardHeader>
                            <CardTitle className={result.success ? "text-green-700" : "text-red-700"}>
                                {result.success ? "✅ Test Erfolgreich" : "❌ Fehler"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
