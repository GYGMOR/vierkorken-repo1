'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  allowMultiple?: boolean;
  maxSizeMB?: number;
  accept?: string;
}

export function ImageUploader({
  onUploadComplete,
  allowMultiple = false,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        setUploading(true);
        setError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Upload failed');
        }

        setUploadProgress(100);
        onUploadComplete(data.url);
        setPreview(null);

      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {}),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: allowMultiple,
    disabled: uploading,
  });

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
      onUploadComplete(urlInput);
      setUrlInput('');
    } catch (err) {
      setError('Ungültige URL');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-accent-burgundy bg-accent-burgundy/5'
            : 'border-taupe-light hover:border-accent-burgundy/50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent-burgundy h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-graphite">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-graphite/40"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-graphite">
              {isDragActive ? (
                <p>Datei hier ablegen...</p>
              ) : (
                <>
                  <p className="font-medium">
                    Klicken Sie hier oder ziehen Sie eine Datei hinein
                  </p>
                  <p className="text-sm text-graphite/60 mt-1">
                    PNG, JPG, WEBP, GIF bis zu {maxSizeMB}MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-taupe-light" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-graphite/60">ODER</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          placeholder="Bild-URL eingeben..."
          className="flex-1 px-4 py-2 border border-taupe-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy"
          disabled={uploading}
        />
        <Button
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim() || uploading}
          variant="secondary"
        >
          URL hinzufügen
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-graphite/60">
        <p>💡 Tipp: Sie können auch eine URL zu einem extern gehosteten Bild eingeben.</p>
        <p className="mt-1">
          💾 Speicherort: Lokal (Server)
        </p>
      </div>
    </div>
  );
}
