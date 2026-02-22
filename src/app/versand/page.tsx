import { MainLayout } from '@/components/layout/MainLayout';

export default function VersandPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
        <div className="container-custom max-w-4xl">
          <h1 className="text-display font-serif font-light text-graphite-dark mb-8">
            Versand & Lieferung
          </h1>

          <div className="space-y-8">
            {/* Versandkosten */}
            <section className="card p-8">
              <h2 className="text-h3 font-serif text-graphite-dark mb-6">Versandkosten</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-taupe-light">
                  <div>
                    <p className="font-semibold text-graphite-dark">Standardversand</p>
                    <p className="text-sm text-graphite">Lieferzeit: 3-5 Werktage</p>
                  </div>
                  <span className="font-semibold text-accent-burgundy">CHF 9.90</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-taupe-light">
                  <div>
                    <p className="font-semibold text-graphite-dark">Expressversand</p>
                    <p className="text-sm text-graphite">Lieferzeit: 1-2 Werktage</p>
                  </div>
                  <span className="font-semibold text-accent-burgundy">CHF 19.90</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-semibold text-graphite-dark">Abholung im Laden</p>
                    <p className="text-sm text-graphite">Nach Vereinbarung</p>
                  </div>
                  <span className="font-semibold text-accent-burgundy">Kostenlos</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent-gold/10 rounded-lg">
                <p className="text-sm">
                  <strong>💡 Kostenloser Versand</strong> ab einem Bestellwert von CHF 150.-
                </p>
              </div>
            </section>

            {/* Liefergebiete */}
            <section className="card p-8">
              <h2 className="text-h3 font-serif text-graphite-dark mb-6">Liefergebiete</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-graphite-dark mb-2">🇨🇭 Schweiz</h3>
                  <p className="text-graphite">
                    Wir liefern in die gesamte Schweiz. Die Lieferzeit beträgt in der Regel
                    3-5 Werktage nach Zahlungseingang.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-graphite-dark mb-2">🇪🇺 International</h3>
                  <p className="text-graphite">
                    Internationale Lieferungen sind auf Anfrage möglich. Bitte kontaktieren
                    Sie uns für ein individuelles Angebot. Es können zusätzliche Zollgebühren anfallen.
                  </p>
                </div>
              </div>
            </section>

            {/* Verpackung */}
            <section className="card p-8">
              <h2 className="text-h3 font-serif text-graphite-dark mb-6">Verpackung & Versand</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-burgundy/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-graphite-dark mb-1">Sichere Verpackung</h3>
                    <p className="text-sm text-graphite">
                      Ihre Weine werden sorgfältig in speziellen Weinkartons verpackt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-burgundy/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-graphite-dark mb-1">Versicherter Versand</h3>
                    <p className="text-sm text-graphite">
                      Alle Sendungen sind gegen Beschädigung versichert.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-burgundy/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-graphite-dark mb-1">Sendungsverfolgung</h3>
                    <p className="text-sm text-graphite">
                      Sie erhalten eine Tracking-Nummer per E-Mail.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent-burgundy/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-graphite-dark mb-1">Pünktliche Lieferung</h3>
                    <p className="text-sm text-graphite">
                      Wir garantieren schnelle und zuverlässige Lieferung.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Abholung */}
            <section className="card p-8 bg-gradient-to-br from-accent-burgundy/5 to-rose-light/20">
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">Abholung im Laden</h2>
              <p className="text-graphite mb-4">
                Sie können Ihre Bestellung auch direkt bei uns abholen - kostenlos!
              </p>
              <div className="bg-warmwhite p-4 rounded-lg">
                <p className="font-semibold text-graphite-dark">VIER KORKEN Weinboutique</p>
                <p className="text-graphite">Steinbrunnengasse 3A, 5707 Seengen</p>
                <p className="text-sm text-graphite mt-2">
                  <strong>Öffnungszeiten:</strong>
                </p>
                <div className="text-sm text-graphite space-y-1">
                  <p>Mo & Di: Geschlossen</p>
                  <p>Mi & Do: 13:30 – 18:30 Uhr</p>
                  <p>Fr: 09:00 – 12:00, 13:30 – 18:30 Uhr</p>
                  <p>Sa: 09:00 – 14:00 Uhr</p>
                  <p>So: Geschlossen</p>
                </div>
              </div>
              <p className="text-sm text-graphite mt-4">
                Bitte warten Sie auf unsere Bestätigung, bevor Sie Ihre Bestellung abholen.
              </p>
            </section>

            {/* Wichtige Hinweise */}
            <section className="card p-8 border-2 border-accent-burgundy/20">
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">Wichtige Hinweise</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-graphite">
                    <strong>Altersprüfung:</strong> Bei der Zustellung müssen Sie sich ausweisen können.
                    Der Verkauf von Alkohol ist nur an Personen ab 18 Jahren gestattet.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-graphite">
                    <strong>Annahme:</strong> Bitte stellen Sie sicher, dass jemand die Lieferung
                    entgegennehmen kann. Bei Nichtannahme können zusätzliche Kosten entstehen.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-graphite">
                    <strong>Beschädigung:</strong> Prüfen Sie die Sendung bei Annahme. Beschädigte
                    Pakete bitte direkt beim Zusteller reklamieren.
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
