'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { BackButton } from '@/components/ui/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DailyTipManager } from '@/components/blog/DailyTipManager';
import { BlogPostManager } from '@/components/blog/BlogPostManager';
import { KnowledgeCategoryManager } from '@/components/blog/KnowledgeCategoryManager';
import { CategoryIcons } from '@/components/blog/CategoryIcons';

// Start Types
interface DailyTip {
  id: string;
  title: string;
  content: string;
  date?: string; // Derived from createdAt
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  publishedAt: string;
  slug: string;
}

interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}
// End Types

export default function WeinwissenPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [tips, setTips] = useState<DailyTip[]>([]);
  const [currentTip, setCurrentTip] = useState<DailyTip | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);

  const [showTipManager, setShowTipManager] = useState(false);
  const [showPostManager, setShowPostManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch Tips
      const tipsRes = await fetch('/api/admin/tips');
      if (tipsRes.ok) {
        const data = await tipsRes.json();
        setTips(data.tips);
        if (data.tips && data.tips.length > 0) {
          // Select tip based on day of year to rotate
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          const tipIndex = dayOfYear % data.tips.length;
          setCurrentTip(data.tips[tipIndex]);
        }
      }

      // Fetch Posts
      const postsRes = await fetch('/api/admin/blog');
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts);
      }

      // Fetch Categories
      const categoriesRes = await fetch('/api/admin/knowledge-categories');
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-accent-burgundy/10 border-b border-taupe-light overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/layout/weingläser.jpg"
            alt="Weinwissen Hintergrund"
            fill
            className="object-cover opacity-15"
            quality={90}
            priority
          />
        </div>

        <div className="container-custom py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BackButton href="/" className="mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 backdrop-blur-sm">
              <span className="text-accent-burgundy font-medium text-sm">WEINWISSEN</span>
            </div>
            <h1 className="text-display font-serif font-light text-graphite-dark">
              Wein verstehen & geniessen
            </h1>
            <p className="text-body-lg text-graphite">
              Tauchen Sie ein in die faszinierende Welt des Weins. Von der Traube bis ins Glas –
              entdecken Sie das Wissen, das jeden Schluck zu einem besonderen Erlebnis macht.
            </p>
          </div>
        </div>
      </div>

      <div className="section-padding bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
        <div className="container-custom max-w-4xl">

          {/* Daily Tip */}
          <div className="relative group">
            {isAdmin && (
              <button
                onClick={() => setShowTipManager(true)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-20 text-graphite hover:text-accent-burgundy opacity-0 group-hover:opacity-100 transition-opacity"
                title="Tipps verwalten"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}

            <div className="card p-8 mb-8 bg-gradient-to-br from-accent-burgundy/5 to-rose-light/20 relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h2 className="text-h4 font-serif text-graphite-dark">Tipp des Tages</h2>
                  <span className="ml-auto text-sm text-graphite opacity-60">
                    {new Date().toLocaleDateString('de-CH')}
                  </span>
                </div>

                {currentTip ? (
                  <>
                    <h3 className="text-h5 font-semibold text-graphite-dark mb-3">{currentTip.title}</h3>
                    <div
                      className="text-graphite leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentTip.content }}
                    />
                  </>
                ) : (
                  <p className="text-graphite italic">Heute gibt es noch keinen Tipp. Schauen Sie später wieder vorbei!</p>
                )}
              </div>
            </div>
          </div>


          {/* Weinwissen Kategorien (Dynamic) */}
          <div className="relative group mb-12">
            {isAdmin && (
              <button
                onClick={() => setShowCategoryManager(true)}
                className="absolute top-0 right-0 bg-white p-2 rounded-full shadow-md z-20 text-graphite hover:text-accent-burgundy opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 -translate-y-1/2"
                title="Kategorien verwalten"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {categories.length > 0 ? (
                categories.map((cat) => {
                  const IconComponent = CategoryIcons[cat.icon] || CategoryIcons.grape;
                  return (
                    <Card key={cat.id} className="hover:shadow-strong transition-shadow cursor-pointer border-none shadow-md bg-white">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-accent-burgundy" />
                        </div>
                        <CardTitle>{cat.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-graphite">{cat.description}</p>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <>
                  {/* Fallback Static Content if DB is empty */}
                  <Card className="hover:shadow-strong transition-shadow cursor-pointer border-none shadow-md bg-white">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                        <CategoryIcons.grape className="w-6 h-6 text-accent-burgundy" />
                      </div>
                      <CardTitle>Rebsorten</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-graphite">Lernen Sie die Unterschiede zwischen Rotwein, Weisswein, Rosé und Schaumwein kennen.</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-strong transition-shadow cursor-pointer border-none shadow-md bg-white">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                        <CategoryIcons.storage className="w-6 h-6 text-accent-burgundy" />
                      </div>
                      <CardTitle>Weinregionen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-graphite">Entdecken Sie die bedeutendsten Weinregionen der Welt und ihre Besonderheiten.</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-strong transition-shadow cursor-pointer border-none shadow-md bg-white">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                        <CategoryIcons.nose className="w-6 h-6 text-accent-burgundy" />
                      </div>
                      <CardTitle>Verkostung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-graphite">Die Kunst der Weinverkostung: Sehen, Riechen, Schmecken.</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-strong transition-shadow cursor-pointer border-none shadow-md bg-white">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                        <CategoryIcons.food className="w-6 h-6 text-accent-burgundy" />
                      </div>
                      <CardTitle>Food Pairing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-graphite">Welcher Wein passt zu welchem Essen? Wir verraten es Ihnen.</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Artikel */}
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-h3 font-serif text-graphite-dark">Beliebte Artikel</h2>
            {isAdmin && (
              <Button onClick={() => setShowPostManager(true)} size="sm">
                + Neuer Artikel
              </Button>
            )}
          </div>

          <div className="space-y-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="card p-0 overflow-hidden bg-white shadow-md rounded-lg flex flex-col md:flex-row">
                  {post.featuredImage && (
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${post.featuredImage ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-serif font-bold text-graphite-dark">{post.title}</h3>
                      <span className="text-sm text-graphite whitespace-nowrap ml-4 opacity-60">
                        {new Date(post.publishedAt).toLocaleDateString('de-CH')}
                      </span>
                    </div>

                    {/* Content or Excerpt */}
                    <div className="text-graphite mb-4 line-clamp-3 prose prose-sm">
                      {post.excerpt || <div dangerouslySetInnerHTML={{ __html: post.content }} />}
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <button className="text-accent-burgundy hover:underline text-sm font-semibold flex items-center gap-1">
                        Weiterlesen <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-graphite/60 italic">
                Noch keine Artikel vorhanden.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTipManager && (
        <DailyTipManager onClose={() => setShowTipManager(false)} onUpdate={fetchData} />
      )}
      {showPostManager && (
        <BlogPostManager onClose={() => setShowPostManager(false)} onUpdate={fetchData} />
      )}
      {showCategoryManager && (
        <KnowledgeCategoryManager onClose={() => setShowCategoryManager(false)} onUpdate={fetchData} />
      )}
    </MainLayout>
  );
}
