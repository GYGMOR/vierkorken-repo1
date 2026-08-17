'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { EditableImage } from '@/components/admin/EditableImage';
import { EditableText } from '@/components/admin/EditableText';
import { DailyTipManager } from '@/components/blog/DailyTipManager';

interface DailyTip {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface WeinwissenClientProps {
  isAdmin: boolean;
}

export function WeinwissenClient({ isAdmin }: WeinwissenClientProps) {
  const [tips, setTips] = useState<DailyTip[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [selectedTip, setSelectedTip] = useState<DailyTip | null>(null);

  const fetchTips = async () => {
    try {
      const res = await fetch('/api/admin/tips');
      const data = await res.json();
      if (data.success) {
        setTips(data.tips);
      }
    } catch (err) {
      console.error('Error fetching tips:', err);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-accent-burgundy/10 border-b border-taupe-light overflow-hidden">
        <div className="absolute inset-0 z-0">
          <EditableImage
            settingKey="weinwissen_page_header_image"
            defaultSrc="/images/layout/weingläser.jpg"
            alt="Weinwissen Hintergrund"
            fill
            className="object-cover opacity-15"
            priority
            isAdmin={isAdmin}
          />
        </div>

        <div className="container-custom py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BackButton href="/" className="mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 backdrop-blur-sm">
              <span className="text-accent-burgundy font-medium text-sm">WEINWISSEN &amp; BLOG</span>
            </div>
            
            <h1 className="text-display font-serif font-light text-graphite-dark">
              <EditableText
                settingKey="weinwissen_hero_title"
                defaultValue="Wein verstehen &amp; geniessen"
                isAdmin={isAdmin}
              />
            </h1>

            <p className="text-body-lg text-graphite">
              <EditableText
                settingKey="weinwissen_hero_subtitle"
                defaultValue="Tauchen Sie ein in die faszinierende Welt des Weins. Von der Traube bis ins Glas – entdecken Sie das Wissen, das jeden Schluck zu einem besonderen Erlebnis macht."
                isAdmin={isAdmin}
                multiline
              />
            </p>

            {isAdmin && (
              <div className="pt-2">
                <Button
                  onClick={() => setShowManager(true)}
                  className="bg-accent-burgundy hover:bg-wine-dark text-white text-sm px-5 py-2.5 rounded-xl shadow-md"
                >
                  ✏️ Blog &amp; Tages-Tipps verwalten / Beiträge hinzufügen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container-custom py-12 space-y-16">
        {/* Introduction */}
        <section className="max-w-4xl mx-auto text-center">
          <div className="text-body-lg text-graphite leading-relaxed p-6 bg-warmwhite-light/60 rounded-2xl border border-taupe-light/40">
            <EditableText
              settingKey="weinwissen_intro_text"
              defaultValue="Wein ist mehr als nur ein Getränk – er ist Kultur, Geschichte und Handwerk. Ob Sie gerade erst beginnen, sich für Wein zu interessieren, oder bereits ein erfahrener Geniesser sind: Hier finden Sie wertvolles Wissen rund um Rebsorten, Verkostung, Lagerung und die perfekte Kombination von Wein und Speisen."
              isAdmin={isAdmin}
              multiline
            />
          </div>
        </section>

        {/* Knowledge Cards Grid */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Rebsorten */}
          <Card className="hover:shadow-strong transition-all duration-300 border-taupe-light/60">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                <GrapeIcon className="w-6 h-6 text-accent-burgundy" />
              </div>
              <CardTitle>
                <EditableText
                  settingKey="weinwissen_card1_title"
                  defaultValue="Rebsorten"
                  isAdmin={isAdmin}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-graphite">
                <EditableText
                  settingKey="weinwissen_card1_desc"
                  defaultValue="Von Pinot Noir bis Chardonnay – lernen Sie die wichtigsten Rebsorten kennen und verstehen Sie ihre einzigartigen Charakteristiken."
                  isAdmin={isAdmin}
                  multiline
                />
              </p>
              <ul className="space-y-2 text-body-sm text-graphite/80 border-t border-taupe-light/40 pt-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card1_item1"
                      defaultValue="Rotwein-Rebsorten: Pinot Noir, Merlot, Cabernet Sauvignon"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card1_item2"
                      defaultValue="Weisswein-Rebsorten: Chardonnay, Sauvignon Blanc, Riesling"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card1_item3"
                      defaultValue="Schweizer Spezialitäten: Chasselas, Petite Arvine"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Verkostung */}
          <Card className="hover:shadow-strong transition-all duration-300 border-taupe-light/60">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                <NoseIcon className="w-6 h-6 text-accent-burgundy" />
              </div>
              <CardTitle>
                <EditableText
                  settingKey="weinwissen_card2_title"
                  defaultValue="Verkostung"
                  isAdmin={isAdmin}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-graphite">
                <EditableText
                  settingKey="weinwissen_card2_desc"
                  defaultValue="Die Kunst der Weinverkostung: Sehen, Riechen, Schmecken – entdecken Sie, wie Sie Wein mit allen Sinnen geniessen."
                  isAdmin={isAdmin}
                  multiline
                />
              </p>
              <ul className="space-y-2 text-body-sm text-graphite/80 border-t border-taupe-light/40 pt-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card2_item1"
                      defaultValue="Die richtige Temperatur für jeden Weintyp"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card2_item2"
                      defaultValue="Aromen erkennen und beschreiben"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card2_item3"
                      defaultValue="Die Bedeutung von Struktur und Balance"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3: Lagerung */}
          <Card className="hover:shadow-strong transition-all duration-300 border-taupe-light/60">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                <StorageIcon className="w-6 h-6 text-accent-burgundy" />
              </div>
              <CardTitle>
                <EditableText
                  settingKey="weinwissen_card3_title"
                  defaultValue="Lagerung"
                  isAdmin={isAdmin}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-graphite">
                <EditableText
                  settingKey="weinwissen_card3_desc"
                  defaultValue="Bewahren Sie Ihre Weine optimal auf und lassen Sie sie reifen – die richtige Lagerung macht den Unterschied."
                  isAdmin={isAdmin}
                  multiline
                />
              </p>
              <ul className="space-y-2 text-body-sm text-graphite/80 border-t border-taupe-light/40 pt-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card3_item1"
                      defaultValue="Ideale Temperatur: 10-15°C konstant"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card3_item2"
                      defaultValue="Luftfeuchtigkeit und Lichtschutz"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card3_item3"
                      defaultValue="Liegende Lagerung für Korkverschlüsse"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 4: Food Pairing */}
          <Card className="hover:shadow-strong transition-all duration-300 border-taupe-light/60">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                <FoodIcon className="w-6 h-6 text-accent-burgundy" />
              </div>
              <CardTitle>
                <EditableText
                  settingKey="weinwissen_card4_title"
                  defaultValue="Food Pairing"
                  isAdmin={isAdmin}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-body-sm text-graphite">
                <EditableText
                  settingKey="weinwissen_card4_desc"
                  defaultValue="Die perfekte Harmonie: Entdecken Sie, welcher Wein zu welchem Gericht passt und warum."
                  isAdmin={isAdmin}
                  multiline
                />
              </p>
              <ul className="space-y-2 text-body-sm text-graphite/80 border-t border-taupe-light/40 pt-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card4_item1"
                      defaultValue="Rotwein zu Fleisch und kräftigen Gerichten"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card4_item2"
                      defaultValue="Weisswein zu Fisch und leichten Speisen"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-burgundy mt-0.5">•</span>
                  <span>
                    <EditableText
                      settingKey="weinwissen_card4_item3"
                      defaultValue="Süsswein und Käse – eine klassische Kombination"
                      isAdmin={isAdmin}
                    />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Dynamic Blog Articles & Daily Tips Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-taupe-light/60 pb-4">
            <div>
              <h2 className="text-2xl font-serif text-graphite-dark">
                🍷 Aktuelle Blog-Beiträge &amp; Sommelier-Tipps
              </h2>
              <p className="text-sm text-graphite/70 mt-1">
                Wertvolle Wissenbeiträge &amp; Empfehlungen unserer Experten
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowManager(true)}
                size="sm"
                className="bg-accent-burgundy hover:bg-wine-dark text-white shrink-0"
              >
                + Neuer Beitrag / Tipp
              </Button>
            )}
          </div>

          {tips.length === 0 ? (
            <div className="text-center py-12 bg-warmwhite-light rounded-xl border border-dashed border-taupe">
              <p className="text-graphite/60 text-sm">Noch keine Blog-Beiträge vorhanden.</p>
              {isAdmin && (
                <Button onClick={() => setShowManager(true)} size="sm" className="mt-3">
                  Ersten Beitrag verfassen
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map((tip) => (
                <Card key={tip.id} className="hover:shadow-md transition-shadow border-taupe-light/60 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-serif text-graphite-dark line-clamp-2">
                      {tip.title}
                    </CardTitle>
                    <span className="text-xs text-graphite/50">
                      {new Date(tip.createdAt).toLocaleDateString('de-CH')}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="text-sm text-graphite/80 line-clamp-4 prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: tip.content }}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setSelectedTip(tip)}
                    >
                      Vollständigen Beitrag lesen →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
            <h2 className="text-h2 font-serif font-light text-wine-dark mb-4">
              <EditableText
                settingKey="weinwissen_cta_title"
                defaultValue="Vertiefen Sie Ihr Wissen"
                isAdmin={isAdmin}
              />
            </h2>
            <p className="text-body-lg text-graphite mb-8">
              <EditableText
                settingKey="weinwissen_cta_desc"
                defaultValue="Besuchen Sie unsere Verkostungen und Masterclasses, um Ihr Weinwissen praktisch zu erweitern und neue Favoriten zu entdecken."
                isAdmin={isAdmin}
                multiline
              />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg">Zu den Events</Button>
              </Link>
              <Link href="/weine">
                <Button size="lg" variant="secondary">Weine entdecken</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>

      {/* Modal for Reading Full Article */}
      {selectedTip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTip(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-taupe-light/30 hover:bg-taupe-light flex items-center justify-center text-graphite font-bold"
            >
              ✕
            </button>
            <div>
              <span className="text-xs font-semibold text-accent-burgundy uppercase tracking-wider">
                WEINWISSEN BEITRAG
              </span>
              <h2 className="text-2xl font-serif text-graphite-dark mt-1">
                {selectedTip.title}
              </h2>
              <p className="text-xs text-graphite/50 mt-1">
                Veröffentlicht am {new Date(selectedTip.createdAt).toLocaleDateString('de-CH')}
              </p>
            </div>
            <div
              className="prose prose-burgundy max-w-none text-graphite leading-relaxed text-sm md:text-base border-t border-taupe-light/40 pt-4"
              dangerouslySetInnerHTML={{ __html: selectedTip.content }}
            />
            <div className="pt-4 border-t border-taupe-light/40 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedTip(null)}>
                Schliessen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tip Manager Modal */}
      {showManager && (
        <DailyTipManager
          onClose={() => setShowManager(false)}
          onUpdate={() => fetchTips()}
        />
      )}
    </MainLayout>
  );
}

// Icons
function GrapeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="8" cy="12" r="1.5" />
      <circle cx="16" cy="12" r="1.5" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  );
}

function NoseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function StorageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

function FoodIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
