'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { EventTemplateEditor } from '@/components/events/EventTemplateEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface EventTemplate {
    id: string;
    title: string;
    description: string;
    content: string | null;
    imageUrl: string | null;
    order: number;
    isActive: boolean;
}

export default function DeinEventPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    const [templates, setTemplates] = useState<EventTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);

    // Contact form state
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Anfrage: Dein Event', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Header image state
    const [headerImage, setHeaderImage] = useState<string>('/images/layout/wein_regal_nah.jpg');
    const [headerImageEditorOpen, setHeaderImageEditorOpen] = useState(false);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/event-templates');
            if (res.ok) {
                const data = await res.json();
                const templates = data.templates || [];
                setTemplates(isAdmin ? templates : templates.filter((t: EventTemplate) => t.isActive));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings?key=event_page_header_image');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.setting?.value) {
                    setHeaderImage(data.setting.value);
                }
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    };

    useEffect(() => {
        fetchTemplates();
        fetchSettings();
    }, [isAdmin]);

    const handleHeaderImageUpload = async (url: string) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'event_page_header_image', value: url }),
            });
            if (res.ok) {
                setHeaderImage(url);
                setHeaderImageEditorOpen(false);
            }
        } catch (e) {
            console.error('Error saving header image:', e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Vorlage wirklich löschen?')) return;
        try {
            await fetch(`/api/admin/event-templates?id=${id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (e) {
            console.error(e);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: '' });

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus({ type: 'success', message: 'Ihre Anfrage wurde erfolgreich gesendet.' });
                setFormData({ name: '', email: '', subject: 'Anfrage: Dein Event', message: '' });
            } else {
                setSubmitStatus({ type: 'error', message: data.error || 'Fehler beim Senden' });
            }
        } catch (e) {
            setSubmitStatus({ type: 'error', message: 'Ein unerwarteter Fehler ist aufgetreten.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="bg-gradient-to-b from-warmwhite to-white min-h-screen">
                <section className="relative h-[400px] flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-graphite-dark">
                        <Image
                            src={headerImage}
                            alt="Dein Event Background"
                            fill
                            className="object-cover opacity-40 transition-opacity duration-700"
                            priority
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setHeaderImageEditorOpen(true)}
                            className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-graphite rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Header-Bild ändern"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                    )}
                    <div className="relative z-10 text-center text-white px-4 max-w-3xl">
                        <h1 className="text-display font-serif font-light mb-6">Dein Event</h1>
                        <p className="text-body-lg text-white/90">
                            Ob Wein-Tasting, Firmenevent oder private Feier.
                            Wir bieten den perfekten Rahmen für unvergessliche Momente in der VIER KORKEN Weinboutique.
                        </p>
                    </div>
                </section>

                <div className="container-custom py-16">

                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-h2 font-serif text-graphite-dark">Unsere Angebote</h2>
                        {isAdmin && (
                            <button
                                onClick={() => { setEditingTemplate(null); setEditorOpen(true); }}
                                className="btn btn-secondary text-sm"
                            >
                                + Neues Angebot hinzufügen
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-graphite">Lade Angebote...</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12 text-graphite/60 italic">
                            Derzeit sind keine Event-Angebote verfügbar. Bitte kontaktieren Sie uns direkt für individuelle Anfragen.
                        </div>
                    ) : (
                        <div className="space-y-12 mb-20">
                            {templates.map((template, idx) => (
                                <div key={template.id} className={`flex flex-col md:flex-row gap-8 items-center bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''} relative group`}>

                                    {/* Image */}
                                    <div className="w-full md:w-1/2 h-[350px] relative bg-gray-100 flex-shrink-0">
                                        {template.imageUrl ? (
                                            <Image src={template.imageUrl} alt={template.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-graphite/40 bg-warmwhite-dark">Kein Bild</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="w-full md:w-1/2 p-8 lg:p-12">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-h3 font-serif text-graphite-dark">{template.title}</h3>
                                            {!template.isActive && isAdmin && (
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Inaktiv</span>
                                            )}
                                        </div>
                                        <p className="text-graphite mb-6 text-lg">{template.description}</p>

                                        {template.content && (
                                            <div className="prose prose-sm prose-stone text-graphite/80" dangerouslySetInnerHTML={{ __html: template.content }} />
                                        )}

                                        <div className="mt-8">
                                            <button
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, subject: `Anfrage: ${template.title}` }));
                                                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="btn btn-outline"
                                            >
                                                Jetzt Anfragen
                                            </button>
                                        </div>
                                    </div>

                                    {/* Admin Controls */}
                                    {isAdmin && (
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded-lg shadow-sm">
                                            <button
                                                onClick={() => { setEditingTemplate(template); setEditorOpen(true); }}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="Bearbeiten"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Löschen"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contact Form Section */}
                    <div id="contact-form" className="max-w-3xl mx-auto bg-white rounded-2xl shadow-strong p-8 md:p-12 border border-taupe-light/30">
                        <div className="text-center mb-10">
                            <h2 className="text-h2 font-serif text-graphite-dark mb-4">Event anfragen</h2>
                            <p className="text-graphite">
                                Teilen Sie uns Ihre Wünsche mit. Wir setzen uns umgehend mit Ihnen in Verbindung, um Ihr perfektes Event zu planen.
                            </p>
                        </div>

                        {submitStatus.type && (
                            <div className={`mb-8 p-4 rounded-lg text-center ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
                                {submitStatus.message}
                            </div>
                        )}

                        <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-graphite-dark mb-2">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-taupe-light rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-graphite-dark mb-2">E-Mail *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-taupe-light rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-2">Betreff *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-taupe-light rounded-lg focus:ring-2 focus:ring-accent-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-2">Nachricht *</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Bitte geben Sie auch das gewünschte Datum und die ungefähre Personenzahl an..."
                                    className="w-full px-4 py-3 border border-taupe-light rounded-lg focus:ring-2 focus:ring-accent-burgundy resize-y"
                                />
                            </div>

                            <div className="text-center pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary px-12 py-3 text-lg"
                                >
                                    {isSubmitting ? 'Wird gesendet...' : 'Anfrage absenden'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            {editorOpen && (
                <EventTemplateEditor
                    initialTemplate={editingTemplate}
                    onClose={() => setEditorOpen(false)}
                    onUpdate={fetchTemplates}
                />
            )}

            {headerImageEditorOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setHeaderImageEditorOpen(false)}
                            className="absolute top-4 right-4 text-graphite/40 hover:text-graphite transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">Header-Bild ändern</h2>
                        <ImageUploader onUploadComplete={handleHeaderImageUpload} />
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
