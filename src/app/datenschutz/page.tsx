import { MainLayout } from '@/components/layout/MainLayout';

export default function DatenschutzPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-warmwhite">
        <div className="container-custom max-w-4xl">
          <h1 className="text-display font-serif font-light text-graphite-dark mb-8">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-graphite">
            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">1. Allgemeines</h2>
              <p>
                Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. In dieser
                Datenschutzerklärung informieren wir Sie über die Verarbeitung Ihrer personenbezogenen
                Daten bei der Nutzung unserer Website und unseres Online-Shops.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">2. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung ist:
              </p>
              <div className="bg-rose-light/30 p-4 rounded-lg mt-2">
                <p className="font-semibold">VIERKORKEN</p>
                <p>Steinbrunnengasse 3A</p>
                <p>5707 Seengen</p>
                <p>Schweiz</p>
                <p className="mt-2">E-Mail: info@vierkorken.ch</p>
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">3. Erhebung und Speicherung personenbezogener Daten</h2>
              <p>
                Wir erheben und speichern folgende Daten:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Name und Kontaktdaten (E-Mail, Telefonnummer, Adresse)</li>
                <li>Bestellinformationen und Zahlungsdaten</li>
                <li>Nutzungsdaten (IP-Adresse, Browser, Betriebssystem)</li>
                <li>Loyalty Club Informationen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">4. Zweck der Datenverarbeitung</h2>
              <p>
                Ihre Daten werden verwendet für:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Bestellabwicklung und Lieferung</li>
                <li>Kundenservice und Support</li>
                <li>Verwaltung Ihres Kundenkontos</li>
                <li>Newsletter und Marketing (mit Ihrer Einwilligung)</li>
                <li>Loyalty Club Verwaltung</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">5. Cookies</h2>
              <p>
                Unsere Website verwendet Cookies, um die Nutzererfahrung zu verbessern.
                Sie können Cookies in Ihren Browser-Einstellungen jederzeit deaktivieren.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">6. Weitergabe von Daten</h2>
              <p>
                Wir geben Ihre Daten nur an Dritte weiter, wenn:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Sie ausdrücklich eingewilligt haben</li>
                <li>Es zur Vertragserfüllung notwendig ist (z.B. Versanddienstleister)</li>
                <li>Eine gesetzliche Verpflichtung besteht</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">7. Ihre Rechte</h2>
              <p>
                Sie haben folgende Rechte:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerspruch gegen die Verarbeitung</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">8. Datensicherheit</h2>
              <p>
                Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein,
                um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust,
                Zerstörung oder den Zugriff unberechtigter Personen zu schützen.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">9. Änderungen</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen,
                um sie an geänderte Rechtslagen oder Änderungen unserer Dienstleistungen
                anzupassen.
              </p>
            </section>

            <div className="mt-8 p-4 bg-accent-burgundy/10 rounded-lg">
              <p className="text-sm">
                <strong>Stand:</strong> Januar 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
