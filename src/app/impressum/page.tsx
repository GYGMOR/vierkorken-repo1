import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | Vier Korken Wein-Boutique',
  description: 'Impressum der Vier Korken Wein-Boutique',
};

export default function ImpressumPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-warmwhite">
        <div className="container-custom max-w-3xl">
          <div className="mb-12">
            <h1 className="text-display font-serif font-light text-graphite-dark mb-4">
              Impressum
            </h1>
            <p className="text-body-lg text-graphite">
              Informationspflicht laut Gesetz
            </p>
          </div>

          <div className="space-y-8 text-graphite">
            {/* Kontakt */}
            <section className="card p-6 md:p-8">
              <h2 className="text-h4 font-serif text-graphite-dark mb-4">Kontaktadresse</h2>
              <div className="space-y-2">
                <p className="font-medium text-graphite-dark">Vier Korken Wein-Boutique</p>
                <p>Christina Hediger</p>
                <p>Steinbrunnengasse 3a</p>
                <p>5707 Seengen</p>
                <p>Schweiz</p>
              </div>
            </section>

            {/* Kontaktmöglichkeiten */}
            <section className="card p-6 md:p-8">
              <h2 className="text-h4 font-serif text-graphite-dark mb-4">Kontaktmöglichkeiten</h2>
              <div className="space-y-2">
                <p>
                  <strong className="text-graphite-dark">Telefon:</strong>{' '}
                  <a href="tel:+41623900404" className="text-accent-burgundy hover:underline">
                    062 390 04 04
                  </a>
                </p>
                <p>
                  <strong className="text-graphite-dark">E-Mail:</strong>{' '}
                  <a href="mailto:info@vierkorken.ch" className="text-accent-burgundy hover:underline">
                    info@vierkorken.ch
                  </a>
                </p>
                <p>
                  <strong className="text-graphite-dark">Website:</strong>{' '}
                  <a href="https://www.vierkorken.ch" target="_blank" rel="noopener noreferrer" className="text-accent-burgundy hover:underline">
                    www.vierkorken.ch
                  </a>
                </p>
              </div>
            </section>

            {/* Vertretungsberechtigte Personen */}
            <section className="card p-6 md:p-8">
              <h2 className="text-h4 font-serif text-graphite-dark mb-4">Vertretungsberechtigte Person</h2>
              <p>Christina Hediger, Geschäftsführerin</p>
            </section>

            {/* Haftungsausschluss */}
            <section className="card p-6 md:p-8">
              <h2 className="text-h4 font-serif text-graphite-dark mb-4">Haftungsausschluss</h2>
              <p className="mb-4">
                Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
              </p>
              <p className="mb-4">
                Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.
              </p>
              <p>
                Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
              </p>
            </section>

            {/* Haftung für Links */}
            <section className="card p-6 md:p-8">
              <h2 className="text-h4 font-serif text-graphite-dark mb-4">Haftung für Links</h2>
              <p>
                Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers oder der Nutzerin.
              </p>
            </section>

            {/* Urheberrechte */}
            <section className="card p-6 md:p-8">
              <h2 className="text-h4 font-serif text-graphite-dark mb-4">Urheberrechte</h2>
              <p>
                Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich der <strong>Vier Korken Wein-Boutique</strong> oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
