'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { BackButton } from '@/components/ui/BackButton';
import { ShareButton } from '@/components/ui/ShareButton';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  publishedAt?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  type?: string;
  eventId?: string;
  event?: {
    slug: string;
    startDateTime: string;
    venue: string;
    price: number;
  };
}

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        // Fetch current news
        const res = await fetch(`/api/news/${slug}`);
        const data = await res.json();

        if (data.success) {
          setNews(data.data);
        }

        // Fetch related news
        const relatedRes = await fetch('/api/news?limit=3');
        const relatedData = await relatedRes.json();

        if (relatedData.success) {
          // Filter out current news
          const filtered = relatedData.data.filter((item: NewsItem) => item.slug !== slug);
          setRelatedNews(filtered.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [slug]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="section-padding flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
        </div>
      </MainLayout>
    );
  }

  if (!news) {
    return (
      <MainLayout>
        <div className="section-padding text-center">
          <h1 className="text-h2 font-serif mb-4">News nicht gefunden</h1>
          <Link href="/news" className="btn btn-primary">
            Zurück zu News
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Back Button */}
      <div className="container-custom pt-8">
        <BackButton href="/news" label="Zurück zu News" />
      </div>

      {/* News Content */}
      <article className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="space-y-6 mb-8">
            {news.isPinned && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 rounded-full border border-accent-gold/20">
                <span className="text-accent-gold font-medium text-sm">WICHTIG</span>
              </div>
            )}

            <h1 className="text-display font-serif font-light text-graphite-dark">
              {news.title}
            </h1>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-graphite/60 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <time>{formatDate(news.publishedAt || news.createdAt)}</time>
                </div>
              </div>
              <ShareButton url={`/news/${news.slug}`} title={news.title} />
            </div>

            {news.excerpt && (
              <p className="text-body-lg text-graphite/80 italic border-l-4 border-wine pl-6 py-2">
                {news.excerpt}
              </p>
            )}

            {/* Start: Event Booking Button */}
            {news.type === 'EVENT' && news.event && (
              <div className="flex justify-center md:justify-start pt-2">
                <Link
                  href={`/events/${news.event.slug}`}
                  className="bg-accent-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="text-lg">🎟️</span>
                  <span>JETZT TICKET BUCHEN</span>
                </Link>
              </div>
            )}
            {/* End: Event Booking Button */}
          </div>

          {/* Featured Image */}
          {news.featuredImage && (
            <div className="flex justify-center mb-8">
              <img
                src={news.featuredImage}
                alt={news.title}
                className="w-full h-auto max-h-[600px] object-contain rounded-lg shadow-strong"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose md:prose-lg max-w-none w-full break-words overflow-hidden prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-headings:font-serif prose-headings:font-light prose-h2:text-h3 prose-h3:text-h4 prose-p:text-graphite prose-a:text-wine prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </article>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="section-padding bg-warmwhite-light">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-h2 font-serif font-light mb-4">Weitere News</h2>
              <p className="text-body-lg text-graphite">Entdecken Sie weitere aktuelle Neuigkeiten</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="card overflow-hidden group cursor-pointer hover:shadow-strong transition-all duration-300 border-2 border-taupe-light"
                >
                  {/* Image */}
                  {item.featuredImage ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 w-full bg-gradient-to-br from-wine/10 to-wood-light/20 flex items-center justify-center">
                      <NewsIcon className="w-12 h-12 text-wine/30" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-graphite/60">
                      <CalendarIcon className="w-4 h-4" />
                      <time>{formatDate(item.publishedAt || item.createdAt)}</time>
                    </div>

                    <h3 className="text-h5 font-serif text-wine-dark group-hover:text-wine transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="text-sm text-graphite/80 line-clamp-2">{item.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function NewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}
