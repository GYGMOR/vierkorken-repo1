'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface EditablePageHeaderProps {
    pageKey: string; // e.g., 'weine', 'news'
    defaultTitle: string;
    defaultSubtitle?: string;
    defaultImage?: string;
    showImageEditor?: boolean;
    children?: React.ReactNode;
}

export function EditablePageHeader({
    pageKey,
    defaultTitle,
    defaultSubtitle,
    defaultImage = '/images/layout/wein_regal_nah.jpg',
    showImageEditor = true,
    children
}: EditablePageHeaderProps) {
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);

    const [title, setTitle] = useState(defaultTitle);
    const [subtitle, setSubtitle] = useState(defaultSubtitle || '');
    const [image, setImage] = useState(defaultImage);

    const [isEditingText, setIsEditingText] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);

    const [editTitle, setEditTitle] = useState(title);
    const [editSubtitle, setEditSubtitle] = useState(subtitle);

    useEffect(() => {
        if (session?.user?.email) {
            fetch('/api/user/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user.role === 'ADMIN') {
                        setIsAdmin(true);
                    }
                });
        }
    }, [session]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const keys = `${pageKey}_page_header_title,${pageKey}_page_header_subtitle,${pageKey}_page_header_image`;
                const res = await fetch(`/api/settings?keys=${keys}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.settings) {
                        const t = data.settings.find((s: any) => s.key === `${pageKey}_page_header_title`);
                        const st = data.settings.find((s: any) => s.key === `${pageKey}_page_header_subtitle`);
                        const img = data.settings.find((s: any) => s.key === `${pageKey}_page_header_image`);

                        if (t?.value) { setTitle(t.value); setEditTitle(t.value); }
                        if (st?.value) { setSubtitle(st.value); setEditSubtitle(st.value); }
                        if (img?.value) setImage(img.value);
                    }
                }
            } catch (e) {
                console.error('Error fetching header settings', e);
            }
        };
        fetchSettings();
    }, [pageKey]);

    const saveText = async () => {
        try {
            await Promise.all([
                fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: `${pageKey}_page_header_title`, value: editTitle }),
                }),
                fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: `${pageKey}_page_header_subtitle`, value: editSubtitle }),
                })
            ]);
            setTitle(editTitle);
            setSubtitle(editSubtitle);
            setIsEditingText(false);
        } catch (e) {
            console.error('Error saving text settings', e);
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite border-b border-taupe-light overflow-hidden group min-h-[300px] flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-graphite-dark">
                <Image
                    src={image}
                    alt={`${title} Hintergrund`}
                    fill
                    className="object-cover opacity-30"
                    priority
                />
            </div>

            {/* Admin Controls */}
            {isAdmin && (
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditingText(true)}
                        className="bg-white/90 hover:bg-white text-graphite rounded-full p-3 shadow-lg transition-all"
                        title="Text ändern"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    {showImageEditor && (
                        <button
                            onClick={() => {
                                // For now, we'll just alert or if we integrate ImageUploader, we handle it here.
                                // It's better to pass an event up, since ImageUploader might be heavy to load everywhere
                                document.dispatchEvent(new CustomEvent('openImageEditor', { detail: { pageKey } }));
                            }}
                            className="bg-white/90 hover:bg-white text-graphite rounded-full p-3 shadow-lg transition-all"
                            title="Bild ändern"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="container-custom relative z-10 text-center text-white px-4">
                <h1 className="text-display font-serif font-light mb-4">{title}</h1>
                {subtitle && (
                    <p className="text-body-lg text-white/90 max-w-2xl mx-auto mb-8">
                        {subtitle}
                    </p>
                )}
                {children}
            </div>

            {/* Text Editor Modal */}
            {isEditingText && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 lg:p-8 relative shadow-2xl border border-taupe-light/30">
                        <button onClick={() => setIsEditingText(false)} className="absolute top-4 right-4 text-graphite/40 hover:text-graphite transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">Header-Text anpassen</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">Titel</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-2 bg-warmwhite border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">Untertitel</label>
                                <textarea
                                    value={editSubtitle}
                                    onChange={(e) => setEditSubtitle(e.target.value)}
                                    className="w-full px-4 py-2 bg-warmwhite border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/20 h-24 resize-none"
                                />
                            </div>

                            <button
                                onClick={saveText}
                                className="w-full py-3 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors font-medium mt-4"
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
