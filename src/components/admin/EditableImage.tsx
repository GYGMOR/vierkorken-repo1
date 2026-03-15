'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface EditableImageProps {
    settingKey: string;
    defaultSrc: string;
    isAdmin: boolean;
    alt: string;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    quality?: number;
}

export function EditableImage({
    settingKey,
    defaultSrc,
    isAdmin,
    alt,
    className = '',
    priority = false,
    fill = false,
    quality = 75
}: EditableImageProps) {
    const [imageSrc, setImageSrc] = useState(defaultSrc);
    const [isHovered, setIsHovered] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fetch the custom image from settings
        fetch(`/api/settings?keys=${settingKey}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings && data.settings.length > 0) {
                    const setting = data.settings.find((s: any) => s.key === settingKey);
                    if (setting && setting.value) {
                        setImageSrc(setting.value);
                    }
                }
            })
            .catch(err => console.error('Error loading image setting:', err));
    }, [settingKey]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Bitte wählen Sie ein Bild aus');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Bild ist zu groß. Maximal 5MB erlaubt.');
            return;
        }

        setIsUploading(true);

        try {
            // Upload file to server
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const uploadData = await uploadRes.json();
            const uploadedUrl = uploadData.url;

            // Save the URL to settings
            const saveRes = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: settingKey, value: uploadedUrl }),
            });

            if (!saveRes.ok) {
                throw new Error('Failed to save to settings');
            }

            setImageSrc(uploadedUrl);
            alert('Bild erfolgreich gespeichert!');
        } catch (error) {
            console.error('Error uploading/saving image:', error);
            alert(`Fehler beim Bild-Upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div
            className={`relative group ${fill ? 'w-full h-full' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image
                src={imageSrc}
                alt={alt}
                fill={fill}
                width={fill ? undefined : 800} // Default width for non-fill
                height={fill ? undefined : 600} // Default height for non-fill
                className={className}
                priority={priority}
                quality={quality}
            />

            {isAdmin && isHovered && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm transition-all rounded-inherit">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isUploading}
                    />
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
                        disabled={isUploading}
                        className="p-3 bg-white text-wine rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                        title="Bild ändern"
                    >
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-wine"></div>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-sm font-medium pr-1">Bild ändern</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
