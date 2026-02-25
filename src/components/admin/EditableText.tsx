'use client';

import { useState, useEffect } from 'react';

interface EditableTextProps {
    settingKey: string;
    defaultValue: string;
    isAdmin: boolean;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    multiline?: boolean;
}

export function EditableText({
    settingKey,
    defaultValue,
    isAdmin,
    className = '',
    as: Component = 'div',
    multiline = false
}: EditableTextProps) {
    const [text, setText] = useState(defaultValue);
    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState(text);

    useEffect(() => {
        fetch(`/api/settings?keys=${settingKey}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings && data.settings.length > 0) {
                    const setting = data.settings.find((s: any) => s.key === settingKey);
                    if (setting && setting.value) {
                        setText(setting.value);
                        setDraftText(setting.value);
                    }
                }
            })
            .catch(err => console.error('Error loading text:', err));
    }, [settingKey]);

    const handleSave = async () => {
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: settingKey, value: draftText }),
            });
            setText(draftText);
            setIsEditing(false);
        } catch (e) {
            console.error('Error saving text:', e);
        }
    };

    if (isEditing) {
        return (
            <div className={`relative z-50 bg-white p-4 rounded-lg shadow-xl border border-wine/20 ${className.includes('text-center') ? 'mx-auto' : ''}`} onClick={(e) => e.stopPropagation()}>
                {multiline ? (
                    <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="w-full min-h-[100px] p-3 text-graphite-dark text-base font-sans border border-taupe rounded bg-warmwhite-light focus:outline-none focus:ring-2 focus:ring-wine"
                    />
                ) : (
                    <input
                        type="text"
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="w-full p-3 text-graphite-dark text-base font-sans border border-taupe rounded bg-warmwhite-light focus:outline-none focus:ring-2 focus:ring-wine"
                    />
                )}
                <div className="flex flex-wrap gap-2 mt-4 justify-end sm:justify-start">
                    <button
                        type="button"
                        onClick={() => { setDraftText(text); setIsEditing(false); }}
                        className="px-4 py-2 text-sm text-graphite hover:text-graphite-dark bg-warmwhite-light hover:bg-taupe/20 border border-taupe-light rounded font-medium transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-6 py-2 text-sm bg-wine text-white rounded hover:bg-wine-dark font-medium transition-colors shadow-sm"
                    >
                        Speichern
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Component className={`relative group ${className}`}>
            <span style={{ whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
                {text}
            </span>
            {isAdmin && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
                    className="absolute -top-3 -right-6 md:-right-10 opacity-0 group-hover:opacity-100 p-2 bg-white text-wine rounded-full shadow-md z-20 hover:scale-105 transition-all"
                    title="Text bearbeiten"
                    style={{ isolation: 'isolate' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
            )}
        </Component>
    );
}
