'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                    event.preventDefault();
                    const file = event.dataTransfer.files[0];
                    handleImageUpload(file);
                    return true;
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const handleImageUpload = async (file: File) => {
        if (!editor) return;

        // Optimistic preview
        // const reader = new FileReader();
        // reader.onload = (e) => {
        //     editor.chain().focus().setImage({ src: e.target?.result as string }).run();
        // };
        // reader.readAsDataURL(file);

        // Real upload
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                alert('Fehler beim Bild-Upload');
            }
        } catch (e) {
            console.error(e);
            alert('Upload fehlgeschlagen');
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-taupe-light rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-2">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    label="B"
                    title="Fett"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    label="I"
                    title="Kursiv"
                />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    label="H3"
                    title="Überschrift"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    label="List"
                    title="Liste"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    label="1."
                    title="Nummerierung"
                />
            </div>
            <EditorContent editor={editor} />
            <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-xs text-gray-500 flex justify-between">
                <span>Drag & Drop für Bilder</span>
                <span>{editor.storage.characterCount?.characters()} Zeichen</span>
            </div>
        </div>
    );
}

function MenuButton({ onClick, isActive, label, title }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive
                    ? 'bg-accent-burgundy text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
        >
            {label}
        </button>
    );
}
