'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { BackButton } from '@/components/ui/BackButton';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  publishedAt: string;
  slug: string;
  authorName?: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        // Fetch all posts and find the one with matching slug
        // Note: Ideally we should have an API endpoint /api/blog/[slug] but for now using the list
        const res = await fetch('/api/admin/blog');
        const data = await res.json();
        
        if (data.posts) {
            const foundPost = data.posts.find((p: BlogPost) => p.slug === slug);
            if (foundPost) {
                setPost(foundPost);
            }
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="section-padding flex justify-center min-h-[50vh] items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="section-padding text-center min-h-[50vh] flex flex-col justify-center items-center">
          <h1 className="text-h2 font-serif mb-4 text-graphite-dark">Artikel nicht gefunden</h1>
          <p className="text-body-lg text-graphite mb-8">Der gesuchte Artikel existiert leider nicht.</p>
          <Link href="/weinwissen" className="btn btn-primary">
            Zurück zu Weinwissen
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-warmwhite min-h-screen">
        {/* Back Button */}
        <div className="container-custom pt-8">
          <BackButton href="/weinwissen" label="Zurück zu Weinwissen" />
        </div>

        <article className="section-padding pt-8">
          <div className="container-custom max-w-4xl">
            {/* Header */}
            <div className="space-y-6 mb-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 w-fit">
                    <span className="text-accent-burgundy font-medium text-xs tracking-wider">WEINWISSEN</span>
                  </div>
                  <time className="text-graphite/60 text-sm">
                    {new Date(post.publishedAt).toLocaleDateString('de-CH', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    })}
                  </time>
              </div>

              <h1 className="text-display font-serif font-light text-graphite-dark leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-graphite/80 italic border-l-4 border-accent-burgundy pl-6 py-2">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative w-full aspect-video mb-12 rounded-xl overflow-hidden shadow-strong">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-light prose-headings:text-graphite-dark prose-p:text-graphite prose-a:text-accent-burgundy prose-a:no-underline hover:prose-a:underline prose-blockquote:border-accent-burgundy prose-li:text-graphite"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Share / CTA Footer (Optional) */}
        <div className="container-custom pb-16">
            <div className="border-t border-taupe-light pt-8 flex justify-center">
                 <Link href="/weinwissen" className="text-accent-burgundy hover:text-graphite-dark transition-colors font-serif italic text-lg">
                    ← Weitere Artikel entdecken
                 </Link>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
