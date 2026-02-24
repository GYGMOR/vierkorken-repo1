'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { EditableText } from '@/components/admin/EditableText';
import Image from 'next/image';

interface AboutImage {
  id: string;
  url: string;
  side: 'left' | 'right';
  order: number;
}

export default function UberUnsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [images, setImages] = useState<AboutImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadSide, setUploadSide] = useState<'left' | 'right' | null>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/about-images');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bild wirklich löschen?')) return;
    try {
      await fetch(`/api/admin/about-images?id=${id}`, { method: 'DELETE' });
      fetchImages();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (url: string) => {
    if (!uploadSide) return;
    try {
      await fetch('/api/admin/about-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, side: uploadSide, order: 0 })
      });
      fetchImages();
      setUploadSide(null);
    } catch (e) {
      console.error(e);
    }
  };

  const leftImages = images.filter(i => i.side === 'left');
  const rightImages = images.filter(i => i.side === 'right');

  // Duplicate items for infinite scroll effect
  const getScrollingItems = (items: AboutImage[]) => {
    if (items.length === 0) return [];
    if (items.length < 3) return [...items, ...items, ...items, ...items];
    return [...items, ...items];
  };

  const leftScrollItems = getScrollingItems(leftImages);
  const rightScrollItems = getScrollingItems(rightImages);

  const ScrollingColumn = ({
    items,
    direction,
    side
  }: {
    items: AboutImage[],
    direction: 'up' | 'down',
    side: 'left' | 'right'
  }) => {
    return (
      <div className="relative h-full min-h-[800px] overflow-hidden hidden lg:block rounded-xl w-full max-w-[280px] flex-shrink-0">
        {isAdmin && (
          <div className="absolute top-2 right-2 z-[60] bg-white/90 backdrop-blur p-2 rounded-lg shadow-md flex flex-col gap-2">
            <button
              className="text-sm font-semibold text-accent-burgundy hover:text-wine-dark transition-colors flex items-center gap-1"
              onClick={() => setUploadSide(side)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Bild {side === 'left' ? 'Links' : 'Rechts'}
            </button>
          </div>
        )}

        {items.length === 0 && !isAdmin ? null : items.length === 0 && isAdmin ? (
          <div className="flex items-center justify-center h-full text-graphite/50 italic p-4 text-center border border-dashed border-gray-300 rounded-lg">
            Keine Bilder vorhanden. Klicken Sie auf + Bild {side === 'left' ? 'Links' : 'Rechts'}, um ein Bild hinzuzufügen.
          </div>
        ) : (
          <div className={`flex flex-col gap-6 w-full ${direction === 'up' ? 'animate-scroll-up' : 'animate-scroll-down'} hover:[animation-play-state:paused]`}>
            {items.map((img, idx) => (
              <div key={`${img.id}-${idx}`} className="relative aspect-[3/4] w-full rounded-lg overflow-hidden group shadow-md">
                <Image
                  src={img.url}
                  alt="Vier Korken Weinboutique"
                  fill
                  className="object-cover sepia-[0.2] contrast-[1.1] brightness-[0.95] transition-all duration-700 group-hover:sepia-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                {isAdmin && idx < (side === 'left' ? leftImages.length : rightImages.length) && (
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 z-10 transition-all shadow-lg"
                    title="Löschen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="section-padding bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite overflow-hidden">
        <div className="container-custom relative">

          <EditableText
            settingKey="uber_uns_page_title"
            defaultValue="Über uns"
            isAdmin={isAdmin}
            as="h1"
            className="text-display font-serif font-light text-graphite-dark mb-12 text-center relative z-20"
          />

          <div className="flex items-stretch justify-center gap-8 lg:gap-12 relative h-[800px] lg:h-[1000px] max-h-[80vh]">

            {/* Left Column (Scrolled Up) */}
            <ScrollingColumn items={leftScrollItems} direction="up" side="left" />

            {/* Center Content */}
            <div className="w-full max-w-2xl flex-1 z-20 flex flex-col gap-8 overflow-y-auto no-scrollbar pb-12 px-4 md:px-0">
              <section className="card p-8 shadow-strong/5 border-none bg-white/95 backdrop-blur-sm">
                <EditableText
                  settingKey="uber_uns_geschichte_title"
                  defaultValue="Unsere Geschichte"
                  isAdmin={isAdmin}
                  as="h2"
                  className="text-h3 font-serif text-graphite-dark mb-4"
                />
                <EditableText
                  settingKey="uber_uns_geschichte_text"
                  defaultValue="Die Vier Korken Wein-Boutique ist mehr als nur ein Weinshop – wir sind eine Gemeinschaft von Weinliebhabern, die Qualität, Genuss und Kultur vereint. Seit unserer Gründung haben wir es uns zur Aufgabe gemacht, exquisite Weine aus aller Welt zugänglich zu machen und unsere Leidenschaft für edle Tropfen mit Ihnen zu teilen."
                  isAdmin={isAdmin}
                  as="p"
                  className="text-graphite leading-relaxed"
                  multiline={true}
                />
              </section>

              <section className="card p-8 bg-gradient-to-br from-accent-burgundy/5 to-rose-light/20 shadow-strong/5 border-none backdrop-blur-sm">
                <EditableText
                  settingKey="uber_uns_mission_title"
                  defaultValue="Unsere Mission"
                  isAdmin={isAdmin}
                  as="h2"
                  className="text-h3 font-serif text-graphite-dark mb-6"
                />
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z" />
                      </svg>
                    </div>
                    <EditableText settingKey="uber_uns_mission_1_title" defaultValue="Qualität" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark mb-2" />
                    <EditableText settingKey="uber_uns_mission_1_text" defaultValue="Handverlesene Weine von ausgewählten Weingütern" isAdmin={isAdmin} as="p" className="text-sm text-graphite" multiline={true} />
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <EditableText settingKey="uber_uns_mission_2_title" defaultValue="Gemeinschaft" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark mb-2" />
                    <EditableText settingKey="uber_uns_mission_2_text" defaultValue="Eine lebendige Community von Weinliebhabern" isAdmin={isAdmin} as="p" className="text-sm text-graphite" multiline={true} />
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <EditableText settingKey="uber_uns_mission_3_title" defaultValue="Wissen" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark mb-2" />
                    <EditableText settingKey="uber_uns_mission_3_text" defaultValue="Weinwissen und Expertise für alle Levels" isAdmin={isAdmin} as="p" className="text-sm text-graphite" multiline={true} />
                  </div>
                </div>
              </section>

              <section className="card p-8 shadow-strong/5 border-none bg-white/95 backdrop-blur-sm">
                <EditableText settingKey="uber_uns_auszeichnung_title" defaultValue="Was uns auszeichnet" isAdmin={isAdmin} as="h2" className="text-h3 font-serif text-graphite-dark mb-4" />
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="w-full">
                      <EditableText settingKey="uber_uns_list_1_title" defaultValue="Kuratierte Auswahl" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark" />
                      <EditableText settingKey="uber_uns_list_1_text" defaultValue="Jeder Wein wird sorgfältig ausgewählt und probiert" isAdmin={isAdmin} as="p" className="text-graphite" multiline={true} />
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="w-full">
                      <EditableText settingKey="uber_uns_list_2_title" defaultValue="Loyalty Club" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark" />
                      <EditableText settingKey="uber_uns_list_2_text" defaultValue="Sammeln Sie Punkte und profitieren Sie von exklusiven Vorteilen" isAdmin={isAdmin} as="p" className="text-graphite" multiline={true} />
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="w-full">
                      <EditableText settingKey="uber_uns_list_3_title" defaultValue="Events & Verkostungen" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark" />
                      <EditableText settingKey="uber_uns_list_3_text" defaultValue="Regelmäßige Weinverkostungen und exklusive Events" isAdmin={isAdmin} as="p" className="text-graphite" multiline={true} />
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="w-full">
                      <EditableText settingKey="uber_uns_list_4_title" defaultValue="Persönliche Beratung" isAdmin={isAdmin} as="h3" className="font-semibold text-graphite-dark" />
                      <EditableText settingKey="uber_uns_list_4_text" defaultValue="Unser Team berät Sie gerne bei der Weinauswahl" isAdmin={isAdmin} as="p" className="text-graphite" multiline={true} />
                    </div>
                  </li>
                </ul>
              </section>

              <section className="card p-8 text-center shadow-strong/5 border-none bg-white/95 backdrop-blur-sm">
                <EditableText settingKey="uber_uns_besuch_title" defaultValue="Besuchen Sie uns" isAdmin={isAdmin} as="h2" className="text-h3 font-serif text-graphite-dark mb-4" />
                <div className="max-w-md mx-auto">
                  <EditableText
                    settingKey="uber_uns_besuch_text"
                    defaultValue="Erleben Sie die Vier Korken Wein-Boutique persönlich in unserem Laden in Seengen"
                    isAdmin={isAdmin}
                    as="p"
                    className="text-graphite mb-4"
                    multiline={true}
                  />
                  <div className="bg-rose-light/30 p-4 rounded-lg mb-4">
                    <EditableText settingKey="uber_uns_address_line1" defaultValue="Vier Korken Wein-Boutique" isAdmin={isAdmin} as="p" className="font-semibold text-graphite-dark" />
                    <EditableText settingKey="uber_uns_address_line2" defaultValue="Steinbrunnengasse 3A" isAdmin={isAdmin} as="p" className="text-graphite" />
                    <EditableText settingKey="uber_uns_address_line3" defaultValue="5707 Seengen" isAdmin={isAdmin} as="p" className="text-graphite" />
                  </div>
                  <a href="/kontakt" className="btn btn-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Kontakt aufnehmen
                  </a>
                </div>
              </section>
            </div>

            {/* Right Column (Scrolled Down) */}
            <ScrollingColumn items={rightScrollItems} direction="down" side="right" />

          </div>
        </div>
      </div>

      {uploadSide && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-strong p-8 max-w-md w-full relative">
            <button
              className="absolute top-4 right-4 text-graphite hover:text-accent-burgundy transition-colors"
              onClick={() => setUploadSide(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-h4 font-serif text-graphite-dark mb-6">Neues Bild hochladen ({uploadSide === 'left' ? 'Links' : 'Rechts'})</h2>
            <ImageUploader
              onUploadComplete={handleUpload}
              maxSizeMB={5}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
