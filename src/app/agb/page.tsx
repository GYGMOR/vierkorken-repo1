import { MainLayout } from '@/components/layout/MainLayout';

export default function AGBPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-warmwhite">
        <div className="container-custom max-w-4xl px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl lg:text-display font-serif font-light text-graphite-dark mb-6 md:mb-8">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <div className="prose prose-sm md:prose-lg max-w-none space-y-6 text-graphite">
            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">1. Geltungsbereich</h2>
              <p>
                Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Verträge zwischen der Vier Korken Wein-Boutique (nachfolgend "Anbieter") und dem Kunden (nachfolgend "Kunde"), die über den Online-Shop unter vierkorken.ch geschlossen werden.
              </p>
              <p className="mt-2">
                Mit der Bestellung von Waren über den Online-Shop erklärt sich der Kunde mit der Geltung dieser AGB einverstanden. Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">2. Vertragspartner und Kontakt</h2>
              <div className="bg-rose-light/30 p-4 md:p-6 rounded-lg">
                <p className="font-semibold">Vier Korken Wein-Boutique</p>
                <p>Joel Hediger</p>
                <p>Steinbrunnengasse 3A</p>
                <p>5707 Seengen AG</p>
                <p>Schweiz</p>
                <p className="mt-2">E-Mail: info@vierkorken.ch</p>
                <p>Website: www.vierkorken.ch</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">3. Vertragsabschluss</h2>
              <p>
                Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.
              </p>
              <p className="mt-2">
                Der Vertragsabschluss erfolgt in folgenden Schritten:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Auswahl der gewünschten Produkte und Hinzufügen zum Warenkorb</li>
                <li>Eingabe der Kunden- und Versanddaten im Checkout-Prozess</li>
                <li>Durchführung der Altersverifikation mittels Stripe Identity (siehe Ziffer 6)</li>
                <li>Auswahl der Zahlungsart und Liefermethode</li>
                <li>Überprüfung und Bestätigung der Bestellung durch Klick auf "Jetzt bezahlen"</li>
                <li>Weiterleitung zum Zahlungsdienstleister (Stripe)</li>
              </ul>
              <p className="mt-2">
                Nach Abschluss der Bestellung erhält der Kunde eine automatische Bestellbestätigung per E-Mail. Diese stellt lediglich eine Empfangsbestätigung dar und führt noch nicht zum Vertragsabschluss.
              </p>
              <p className="mt-2">
                Der Vertrag kommt erst durch unsere separate Auftragsbestätigung oder durch die Auslieferung der Ware zustande. Der Anbieter behält sich vor, Bestellungen ohne Angabe von Gründen abzulehnen.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">4. Preise, Versandkosten und Zahlungsbedingungen</h2>
              <p>
                <strong>4.1 Preise</strong><br />
                Alle angegebenen Preise verstehen sich in Schweizer Franken (CHF) und beinhalten die gesetzliche Schweizer Mehrwertsteuer (8.1%). Zusätzlich können Versandkosten anfallen, die separat ausgewiesen werden.
              </p>
              <p className="mt-2">
                <strong>4.2 Versandkosten</strong><br />
                Die Versandkosten sind abhängig von der gewählten Liefermethode und dem Bestellwert:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Standardversand: CHF 9.90 (versandkostenfrei ab CHF 150.00)</li>
                <li>Expressversand: CHF 19.90 (CHF 9.90 ab CHF 150.00)</li>
                <li>Abholung im Laden: Kostenlos</li>
              </ul>
              <p className="mt-2">
                <strong>4.3 Zahlungsarten</strong><br />
                Die Zahlung erfolgt über unseren Zahlungsdienstleister Stripe, Inc. mit Sitz in den USA. Folgende Zahlungsarten werden akzeptiert:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Kreditkarte (Visa, Mastercard, American Express)</li>
                <li>TWINT</li>
                <li>Apple Pay / Google Pay</li>
                <li>Barzahlung bei Abholung</li>
              </ul>
              <p className="mt-2">
                Bei Zahlung über Stripe werden Ihre Zahlungsdaten direkt an Stripe übermittelt und dort verschlüsselt verarbeitet. Der Anbieter erhält keine Kreditkartendaten. Es gelten die Datenschutzbestimmungen von Stripe: <a href="https://stripe.com/ch/privacy" className="text-wine hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/ch/privacy</a>
              </p>
              <p className="mt-2">
                <strong>4.4 Fälligkeit</strong><br />
                Die Zahlung ist bei Vertragsabschluss fällig. Bei Barzahlung erfolgt die Zahlung bei Abholung der Ware.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">5. Lieferung und Erfüllungsort</h2>
              <p>
                <strong>5.1 Liefergebiet</strong><br />
                Die Lieferung erfolgt ausschliesslich innerhalb der Schweiz.
              </p>
              <p className="mt-2">
                <strong>5.2 Lieferzeit</strong><br />
                Die Lieferzeiten sind Schätzungen und nicht verbindlich:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Standardversand: 3-5 Werktage nach Zahlungseingang</li>
                <li>Expressversand: 1-2 Werktage nach Zahlungseingang</li>
                <li>Abholung im Laden: Nach telefonischer Vereinbarung</li>
              </ul>
              <p className="mt-2">
                <strong>5.3 Teillieferungen</strong><br />
                Teillieferungen sind zulässig, sofern dem Kunden dadurch keine zusätzlichen Versandkosten entstehen und die Teillieferung für den Kunden zumutbar ist.
              </p>
              <p className="mt-2">
                <strong>5.4 Erfüllungsort</strong><br />
                Erfüllungsort ist der Sitz des Anbieters in Seengen AG, Schweiz.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">6. Altersbeschränkung und Identitätsverifizierung</h2>
              <div className="bg-accent-burgundy/10 p-4 md:p-6 rounded-lg">
                <p className="font-semibold text-accent-burgundy text-lg">
                  ⚠️ Wichtig: Verkauf alkoholischer Getränke nur an Personen ab 18 Jahren
                </p>
                <p className="mt-3">
                  <strong>6.1 Gesetzliche Grundlage</strong><br />
                  Gemäss Art. 11 Abs. 2 des Schweizer Lebensmittelgesetzes (LMG) und der Lebensmittel- und Gebrauchsgegenständeverordnung (LGV) ist die Abgabe von alkoholischen Getränken an Personen unter 18 Jahren verboten.
                </p>
                <p className="mt-2">
                  <strong>6.2 Pflicht zur Identitätsverifizierung</strong><br />
                  Um die Einhaltung dieser gesetzlichen Vorschriften zu gewährleisten, ist jeder Kunde vor dem ersten Kauf alkoholischer Getränke verpflichtet, sein Alter mittels Identitätsdokument nachzuweisen.
                </p>
                <p className="mt-2">
                  <strong>6.3 Verifizierungsprozess mittels Stripe Identity</strong><br />
                  Die Altersverifikation erfolgt durch unseren Dienstleister Stripe Identity:
                </p>
                <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2">
                  <li>Während des Checkout-Prozesses werden Sie aufgefordert, ein gültiges Identitätsdokument (Pass, Personalausweis oder Führerausweis) hochzuladen</li>
                  <li>Zusätzlich ist ein Selfie (Live-Foto) erforderlich, um die Identität zu bestätigen</li>
                  <li>Die Verifizierung erfolgt automatisiert durch Stripe Identity</li>
                  <li>Die Daten werden verschlüsselt übertragen und gemäss den Datenschutzbestimmungen verarbeitet</li>
                </ul>
                <p className="mt-2">
                  <strong>6.4 Speicherung der Verifizierung</strong><br />
                  Für registrierte Kunden: Die erfolgreiche Altersverifizierung wird in Ihrem Kundenkonto gespeichert. Sie müssen die Verifizierung nur einmal durchführen.<br />
                  Für Gast-Käufer: Die Verifizierung muss bei jeder Bestellung erneut durchgeführt werden. Wenn Sie die gleiche E-Mail-Adresse verwenden, die einem verifizierten Konto zugeordnet ist, wird die Verifizierung automatisch erkannt.
                </p>
                <p className="mt-2">
                  <strong>6.5 Ablehnung bei fehlgeschlagener Verifizierung</strong><br />
                  Kann die Altersverifikation nicht erfolgreich durchgeführt werden, wird die Bestellung automatisch abgebrochen. Ein Kaufvertrag kommt in diesem Fall nicht zustande.
                </p>
                <p className="mt-2">
                  <strong>6.6 Rechtliche Konsequenzen</strong><br />
                  Das vorsätzliche Umgehen der Altersverifikation oder die Verwendung gefälschter Dokumente kann strafrechtliche Konsequenzen nach sich ziehen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">7. Widerrufsrecht und Rückgabe</h2>
              <p>
                <strong>7.1 Widerrufsrecht für Konsumenten</strong><br />
                Verbraucher haben gemäss Art. 40a ff. des Schweizerischen Obligationenrechts (OR) das Recht, binnen 14 Tagen ohne Angabe von Gründen vom Vertrag zurückzutreten.
              </p>
              <p className="mt-2">
                Die Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem der Kunde oder ein von ihm benannter Dritter die Waren in Besitz genommen hat.
              </p>
              <p className="mt-2">
                <strong>7.2 Ausübung des Widerrufsrechts</strong><br />
                Um das Widerrufsrecht auszuüben, muss der Kunde uns mittels einer eindeutigen Erklärung (z.B. per E-Mail an info@vierkorken.ch) über den Entschluss, den Vertrag zu widerrufen, informieren.
              </p>
              <p className="mt-2">
                <strong>7.3 Folgen des Widerrufs</strong><br />
                Im Falle eines wirksamen Widerrufs sind die beiderseits empfangenen Leistungen zurückzugewähren. Der Kunde trägt die Kosten der Rücksendung. Die Rückerstattung erfolgt innerhalb von 14 Tagen nach Erhalt der zurückgesendeten Ware.
              </p>
              <p className="mt-2">
                <strong>7.4 Ausschluss des Widerrufsrechts</strong><br />
                Das Widerrufsrecht besteht nicht bei Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn deren Versiegelung nach der Lieferung entfernt wurde.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">8. Gewährleistung und Haftung</h2>
              <p>
                <strong>8.1 Gewährleistung</strong><br />
                Es gelten die gesetzlichen Gewährleistungsbestimmungen gemäss Schweizerischem Obligationenrecht (Art. 197 ff. OR). Bei mangelhafter Ware hat der Kunde Anspruch auf Nachbesserung, Ersatzlieferung, Minderung oder Rücktritt vom Vertrag.
              </p>
              <p className="mt-2">
                <strong>8.2 Haftungsbeschränkung</strong><br />
                Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist in diesem Fall auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
              </p>
              <p className="mt-2">
                Für den Verlust von Daten haftet der Anbieter nur, soweit dieser Verlust nicht durch regelmässige und vollständige Sicherung aller Daten durch den Kunden vermeidbar gewesen wäre.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">9. Vier Korken Wein-Boutique Loyalty Club</h2>
              <p>
                <strong>9.1 Teilnahme</strong><br />
                Die Teilnahme am Vier Korken Wein-Boutique Loyalty Club ist kostenlos und freiwillig. Sie erfordert die Registrierung eines Kundenkontos.
              </p>
              <p className="mt-2">
                <strong>9.2 Punkte sammeln</strong><br />
                Registrierte Kunden sammeln bei jedem Einkauf Loyalty-Punkte. Die Anzahl der Punkte richtet sich nach dem Bestellwert und dem aktuellen Loyalty-Level des Kunden.
              </p>
              <p className="mt-2">
                <strong>9.3 Einlösung und Verfallfristen</strong><br />
                Gesammelte Punkte können gegen Prämien, Rabatte oder exklusive Angebote eingelöst werden. Punkte verfallen nicht, solange das Kundenkonto aktiv ist (mindestens ein Login innerhalb von 24 Monaten).
              </p>
              <p className="mt-2">
                <strong>9.4 Badges und Levels</strong><br />
                Kunden können durch bestimmte Aktionen (z.B. Teilnahme an Events, Bestellungen zu bestimmten Zeiten) digitale Badges und höhere Loyalty-Levels erreichen, die zusätzliche Vorteile bieten.
              </p>
              <p className="mt-2">
                <strong>9.5 Kündigung</strong><br />
                Die Teilnahme am Loyalty Club kann jederzeit durch Löschung des Kundenkontos beendet werden. Nicht eingelöste Punkte verfallen dabei ersatzlos.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">10. Eigentumsvorbehalt</h2>
              <p>
                Die gelieferte Ware bleibt bis zur vollständigen Bezahlung aller Forderungen aus dem Kaufvertrag Eigentum des Anbieters.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">11. Schlussbestimmungen</h2>
              <p>
                <strong>11.1 Anwendbares Recht</strong><br />
                Für alle Rechtsbeziehungen zwischen dem Anbieter und dem Kunden gilt ausschliesslich Schweizerisches Recht unter Ausschluss des UN-Kaufrechts (CISG).
              </p>
              <p className="mt-2">
                <strong>11.2 Gerichtsstand</strong><br />
                Ausschliesslicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist, soweit gesetzlich zulässig, Seengen AG, Schweiz.
              </p>
              <p className="mt-2">
                <strong>11.3 Salvatorische Klausel</strong><br />
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
              </p>
              <p className="mt-2">
                <strong>11.4 Änderungsvorbehalt</strong><br />
                Der Anbieter behält sich das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden dem Kunden per E-Mail mitgeteilt und gelten als genehmigt, wenn der Kunde nicht innerhalb von 30 Tagen nach Mitteilung widerspricht.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">12. Online-Streitbeilegung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
                <a href="https://ec.europa.eu/consumers/odr" className="text-wine hover:underline" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>
              </p>
              <p className="mt-2">
                Der Anbieter ist nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-accent-burgundy/10 rounded-lg">
              <p className="text-xs md:text-sm">
                <strong>Stand:</strong> Januar 2025<br />
                <strong>Version:</strong> 2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
