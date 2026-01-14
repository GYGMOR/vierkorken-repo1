import { MainLayout } from '@/components/layout/MainLayout';

export default function UberUnsPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
        <div className="container-custom max-w-4xl">
          <h1 className="text-display font-serif font-light text-graphite-dark mb-8 text-center">
            Über uns
          </h1>

          <div className="space-y-8">
            <section className="card p-8">
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">Unsere Geschichte</h2>
              <p className="text-graphite leading-relaxed">
                VIER KORKEN ist mehr als nur ein Weinshop – wir sind eine Gemeinschaft von
                Weinliebhabern, die Qualität, Genuss und Kultur vereint. Seit unserer Gründung
                haben wir es uns zur Aufgabe gemacht, exquisite Weine aus aller Welt zugänglich
                zu machen und unsere Leidenschaft für edle Tropfen mit Ihnen zu teilen.
              </p>
            </section>

            <section className="card p-8 bg-gradient-to-br from-accent-burgundy/5 to-rose-light/20">
              <h2 className="text-h3 font-serif text-graphite-dark mb-6">Unsere Mission</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-graphite-dark mb-2">Qualität</h3>
                  <p className="text-sm text-graphite">Handverlesene Weine von ausgewählten Weingütern</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-graphite-dark mb-2">Gemeinschaft</h3>
                  <p className="text-sm text-graphite">Eine lebendige Community von Weinliebhabern</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-graphite-dark mb-2">Wissen</h3>
                  <p className="text-sm text-graphite">Weinwissen und Expertise für alle Levels</p>
                </div>
              </div>
            </section>

            <section className="card p-8">
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">Was uns auszeichnet</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-graphite-dark">Kuratierte Auswahl</h3>
                    <p className="text-graphite">Jeder Wein wird sorgfältig ausgewählt und probiert</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-graphite-dark">Loyalty Club</h3>
                    <p className="text-graphite">Sammeln Sie Punkte und profitieren Sie von exklusiven Vorteilen</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-graphite-dark">Events & Verkostungen</h3>
                    <p className="text-graphite">Regelmäßige Weinverkostungen und exklusive Events</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-graphite-dark">Persönliche Beratung</h3>
                    <p className="text-graphite">Unser Team berät Sie gerne bei der Weinauswahl</p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="card p-8 text-center">
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">Besuchen Sie uns</h2>
              <div className="max-w-md mx-auto">
                <p className="text-graphite mb-4">
                  Erleben Sie VIER KORKEN persönlich in unserem Laden in Seengen
                </p>
                <div className="bg-rose-light/30 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-graphite-dark">VIER KORKEN</p>
                  <p className="text-graphite">Steinbrunnengasse 3A</p>
                  <p className="text-graphite">5707 Seengen</p>
                </div>
                <a href="/kontakt" className="btn btn-primary">
                  Kontakt aufnehmen
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
