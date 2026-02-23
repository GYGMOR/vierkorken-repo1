'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';
import { ContactForm } from '../kontakt/ContactForm';
import { useSession } from 'next-auth/react';
import { SwipeGallery } from '@/components/ui/SwipeGallery';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

export default function MietenPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    const [headerImage, setHeaderImage] = useState('/images/layout/wein_regal_nah.jpg');
    const [galleryImages, setGalleryImages] = useState<string[]>(['/images/layout/Laden_Sessel.jpeg']);
    const [content, setContent] = useState(`
<h3 class="text-h4 font-serif text-graphite-dark mb-4 mt-8">Ausstattung & Vorteile</h3>
<ul class="space-y-4">
    <li class="flex items-start gap-3">
        <span class="text-graphite">Zentral gelegener Raum in Seengen mit stilvollem Ambiente</span>
    </li>
    <li class="flex items-start gap-3">
        <span class="text-graphite">Schnelles WLAN & moderne Präsentationstechnik (auf Anfrage)</span>
    </li>
    <li class="flex items-start gap-3">
        <span class="text-graphite">Catering-Optionen & individuelle Weinbegleitung möglich</span>
    </li>
    <li class="flex items-start gap-3">
        <span class="text-graphite">Ideal für Gruppen bis zu 20 Personen</span>
    </li>
</ul>
<div class="mt-8 bg-rose-light/20 p-6 rounded-xl border border-taupe-light/30">
    <p class="text-graphite-dark font-medium">Preise & Konditionen:</p>
    <p class="text-graphite text-sm mt-2">
        Gerne erstellen wir Ihnen ein individuelles Angebot basierend auf Ihren Anforderungen (Dauer, Teilnehmerzahl, Catering).
    </p>
</div>
    `);

    const [editorOpen, setEditorOpen] = useState<'header' | 'gallery' | 'content' | null>(null);
    const [tempContent, setTempContent] = useState(content);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings?keys=mieten_page_header_image,mieten_page_gallery,mieten_page_content');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.settings) {
                    const hImage = data.settings.find((s: any) => s.key === 'mieten_page_header_image');
                    const gImages = data.settings.find((s: any) => s.key === 'mieten_page_gallery');
                    const pContent = data.settings.find((s: any) => s.key === 'mieten_page_content');

                    if (hImage?.value) setHeaderImage(hImage.value);
                    if (gImages?.value) {
                        try {
                            const parsed = JSON.parse(gImages.value);
                            if (parsed.length > 0) setGalleryImages(parsed);
                        } catch (e) {
                            console.error('Failed to parse gallery images JSON');
                        }
                    }
                    if (pContent?.value) setContent(pContent.value);
                }
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const saveSetting = async (key: string, value: string) => {
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            fetchSettings();
            setEditorOpen(null);
        } catch (e) {
            console.error('Error saving setting:', e);
            alert('Speichern fehlgeschlagen');
        }
    };

    const handleGalleryUpload = async (url: string) => {
        const newImages = [...galleryImages, url];
        setGalleryImages(newImages);
        await saveSetting('mieten_page_gallery', JSON.stringify(newImages));
        setEditorOpen(null); // specific to this implementation style, can reopen later if needed
    };

    const removeGalleryImage = async (index: number) => {
        const newImages = galleryImages.filter((_, i) => i !== index);
        setGalleryImages(newImages);
        await saveSetting('mieten_page_gallery', JSON.stringify(newImages));
    };

    return (
        <MainLayout>
            <div className="bg-gradient-to-b from-warmwhite to-white min-h-screen">
                {/* Hero Section */}
                <section className="relative h-[400px] flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-graphite-dark">
                        <Image
                            src={headerImage}
                            alt="Mieten Background"
                            fill
                            className="object-cover opacity-40 transition-opacity duration-700"
                            priority
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setEditorOpen('header')}
                            className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-graphite rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Header-Bild ändern"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                    )}
                    <div className="relative z-10 text-center text-white px-4 max-w-3xl">
                        <h1 className="text-display font-serif font-light mb-6">Location Mieten</h1>
                        <p className="text-body-lg text-white/90">
                            Der ideale Raum für Ihre Ideen. Mieten Sie unsere inspirierende Weinboutique für Seminare, Meetings oder kleine Feiern.
                        </p>
                    </div>
                </section>

                <div className="container-custom py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-start mb-20 relative">
                        {/* Content Section */}
                        <div className="relative group p-4 -ml-4 rounded-xl transition-colors hover:bg-warmwhite-dark/20">
                            {isAdmin && (
                                <button
                                    onClick={() => { setTempContent(content); setEditorOpen('content'); }}
                                    className="absolute top-4 right-4 z-20 bg-white shadow-md text-graphite hover:text-blue-600 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                                    title="Text bearbeiten"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                            )}
                            <h2 className="text-h2 font-serif text-graphite-dark mb-6">Ihre Location in Seengen</h2>
                            <p className="text-graphite text-lg mb-6 leading-relaxed">
                                Unsere stilvoll eingerichtete Weinboutique bietet das perfekte Ambiente für ungestörte Meetings, kreative Workshops oder exklusive Präsentationen. Umgeben von edlen Tropfen entsteht eine entspannte und produktive Atmosphäre.
                            </p>

                            <div className="prose prose-stone max-w-none text-graphite" dangerouslySetInnerHTML={{ __html: content }} />
                        </div>

                        {/* Gallery Section */}
                        <div className="relative group">
                            {isAdmin && (
                                <button
                                    onClick={() => setEditorOpen('gallery')}
                                    className="absolute top-4 right-4 z-20 bg-white shadow-md text-graphite hover:text-blue-600 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                                    title="Galerie bearbeiten"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                            )}
                            <SwipeGallery images={galleryImages} />
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto mt-24">
                        <div className="text-center mb-8">
                            <h2 className="text-h2 font-serif text-graphite-dark">Mietanfrage senden</h2>
                            <p className="text-graphite mt-2">Bitte teilen Sie uns den geplanten Termin und Ihre Wünsche mit.</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-medium overflow-hidden border border-taupe-light/30">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Editor Modal */}
            {editorOpen === 'content' && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-6 lg:p-8 relative max-h-[90vh] flex flex-col">
                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">Inhalt bearbeiten</h2>
                        <div className="flex-1 overflow-y-auto min-h-[400px]">
                            <RichTextEditor content={tempContent} onChange={setTempContent} />
                        </div>
                        <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                            <button onClick={() => setEditorOpen(null)} className="btn btn-outline">Abbrechen</button>
                            <button onClick={() => saveSetting('mieten_page_content', tempContent)} className="btn btn-primary">Speichern</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Image Editor Modal */}
            {editorOpen === 'header' && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setEditorOpen(null)} className="absolute top-4 right-4 text-graphite/40 hover:text-graphite">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">Header-Bild ändern</h2>
                        <ImageUploader onUploadComplete={(url) => saveSetting('mieten_page_header_image', url)} />
                    </div>
                </div>
            )}

            {/* Gallery Editor Modal */}
            {editorOpen === 'gallery' && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setEditorOpen(null)} className="absolute top-4 right-4 text-graphite/40 hover:text-graphite">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">Galerie bearbeiten</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {galleryImages.map((img, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-taupe-light h-32">
                                    <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                                    <button
                                        onClick={() => removeGalleryImage(idx)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Löschen"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-taupe-light pt-6">
                            <h3 className="text-h5 font-serif text-graphite-dark mb-4">Neues Bild hinzufügen</h3>
                            <ImageUploader onUploadComplete={handleGalleryUpload} />
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
