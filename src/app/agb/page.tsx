import { MainLayout } from '@/components/layout/MainLayout';

export default function AGBPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-warmwhite">
        <div className="container-custom max-w-4xl">
          <h1 className="text-display font-serif font-light text-graphite-dark mb-8">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-graphite">
            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">1. Geltungsbereich</h2>
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über
                den Online-Shop von VIERKORKEN. Mit der Bestellung erklären Sie sich mit diesen
                AGB einverstanden.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">2. Vertragspartner</h2>
              <div className="bg-rose-light/30 p-4 rounded-lg">
                <p className="font-semibold">VIERKORKEN</p>
                <p>Steinbrunnengasse 3A</p>
                <p>5707 Seengen</p>
                <p>Schweiz</p>
                <p className="mt-2">E-Mail: info@vierkorken.ch</p>
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">3. Vertragsabschluss</h2>
              <p>
                Der Vertrag kommt durch Ihre Bestellung und unsere Auftragsbestätigung zustande.
                Die Präsentation der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Produktauswahl und Warenkorblegung</li>
                <li>Eingabe Ihrer Daten und Versandadresse</li>
                <li>Auswahl der Zahlungsart</li>
                <li>Überprüfung und Bestätigung der Bestellung</li>
                <li>Auftragsbestätigung per E-Mail</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">4. Preise und Zahlungsbedingungen</h2>
              <p>
                Alle Preise verstehen sich in Schweizer Franken (CHF) inklusive der gesetzlichen Mehrwertsteuer.
                Versandkosten werden separat ausgewiesen.
              </p>
              <p className="mt-2">
                <strong>Zahlungsarten:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Kreditkarte (Visa, Mastercard)</li>
                <li>PayPal</li>
                <li>Rechnung (nach Prüfung)</li>
                <li>TWINT</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">5. Lieferung und Versand</h2>
              <p>
                Die Lieferung erfolgt innerhalb der Schweiz. Lieferzeiten sind Schätzungen
                und nicht verbindlich.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Standardversand: 3-5 Werktage</li>
                <li>Expressversand: 1-2 Werktage</li>
                <li>Abholung im Laden: Nach Vereinbarung</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">6. Altersbeschränkung</h2>
              <div className="bg-accent-burgundy/10 p-4 rounded-lg">
                <p className="font-semibold text-accent-burgundy">
                  ⚠️ Wichtiger Hinweis: Alkoholverkauf nur an Personen ab 18 Jahren
                </p>
                <p className="mt-2">
                  Der Kauf von alkoholischen Getränken ist nur für Personen ab 18 Jahren gestattet.
                  Mit Ihrer Bestellung bestätigen Sie, dass Sie das gesetzliche Mindestalter erreicht haben.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">7. Widerrufsrecht</h2>
              <p>
                Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                Details finden Sie in unserer Widerrufsbelehrung.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">8. Gewährleistung</h2>
              <p>
                Es gelten die gesetzlichen Gewährleistungsrechte. Bei mangelhafter Ware
                haben Sie Anspruch auf Nacherfüllung, Minderung oder Rücktritt.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">9. Haftung</h2>
              <p>
                Wir haften für Vorsatz und grobe Fahrlässigkeit. Bei leichter Fahrlässigkeit
                haften wir nur bei Verletzung wesentlicher Vertragspflichten.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">10. Loyalty Club</h2>
              <p>
                Die Teilnahme am VIERKORKEN Loyalty Club ist kostenlos. Punkte können bei
                Einkäufen gesammelt und gegen Prämien eingelöst werden. Details finden Sie
                in den Loyalty Club Bedingungen.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-serif text-graphite-dark mb-4">11. Anwendbares Recht</h2>
              <p>
                Es gilt ausschließlich Schweizerisches Recht unter Ausschluss des
                UN-Kaufrechts (CISG). Gerichtsstand ist Seengen, Schweiz.
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
