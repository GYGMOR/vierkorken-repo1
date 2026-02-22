'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface HomepageSection {
    identifier: string;
    title: string;
    isVisible: boolean;
    sortOrder: number;
}

export default function HomepageSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (session?.user?.role === 'ADMIN') {
            fetchSections();
        }
    }, [session, status, router]);

    const fetchSections = async () => {
        try {
            const res = await fetch('/api/homepage-sections');
            const data = await res.json();
            if (data.success) {
                setSections(data.sections || []);
            }
        } catch (err) {
            console.error('Error fetching sections:', err);
            setError('Fehler beim Laden der Sektionen.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/homepage-sections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Änderungen erfolgreich gespeichert!');
            } else {
                setError(data.error || 'Fehler beim Speichern.');
            }
        } catch (err) {
            console.error('Error saving:', err);
            setError('Ein unerwarteter Fehler ist aufgetreten.');
        } finally {
            setSaving(false);
        }
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index - 1];
        newSections[index - 1] = temp;

        // Update sortOrder
        newSections.forEach((s, idx) => { s.sortOrder = idx; });
        setSections(newSections);
    };

    const moveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + 1];
        newSections[index + 1] = temp;

        // Update sortOrder
        newSections.forEach((s, idx) => { s.sortOrder = idx; });
        setSections(newSections);
    };

    const toggleVisibility = (idx: number) => {
        const newSections = [...sections];
        newSections[idx].isVisible = !newSections[idx].isVisible;
        setSections(newSections);
    };

    if (loading || status === 'loading') {
        return (
            <AdminLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-light text-graphite-dark">
                        Startseiten Layout
                    </h1>
                    <p className="mt-2 text-graphite">
                        Ordnen Sie die Sektionen auf der Startseite an oder blenden Sie diese aus.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-lg border border-green-100">
                        {success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Sektionen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sections.map((section, idx) => (
                                <div key={section.identifier} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => moveUp(idx)}
                                                disabled={idx === 0}
                                                className="text-gray-400 hover:text-wine disabled:opacity-30 disabled:hover:text-gray-400"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => moveDown(idx)}
                                                disabled={idx === sections.length - 1}
                                                className="text-gray-400 hover:text-wine disabled:opacity-30 disabled:hover:text-gray-400"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-graphite-dark">{section.title}</h4>
                                            <p className="text-xs text-graphite/60 font-mono">{section.identifier}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-sm text-gray-600">
                                                {section.isVisible ? 'Sichtbar' : 'Versteckt'}
                                            </span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={section.isVisible}
                                                    onChange={() => toggleVisibility(idx)}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${section.isVisible ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${section.isVisible ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleSave} disabled={saving || sections.length === 0}>
                                {saving ? 'Speichern...' : 'Layout Speichern'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
