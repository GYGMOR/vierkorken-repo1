'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/MainLayout';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  publishedAt?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const { data: session } = useSession();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user.role === 'ADMIN') {
            setIsAdmin(true);
          }
        })
        .catch(() => setIsAdmin(false));
    }
  }, [session]);

  useEffect(() => {
    fetchNews();
  }, [isAdmin]);

  async function fetchNews() {
    try {
      const url = isAdmin ? '/api/news?includeUnpublished=true' : '/api/news';
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setNews(data.data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-warmwhite via-rose-light/10 to-warmwhite">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20">
              <NewsIcon />
              <span className="text-accent-burgundy font-medium text-sm">NEWS & AKTUELLES</span>
            </div>

            {/* Title with Admin Controls */}
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-display font-serif font-light text-graphite-dark">
                Neuigkeiten aus der Weinwelt
              </h1>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="flex items-center gap-4 animate-fadeIn">
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="appearance-none bg-white pl-4 pr-10 py-2 rounded-full border border-accent-burgundy/30 text-accent-burgundy font-medium text-sm focus:outline-none focus:ring-2 focus:ring-accent-burgundy/20 cursor-pointer hover:bg-accent-burgundy/5 transition-colors"
                    >
                      <option value="ALL">Alle anzeigen</option>
                      <option value="PUBLISHED">Veröffentlicht</option>
                      <option value="DRAFT">Entwürfe</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-accent-burgundy">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="w-10 h-10 bg-white text-accent-burgundy rounded-full shadow-md border border-accent-burgundy/30 hover:bg-accent-burgundy/5 hover:scale-105 transition-all duration-300 flex items-center justify-center"
                    aria-label="News erstellen"
                    title="News erstellen"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-body-lg text-graphite">
              Bleiben Sie auf dem Laufenden über neue Weine, Events und alles rund um VIER KORKEN.
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-graphite/60 text-lg">Aktuell keine News verfügbar.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news
                .filter(item => {
                  if (filterStatus === 'ALL') return true;
                  return item.status === filterStatus;
                })
                .map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    isAdmin={isAdmin}
                    onEdit={(newsItem) => {
                      setSelectedNews(newsItem);
                      setEditModalOpen(true);
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Create News Modal */}
      {createModalOpen && (
        <CreateNewsModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchNews();
          }}
        />
      )}

      {/* Edit News Modal */}
      {editModalOpen && selectedNews && (
        <EditNewsModal
          news={selectedNews}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedNews(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedNews(null);
            fetchNews();
          }}
        />
      )}
    </MainLayout>
  );
}

// News Card Component
function NewsCard({ news, isAdmin, onEdit }: { news: NewsItem; isAdmin: boolean; onEdit: (news: NewsItem) => void }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <article className="card overflow-hidden group hover:shadow-strong transition-all duration-300 border-2 border-taupe-light relative">
      {/* Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit(news);
          }}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-warmwhite/95 hover:bg-accent-burgundy text-graphite-dark hover:text-warmwhite rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group/edit"
          aria-label="News bearbeiten"
          title="News bearbeiten"
        >
          <EditIcon className="w-5 h-5" />
        </button>
      )}

      {/* Featured Image */}
      <Link href={`/news/${news.slug}`} className="block">
        {news.featuredImage ? (
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={news.featuredImage}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {news.isPinned && (
                <div className="bg-accent-gold text-warmwhite px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  WICHTIG
                </div>
              )}
              {news.status === 'DRAFT' && (
                <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  ENTWURF
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative h-64 w-full bg-gradient-to-br from-accent-burgundy/10 to-wood-light/20 flex items-center justify-center">
            <NewsIcon className="w-16 h-16 text-accent-burgundy/30" />

            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {news.isPinned && (
                <div className="bg-accent-gold text-warmwhite px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  WICHTIG
                </div>
              )}
              {news.status === 'DRAFT' && (
                <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  ENTWURF
                </div>
              )}
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-graphite/60">
          <CalendarIcon className="w-4 h-4" />
          <time>{formatDate(news.publishedAt || news.createdAt)}</time>
        </div>

        {/* Title */}
        <Link href={`/news/${news.slug}`}>
          <h2 className="text-h4 font-serif text-wine-dark group-hover:text-wine transition-colors line-clamp-2 cursor-pointer">
            {news.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {news.excerpt && (
          <p className="text-graphite/80 line-clamp-3">{news.excerpt}</p>
        )}

        {/* Read More Link */}
        <Link
          href={`/news/${news.slug}`}
          className="inline-flex items-center gap-2 text-accent-burgundy font-medium hover:gap-3 transition-all"
        >
          Weiterlesen
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

// Icons
function NewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// Create News Modal
function CreateNewsModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload'); // New: Track which mode is active

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFeaturedImage(data.url);
        setImagePreview(data.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes');
    } finally {
      setUploading(false);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (url: string) => {
    setFeaturedImage(url);
    setImagePreview(url);
  };

  // Convert line breaks to HTML
  const formatContentForSave = (text: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split(/\n\n+/);

    // Convert each paragraph, replacing single line breaks with <br>
    const formatted = paragraphs
      .map(p => {
        const withBreaks = p.replace(/\n/g, '<br>');
        return `<p>${withBreaks}</p>`;
      })
      .join('');

    return formatted;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      alert('Bitte Titel und Inhalt ausfüllen');
      return;
    }

    setSubmitting(true);
    try {
      // Format content to preserve line breaks
      const formattedContent = formatContentForSave(content);

      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content: formattedContent,
          featuredImage,
          isPinned,
          status,
          publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('News erfolgreich erstellt!');
        onSuccess();
      } else {
        alert('Fehler beim Erstellen der News');
      }
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Fehler beim Erstellen der News');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
      <div className="bg-warmwhite rounded-lg shadow-strong max-w-4xl w-full mb-8 border-2 border-taupe-light">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-taupe-light">
          <div>
            <h2 className="text-h3 font-serif font-light text-wine-dark">Neue News erstellen</h2>
            <p className="text-sm text-graphite/60 mt-1">Erstelle eine neue Meldung für die News-Seite</p>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-wine transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Titel <span className="text-accent-burgundy">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Neue Weinkollektion verfügbar"
              className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Kurzbeschreibung (Excerpt)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Eine kurze Zusammenfassung der News..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Inhalt <span className="text-accent-burgundy">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe hier den vollständigen Inhalt der News...&#10;&#10;Einfach normal schreiben! &#10;• Enter für neue Zeile&#10;• Doppel-Enter für neuen Absatz&#10;&#10;Die Formatierung wird automatisch übernommen."
              rows={12}
              className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors resize-none"
              required
            />
            <p className="text-xs text-graphite/60 mt-2">
              💡 Tipp: Drücke Enter für Zeilenumbrüche - die Formatierung wird automatisch gespeichert!
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Beitragsbild
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-taupe-light">
                  <Image
                    src={imagePreview}
                    alt="Vorschau"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage('');
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-accent-burgundy text-warmwhite p-2 rounded-full hover:bg-wine transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Mode Selector */}
              <div className="flex gap-2 p-1 bg-warmwhite-light rounded-lg">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${imageMode === 'upload'
                    ? 'bg-wine text-warmwhite shadow-sm'
                    : 'text-graphite hover:text-wine'
                    }`}
                >
                  Von Gerät hochladen
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${imageMode === 'url'
                    ? 'bg-wine text-warmwhite shadow-sm'
                    : 'text-graphite hover:text-wine'
                    }`}
                >
                  URL eingeben
                </button>
              </div>

              {/* Upload Option */}
              {imageMode === 'upload' && (
                <div>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-taupe-light rounded-lg p-8 text-center hover:border-wine hover:bg-wine/5 transition-all">
                      <svg className="w-12 h-12 mx-auto text-graphite/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-graphite-dark mb-1">
                        {uploading ? 'Wird hochgeladen...' : 'Klicke hier oder ziehe ein Bild hinein'}
                      </p>
                      <p className="text-xs text-graphite/60">PNG, JPG bis 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              {/* URL Option */}
              {imageMode === 'url' && (
                <div>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="z.B. /images/news/mein-bild.jpg"
                    className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors"
                  />
                  <p className="text-xs text-graphite/60 mt-2">
                    💡 Tipp: Gib den Pfad zum Bild ein (z.B. /images/news/...) oder eine vollständige URL
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            {/* Pinned */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-taupe-light rounded-full peer-checked:bg-accent-gold transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-warmwhite rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-graphite-dark group-hover:text-wine transition-colors">
                Als wichtig markieren (Pin)
              </span>
            </label>

            {/* Status */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-graphite-dark">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="px-4 py-2 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors"
              >
                <option value="DRAFT">Entwurf</option>
                <option value="PUBLISHED">Veröffentlicht</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-taupe-light">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-graphite hover:text-graphite-dark transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Wird erstellt...' : 'News erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit News Modal
function EditNewsModal({ news, onClose, onSuccess }: { news: NewsItem; onClose: () => void; onSuccess: () => void }) {
  // Convert HTML back to plain text for editing
  const htmlToPlainText = (html: string) => {
    return html
      .replace(/<\/p><p>/g, '\n\n')  // Convert paragraph breaks to double newlines
      .replace(/<p>/g, '')            // Remove opening <p> tags
      .replace(/<\/p>/g, '')          // Remove closing </p> tags
      .replace(/<br\s*\/?>/gi, '\n')  // Convert <br> to newlines
      .replace(/<[^>]+>/g, '');       // Remove any other HTML tags
  };

  const [title, setTitle] = useState(news.title);
  const [excerpt, setExcerpt] = useState(news.excerpt || '');
  const [content, setContent] = useState(htmlToPlainText(news.content));
  const [featuredImage, setFeaturedImage] = useState(news.featuredImage || '');
  const [isPinned, setIsPinned] = useState(news.isPinned);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState(news.featuredImage || '');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url');

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFeaturedImage(data.url);
        setImagePreview(data.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes');
    } finally {
      setUploading(false);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (url: string) => {
    setFeaturedImage(url);
    setImagePreview(url);
  };

  // Convert line breaks to HTML
  const formatContentForSave = (text: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split(/\n\n+/);

    // Convert each paragraph, replacing single line breaks with <br>
    const formatted = paragraphs
      .map(p => {
        const withBreaks = p.replace(/\n/g, '<br>');
        return `<p>${withBreaks}</p>`;
      })
      .join('');

    return formatted;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      alert('Bitte Titel und Inhalt ausfüllen');
      return;
    }

    setSubmitting(true);
    try {
      // Format content to preserve line breaks
      const formattedContent = formatContentForSave(content);

      const res = await fetch(`/api/news/${news.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content: formattedContent,
          featuredImage,
          isPinned,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('News erfolgreich aktualisiert!');
        onSuccess();
      } else {
        alert('Fehler beim Aktualisieren der News');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Fehler beim Aktualisieren der News');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Möchtest du diese News wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/news/${news.slug}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('News erfolgreich gelöscht!');
        onSuccess();
      } else {
        alert('Fehler beim Löschen der News');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Fehler beim Löschen der News');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
      <div className="bg-warmwhite rounded-lg shadow-strong max-w-4xl w-full mb-8 border-2 border-taupe-light">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-taupe-light">
          <div>
            <h2 className="text-h3 font-serif font-light text-wine-dark">News bearbeiten</h2>
            <p className="text-sm text-graphite/60 mt-1">Bearbeite die bestehende News</p>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-wine transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Titel <span className="text-accent-burgundy">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Neue Weinkollektion verfügbar"
              className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Kurzbeschreibung (Excerpt)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Eine kurze Zusammenfassung der News..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Inhalt <span className="text-accent-burgundy">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe hier den vollständigen Inhalt der News...&#10;&#10;Einfach normal schreiben! &#10;• Enter für neue Zeile&#10;• Doppel-Enter für neuen Absatz&#10;&#10;Die Formatierung wird automatisch übernommen."
              rows={12}
              className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors resize-none"
              required
            />
            <p className="text-xs text-graphite/60 mt-2">
              💡 Tipp: Drücke Enter für Zeilenumbrüche - die Formatierung wird automatisch gespeichert!
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-graphite-dark mb-2">
              Beitragsbild
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-taupe-light">
                  <Image
                    src={imagePreview}
                    alt="Vorschau"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage('');
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-accent-burgundy text-warmwhite p-2 rounded-full hover:bg-wine transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Mode Selector */}
              <div className="flex gap-2 p-1 bg-warmwhite-light rounded-lg">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${imageMode === 'upload'
                    ? 'bg-wine text-warmwhite shadow-sm'
                    : 'text-graphite hover:text-wine'
                    }`}
                >
                  Von Gerät hochladen
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${imageMode === 'url'
                    ? 'bg-wine text-warmwhite shadow-sm'
                    : 'text-graphite hover:text-wine'
                    }`}
                >
                  URL eingeben
                </button>
              </div>

              {/* Upload Option */}
              {imageMode === 'upload' && (
                <div>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-taupe-light rounded-lg p-8 text-center hover:border-wine hover:bg-wine/5 transition-all">
                      <svg className="w-12 h-12 mx-auto text-graphite/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-graphite-dark mb-1">
                        {uploading ? 'Wird hochgeladen...' : 'Klicke hier oder ziehe ein Bild hinein'}
                      </p>
                      <p className="text-xs text-graphite/60">PNG, JPG bis 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              {/* URL Option */}
              {imageMode === 'url' && (
                <div>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="z.B. /images/news/mein-bild.jpg"
                    className="w-full px-4 py-3 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors"
                  />
                  <p className="text-xs text-graphite/60 mt-2">
                    💡 Tipp: Gib den Pfad zum Bild ein (z.B. /images/news/...) oder eine vollständige URL
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            {/* Pinned */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-taupe-light rounded-full peer-checked:bg-accent-gold transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-warmwhite rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-graphite-dark group-hover:text-wine transition-colors">
                Als wichtig markieren (Pin)
              </span>
            </label>

            {/* Status */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-graphite-dark">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="px-4 py-2 border-2 border-taupe-light rounded-lg focus:outline-none focus:border-wine transition-colors"
              >
                <option value="DRAFT">Entwurf</option>
                <option value="PUBLISHED">Veröffentlicht</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-taupe-light">
            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-12 h-12 bg-accent-burgundy/10 hover:bg-accent-burgundy/20 text-accent-burgundy hover:text-wine rounded-lg transition-all duration-300 flex items-center justify-center group disabled:opacity-50"
              aria-label="News löschen"
              title="News löschen"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-burgundy"></div>
              ) : (
                <TrashIcon className="w-5 h-5" />
              )}
            </button>

            {/* Save/Cancel Buttons */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-graphite hover:text-graphite-dark transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
