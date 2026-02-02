'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useEffect, useState } from 'react';

export default function WeinwissenPage() {
  const [dailyTip, setDailyTip] = useState({
    title: 'Weinlagerung',
    content: 'Wein sollte bei konstanter Temperatur zwischen 10-15°C gelagert werden. Schwankungen können den Reifeprozess negativ beeinflussen.',
    date: new Date().toLocaleDateString('de-CH'),
  });

  return (
    <MainLayout>
      <div className="section-padding bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
        <div className="container-custom max-w-4xl">
          <h1 className="text-display font-serif font-light text-graphite-dark mb-8 text-center">
            Weinwissen
          </h1>

          {/* Daily Tip */}
          <div className="card p-8 mb-8 bg-gradient-to-br from-accent-burgundy/5 to-rose-light/20">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-h4 font-serif text-graphite-dark">Tipp des Tages</h2>
              <span className="ml-auto text-sm text-graphite">{dailyTip.date}</span>
            </div>
            <h3 className="text-h5 font-semibold text-graphite-dark mb-2">{dailyTip.title}</h3>
            <p className="text-graphite leading-relaxed">{dailyTip.content}</p>
          </div>

          {/* Weinwissen Kategorien */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6 card-hover cursor-pointer">
              <h3 className="text-h5 font-serif text-graphite-dark mb-3">Weinarten</h3>
              <p className="text-sm text-graphite">Lernen Sie die Unterschiede zwischen Rotwein, Weisswein, Rosé und Schaumwein kennen.</p>
            </div>
            <div className="card p-6 card-hover cursor-pointer">
              <h3 className="text-h5 font-serif text-graphite-dark mb-3">Weinregionen</h3>
              <p className="text-sm text-graphite">Entdecken Sie die bedeutendsten Weinregionen der Welt und ihre Besonderheiten.</p>
            </div>
            <div className="card p-6 card-hover cursor-pointer">
              <h3 className="text-h5 font-serif text-graphite-dark mb-3">Weinlagerung</h3>
              <p className="text-sm text-graphite">Erfahren Sie, wie Sie Wein richtig lagern und optimal reifen lassen.</p>
            </div>
            <div className="card p-6 card-hover cursor-pointer">
              <h3 className="text-h5 font-serif text-graphite-dark mb-3">Verkostung</h3>
              <p className="text-sm text-graphite">Die Kunst der Weinverkostung: Sehen, Riechen, Schmecken.</p>
            </div>
          </div>

          {/* Artikel */}
          <h2 className="text-h3 font-serif text-graphite-dark mb-6">Beliebte Artikel</h2>
          <div className="space-y-6">
            {[
              {
                title: 'Der perfekte Weinkühlschrank',
                excerpt: 'Wie Sie Ihren Wein optimal temperieren und lagern.',
                date: '15. Januar 2025',
              },
              {
                title: 'Wein und Speisen richtig kombinieren',
                excerpt: 'Die Kunst des Food Pairings für unvergessliche Genussmomente.',
                date: '10. Januar 2025',
              },
              {
                title: 'Bio-Weine: Was steckt dahinter?',
                excerpt: 'Alles über ökologischen Weinbau und nachhaltige Produktion.',
                date: '5. Januar 2025',
              },
            ].map((article, index) => (
              <div key={index} className="card p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-h5 font-serif text-graphite-dark">{article.title}</h3>
                  <span className="text-sm text-graphite whitespace-nowrap ml-4">{article.date}</span>
                </div>
                <p className="text-graphite">{article.excerpt}</p>
                <button className="mt-4 text-accent-burgundy hover:underline text-sm font-semibold">
                  Weiterlesen →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
