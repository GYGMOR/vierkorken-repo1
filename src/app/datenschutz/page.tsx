import { MainLayout } from '@/components/layout/MainLayout';

export default function DatenschutzPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-warmwhite">
        <div className="container-custom max-w-4xl px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl lg:text-display font-serif font-light text-graphite-dark mb-6 md:mb-8">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-sm md:prose-lg max-w-none space-y-6 text-graphite">
            {/* Introduction */}
            <section>
              <div className="bg-wine/10 p-4 md:p-6 rounded-lg mb-4">
                <p className="font-semibold text-lg">
                  Ihre Privatsphäre ist uns wichtig
                </p>
                <p className="mt-2 text-sm">
                  Diese Datenschutzerklärung informiert Sie über die Verarbeitung personenbezogener Daten bei der Nutzung unserer Website und unseres Online-Shops. Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln Ihre Daten vertraulich sowie entsprechend den gesetzlichen Datenschutzvorschriften.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung im Sinne des Schweizerischen Datenschutzgesetzes (DSG) und der Datenschutz-Grundverordnung (DSGVO) ist:
              </p>
              <div className="bg-rose-light/30 p-4 md:p-6 rounded-lg mt-2">
                <p className="font-semibold">VIER KORKEN</p>
                <p>Christina Hediger</p>
                <p>Steinbrunnengasse 3A</p>
                <p>5707 Seengen AG</p>
                <p>Schweiz</p>
                <p className="mt-2">E-Mail: info@vierkorken.ch</p>
                <p>Website: www.vierkorken.ch</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">2. Geltungsbereich und Rechtsgrundlagen</h2>
              <p>
                Diese Datenschutzerklärung gilt für alle Datenverarbeitungen im Rahmen unserer Website und unseres Online-Shops.
              </p>
              <p className="mt-2">
                <strong>2.1 Rechtsgrundlagen</strong><br />
                Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO / Art. 13 DSG:</strong> Vertragserfüllung und vorvertragliche Massnahmen (z.B. Bestellabwicklung, Kundenkonto-Verwaltung)</li>
                <li><strong>Art. 6 Abs. 1 lit. c DSGVO / Art. 13 DSG:</strong> Erfüllung gesetzlicher Verpflichtungen (z.B. Aufbewahrungspflichten, Altersverifikation)</li>
                <li><strong>Art. 6 Abs. 1 lit. a DSGVO / Art. 13 DSG:</strong> Einwilligung (z.B. Newsletter, Marketing-Cookies)</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO / Art. 13 DSG:</strong> Berechtigte Interessen (z.B. Webseitenanalyse, Betrugsprävention, IT-Sicherheit)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">3. Erhebung und Speicherung personenbezogener Daten</h2>
              <p>
                <strong>3.1 Beim Besuch unserer Website</strong><br />
                Bei jedem Zugriff auf unsere Website werden automatisch folgende Daten erhoben:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>IP-Adresse des zugreifenden Rechners</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Name und URL der abgerufenen Datei</li>
                <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners</li>
                <li>Name Ihres Access-Providers</li>
              </ul>
              <p className="mt-2">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO / Art. 13 DSG (berechtigtes Interesse an der Funktionsfähigkeit und Sicherheit der Website)<br />
                <strong>Speicherdauer:</strong> 30 Tage in Server-Logfiles
              </p>

              <p className="mt-4">
                <strong>3.2 Bei Erstellung eines Kundenkontos</strong><br />
                Bei der Registrierung für ein Kundenkonto erheben wir:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Anrede, Vor- und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
                <li>Telefonnummer (optional)</li>
                <li>Registrierungsdatum</li>
                <li>Loyalty Club Daten (Punkte, Level, Badges)</li>
              </ul>
              <p className="mt-2">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO / Art. 13 DSG (Vertragserfüllung)<br />
                <strong>Speicherdauer:</strong> Bis zur Löschung des Kundenkontos oder nach 3 Jahren Inaktivität
              </p>

              <p className="mt-4">
                <strong>3.3 Bei Bestellungen</strong><br />
                Für die Abwicklung Ihrer Bestellung erheben wir:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Vor- und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Lieferadresse (Strasse, Hausnummer, PLZ, Ort, Land)</li>
                <li>Rechnungsadresse (falls abweichend)</li>
                <li>Telefonnummer</li>
                <li>Bestellte Produkte und Mengen</li>
                <li>Zahlungsinformationen (über Stripe verarbeitet, siehe Abschnitt 6)</li>
                <li>Bestellhistorie und -status</li>
              </ul>
              <p className="mt-2">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO / Art. 13 DSG (Vertragserfüllung)<br />
                <strong>Speicherdauer:</strong> 10 Jahre (gesetzliche Aufbewahrungspflichten gemäss Obligationenrecht)
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">4. Altersverifikation mittels Stripe Identity</h2>
              <div className="bg-accent-burgundy/10 p-4 md:p-6 rounded-lg">
                <p className="font-semibold text-accent-burgundy">
                  Besondere Kategorie: Identitätsdokumente und biometrische Daten
                </p>
                <p className="mt-2">
                  <strong>4.1 Zweck und Rechtsgrundlage</strong><br />
                  Zur Einhaltung der gesetzlichen Verpflichtungen gemäss Art. 11 Abs. 2 Lebensmittelgesetz (LMG) müssen wir vor dem Verkauf alkoholischer Getränke das Alter unserer Kunden verifizieren. Die Verarbeitung erfolgt auf Grundlage von:
                </p>
                <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2 text-sm">
                  <li><strong>Art. 6 Abs. 1 lit. c DSGVO / Art. 13 DSG:</strong> Erfüllung rechtlicher Verpflichtungen</li>
                  <li><strong>Art. 9 Abs. 2 lit. g DSGVO:</strong> Verarbeitung aus Gründen eines erheblichen öffentlichen Interesses (Jugendschutz)</li>
                </ul>

                <p className="mt-3">
                  <strong>4.2 Verwendeter Dienstleister</strong><br />
                  Die Identitätsverifizierung wird durch <strong>Stripe Identity</strong> (Stripe, Inc., 510 Townsend Street, San Francisco, CA 94103, USA) durchgeführt. Stripe Identity ist ein zertifizierter Dienst zur automatisierten Identitätsprüfung.
                </p>

                <p className="mt-3">
                  <strong>4.3 Verarbeitete Daten</strong><br />
                  Im Rahmen der Verifizierung werden folgende Daten verarbeitet:
                </p>
                <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2 text-sm">
                  <li>Scans/Fotos Ihres Identitätsdokuments (Pass, Personalausweis oder Führerausweis)</li>
                  <li>Daten aus dem Identitätsdokument: Name, Geburtsdatum, Dokumentennummer</li>
                  <li>Live-Selfie (biometrisches Foto zur Identitätsprüfung)</li>
                  <li>Metadaten: Zeitstempel, Geräteinformationen, IP-Adresse</li>
                </ul>

                <p className="mt-3">
                  <strong>4.4 Verarbeitungsablauf</strong>
                </p>
                <ol className="list-decimal pl-4 md:pl-6 space-y-1 mt-2 text-sm">
                  <li>Weiterleitung zu Stripe Identity während des Checkout-Prozesses</li>
                  <li>Upload des Identitätsdokuments durch den Kunden</li>
                  <li>Aufnahme eines Live-Selfies</li>
                  <li>Automatisierte Prüfung durch Stripe Identity (Dokumentenechtheit, Gesichtsabgleich, Altersberechnung)</li>
                  <li>Übermittlung des Verifizierungsergebnisses (verifiziert/nicht verifiziert) an VIER KORKEN</li>
                  <li>Speicherung des Verifizierungsstatus in unserem System</li>
                </ol>

                <p className="mt-3">
                  <strong>4.5 Datentransfer in die USA</strong><br />
                  Stripe Identity hat seinen Sitz in den USA. Die Übermittlung personenbezogener Daten in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Stripe, Inc. hat sich zudem den EU-U.S. Data Privacy Framework Principles verpflichtet.
                </p>

                <p className="mt-3">
                  <strong>4.6 Speicherdauer</strong>
                </p>
                <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2 text-sm">
                  <li><strong>Bei VIER KORKEN:</strong> Der Verifizierungsstatus (verifiziert: ja/nein) und die Stripe Verification Session ID werden dauerhaft im Kundenkonto gespeichert. Ihre Identitätsdokumente und Selfies werden von uns nicht gespeichert.</li>
                  <li><strong>Bei Stripe Identity:</strong> Stripe speichert die Verifizierungsdaten gemäss ihrer Aufbewahrungsrichtlinien (in der Regel 7 Jahre für Compliance-Zwecke). Details finden Sie in der Datenschutzerklärung von Stripe: <a href="https://stripe.com/ch/privacy" className="text-wine hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/ch/privacy</a></li>
                </ul>

                <p className="mt-3">
                  <strong>4.7 Ihre Rechte</strong><br />
                  Sie haben das Recht, Auskunft über die bei Stripe gespeicherten Daten zu verlangen und deren Löschung zu beantragen. Kontaktieren Sie Stripe dazu direkt unter: <a href="https://support.stripe.com" className="text-wine hover:underline" target="_blank" rel="noopener noreferrer">support.stripe.com</a>
                </p>

                <p className="mt-3">
                  <strong>4.8 Notwendigkeit der Verifizierung</strong><br />
                  Die Durchführung der Altersverifikation ist eine zwingende Voraussetzung für den Kauf alkoholischer Getränke. Ohne erfolgreiche Verifizierung kann kein Kaufvertrag geschlossen werden. Dies dient dem Schutz Minderjähriger und der Erfüllung unserer gesetzlichen Pflichten.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">5. Zahlungsabwicklung mittels Stripe Payments</h2>
              <p>
                <strong>5.1 Verwendeter Zahlungsdienstleister</strong><br />
                Für die Abwicklung von Zahlungen nutzen wir den Dienstleister <strong>Stripe Payments</strong> (Stripe, Inc., 510 Townsend Street, San Francisco, CA 94103, USA).
              </p>
              <p className="mt-2">
                <strong>5.2 Verarbeitete Daten</strong><br />
                Bei Zahlung über Stripe werden folgende Daten an Stripe übermittelt:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li>Name und E-Mail-Adresse</li>
                <li>Rechnungsbetrag und Währung</li>
                <li>Bestellnummer</li>
                <li>Zahlungsinformationen (Kreditkartendaten, TWINT, etc.)</li>
              </ul>
              <p className="mt-2">
                <strong>Wichtig:</strong> VIER KORKEN erhält keine Kreditkartendaten. Diese werden ausschliesslich von Stripe verarbeitet und gespeichert.
              </p>
              <p className="mt-2">
                <strong>5.3 Rechtsgrundlage</strong><br />
                Art. 6 Abs. 1 lit. b DSGVO / Art. 13 DSG (Vertragserfüllung)
              </p>
              <p className="mt-2">
                <strong>5.4 Datentransfer in die USA</strong><br />
                Die Übermittlung erfolgt auf Grundlage der EU-Standardvertragsklauseln. Stripe ist zudem nach dem EU-U.S. Data Privacy Framework zertifiziert.
              </p>
              <p className="mt-2">
                <strong>5.5 Weitere Informationen</strong><br />
                Datenschutzerklärung von Stripe: <a href="https://stripe.com/ch/privacy" className="text-wine hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/ch/privacy</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">6. Cookies und ähnliche Technologien</h2>
              <p>
                <strong>6.1 Was sind Cookies?</strong><br />
                Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Sie ermöglichen es, bestimmte Informationen über einen Zeitraum hinweg zu speichern.
              </p>
              <p className="mt-2">
                <strong>6.2 Kategorien von Cookies</strong>
              </p>

              <div className="mt-3 space-y-3">
                <div className="border-l-4 border-wine pl-4">
                  <p className="font-semibold">Notwendige Cookies (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO)</p>
                  <p className="text-sm mt-1">Diese Cookies sind für die Grundfunktionen der Website erforderlich:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-sm">
                    <li><strong>Session-Cookie:</strong> Speichert Ihre Sitzung (ID) für die Dauer Ihres Besuchs</li>
                    <li><strong>Warenkorb-Cookie:</strong> Speichert die Produkte in Ihrem Warenkorb</li>
                    <li><strong>Login-Cookie:</strong> Speichert Ihren Login-Status bei registrierten Konten</li>
                    <li><strong>Cookie-Consent-Cookie:</strong> Speichert Ihre Cookie-Einstellungen</li>
                  </ul>
                  <p className="text-sm mt-1"><strong>Speicherdauer:</strong> Session oder bis zu 30 Tage</p>
                </div>

                <div className="border-l-4 border-taupe pl-4">
                  <p className="font-semibold">Analyse-Cookies (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO - Einwilligung)</p>
                  <p className="text-sm mt-1">Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-sm">
                    <li>Besucherzahlen und Seitenaufrufe</li>
                    <li>Verweildauer auf Seiten</li>
                    <li>Klickverhalten und Navigation</li>
                    <li>Geräte- und Browserinformationen</li>
                  </ul>
                  <p className="text-sm mt-1"><strong>Speicherdauer:</strong> Bis zu 24 Monate</p>
                </div>

                <div className="border-l-4 border-rose-light pl-4">
                  <p className="font-semibold">Marketing-Cookies (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO - Einwilligung)</p>
                  <p className="text-sm mt-1">Diese Cookies werden verwendet, um Ihnen relevante Werbung und Angebote zu zeigen:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-sm">
                    <li>Remarketing und Personalisierung</li>
                    <li>Conversion-Tracking</li>
                    <li>Zielgruppenbildung</li>
                  </ul>
                  <p className="text-sm mt-1"><strong>Speicherdauer:</strong> Bis zu 24 Monate</p>
                </div>
              </div>

              <p className="mt-3">
                <strong>6.3 Ihre Wahlmöglichkeiten</strong><br />
                Sie können Ihre Cookie-Einstellungen jederzeit über den Cookie-Banner am unteren Bildschirmrand anpassen. Zudem können Sie Cookies in Ihren Browser-Einstellungen deaktivieren:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2 text-sm">
                <li><strong>Chrome:</strong> Einstellungen → Datenschutz und Sicherheit → Cookies</li>
                <li><strong>Firefox:</strong> Einstellungen → Datenschutz & Sicherheit → Cookies</li>
                <li><strong>Safari:</strong> Einstellungen → Datenschutz → Cookies blockieren</li>
              </ul>
              <p className="mt-2 text-sm">
                <strong>Hinweis:</strong> Die vollständige Deaktivierung von Cookies kann die Funktionalität unserer Website einschränken.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">7. Newsletter</h2>
              <p>
                <strong>7.1 Newsletteranmeldung</strong><br />
                Mit Ihrer Einwilligung senden wir Ihnen regelmässig unseren Newsletter mit Informationen zu:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2">
                <li>Neuen Weinen und Produkten</li>
                <li>Exklusiven Angeboten und Rabattaktionen</li>
                <li>Events und Tastings</li>
                <li>Tipps und Neuigkeiten rund um Wein</li>
              </ul>
              <p className="mt-2">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO / Art. 13 DSG (Einwilligung)
              </p>
              <p className="mt-2">
                <strong>7.2 Versanddienstleister</strong><br />
                Der Newsletter-Versand erfolgt über unsere eigene Infrastruktur. Ihre E-Mail-Adresse und Ihr Name werden ausschliesslich für den Newsletter-Versand verwendet.
              </p>
              <p className="mt-2">
                <strong>7.3 Abmeldung</strong><br />
                Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie auf den Abmeldelink in jeder Newsletter-E-Mail klicken oder uns eine E-Mail an info@vierkorken.ch senden.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">8. Loyalty Club und Gamification</h2>
              <p>
                <strong>8.1 Loyalty-Punkte und Levels</strong><br />
                Registrierte Kunden sammeln automatisch Loyalty-Punkte bei Käufen und können durch Aktivitäten höhere Levels und Badges erreichen. Wir verarbeiten dabei:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-1 mt-2">
                <li>Punktestand und Transaktionshistorie</li>
                <li>Loyalty-Level und erreichte Badges</li>
                <li>Event-Teilnahmen</li>
                <li>Kaufverhalten (für personalisierte Empfehlungen)</li>
              </ul>
              <p className="mt-2">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO / Art. 13 DSG (Vertragserfüllung)<br />
                <strong>Speicherdauer:</strong> Bis zur Löschung des Kundenkontos
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">9. Weitergabe von Daten an Dritte</h2>
              <p>
                Wir geben Ihre personenbezogenen Daten nur in folgenden Fällen an Dritte weiter:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li><strong>Versanddienstleister:</strong> Zur Lieferung Ihrer Bestellung (Name, Adresse)</li>
                <li><strong>Stripe (USA):</strong> Zahlungsabwicklung und Identitätsverifizierung (siehe Abschnitte 4 und 5)</li>
                <li><strong>E-Mail-Dienstleister:</strong> Versand von Bestellbestätigungen und Newsletter</li>
                <li><strong>IT-Dienstleister:</strong> Hosting und technischer Support unserer Systeme</li>
              </ul>
              <p className="mt-2">
                Alle Dienstleister sind vertraglich verpflichtet, Ihre Daten vertraulich zu behandeln und ausschliesslich für die vereinbarten Zwecke zu verwenden.
              </p>
              <p className="mt-2">
                <strong>Keine Weitergabe zu Werbezwecken:</strong> Wir verkaufen oder vermieten Ihre Daten niemals an Dritte zu Werbezwecken.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">10. Datenübermittlung in Drittländer</h2>
              <p>
                Einige unserer Dienstleister haben ihren Sitz ausserhalb der Schweiz oder der EU (insbesondere Stripe in den USA). Wir stellen sicher, dass diese Übermittlungen rechtmässig erfolgen durch:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li><strong>EU-Standardvertragsklauseln:</strong> Rechtsverbindliche Vereinbarungen, die ein angemessenes Schutzniveau gewährleisten</li>
                <li><strong>EU-U.S. Data Privacy Framework:</strong> Zertifizierung von US-Unternehmen (z.B. Stripe)</li>
                <li><strong>Angemessenheitsbeschluss:</strong> Für Länder, denen die EU-Kommission ein angemessenes Datenschutzniveau bescheinigt hat</li>
              </ul>
              <p className="mt-2">
                Weitere Informationen erhalten Sie auf Anfrage unter info@vierkorken.ch
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">11. Ihre Rechte als betroffene Person</h2>
              <p>
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>

              <div className="mt-3 space-y-3">
                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">📋 Recht auf Auskunft (Art. 15 DSGVO / Art. 25 DSG)</p>
                  <p className="text-sm mt-1">Sie haben das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu erhalten.</p>
                </div>

                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">✏️ Recht auf Berichtigung (Art. 16 DSGVO / Art. 32 DSG)</p>
                  <p className="text-sm mt-1">Sie können die Berichtigung unrichtiger Daten verlangen.</p>
                </div>

                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">🗑️ Recht auf Löschung (Art. 17 DSGVO / Art. 32 DSG)</p>
                  <p className="text-sm mt-1">Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
                </div>

                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">🔒 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO / Art. 32 DSG)</p>
                  <p className="text-sm mt-1">Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen.</p>
                </div>

                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">📤 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</p>
                  <p className="text-sm mt-1">Sie können Ihre Daten in einem strukturierten, maschinenlesbaren Format erhalten.</p>
                </div>

                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">⛔ Widerspruchsrecht (Art. 21 DSGVO / Art. 30 DSG)</p>
                  <p className="text-sm mt-1">Sie können der Verarbeitung Ihrer Daten aus Gründen Ihrer besonderen Situation widersprechen.</p>
                </div>

                <div className="bg-warmwhite-light p-3 rounded-lg">
                  <p className="font-semibold">🔄 Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</p>
                  <p className="text-sm mt-1">Sie können eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.</p>
                </div>
              </div>

              <p className="mt-4">
                <strong>Ausübung Ihrer Rechte:</strong><br />
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte per E-Mail an: <strong>info@vierkorken.ch</strong><br />
                Wir werden Ihre Anfrage innerhalb von 30 Tagen beantworten.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">12. Beschwerderecht bei einer Aufsichtsbehörde</h2>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
              <p className="mt-2">
                <strong>Zuständige Aufsichtsbehörde in der Schweiz:</strong>
              </p>
              <div className="bg-rose-light/30 p-4 md:p-6 rounded-lg mt-2">
                <p className="font-semibold">Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)</p>
                <p>Feldeggweg 1</p>
                <p>3003 Bern</p>
                <p>Schweiz</p>
                <p className="mt-2">Telefon: +41 58 462 43 95</p>
                <p>E-Mail: info@edoeb.admin.ch</p>
                <p>Website: <a href="https://www.edoeb.admin.ch" className="text-wine hover:underline" target="_blank" rel="noopener noreferrer">www.edoeb.admin.ch</a></p>
              </div>
              <p className="mt-2">
                <strong>Für Personen in der EU:</strong><br />
                Sie können sich auch an die Datenschutzbehörde Ihres Wohnsitzlandes wenden.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">13. Datensicherheit</h2>
              <p>
                Wir setzen umfangreiche technische und organisatorische Sicherheitsmassnahmen ein, um Ihre Daten zu schützen:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li><strong>SSL/TLS-Verschlüsselung:</strong> Alle Datenübertragungen zwischen Ihrem Browser und unserer Website sind verschlüsselt (erkennbar am Schloss-Symbol in der Browserzeile)</li>
                <li><strong>Passwort-Verschlüsselung:</strong> Passwörter werden mit modernen Hash-Verfahren (bcrypt) gespeichert</li>
                <li><strong>Zugriffskontrolle:</strong> Nur autorisierte Mitarbeiter haben Zugriff auf personenbezogene Daten</li>
                <li><strong>Regelmässige Backups:</strong> Tägliche Sicherung aller Daten auf geografisch getrennten Servern</li>
                <li><strong>Firewall und Intrusion Detection:</strong> Schutz vor unbefugtem Zugriff und Angriffen</li>
                <li><strong>Regelmässige Updates:</strong> Alle Systeme werden zeitnah mit Sicherheitsupdates versehen</li>
              </ul>
              <p className="mt-2">
                Trotz aller Sicherheitsmassnahmen kann keine Datenübertragung über das Internet zu 100% sicher garantiert werden. Wir empfehlen Ihnen, auch selbst Sicherheitsvorkehrungen zu treffen (z.B. sichere Passwörter verwenden).
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">14. Speicherdauer und Löschung</h2>
              <p>
                Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen:
              </p>
              <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                <li><strong>Kundenkonto:</strong> Bis zur Löschung des Kontos oder nach 3 Jahren Inaktivität</li>
                <li><strong>Bestelldaten:</strong> 10 Jahre (Aufbewahrungspflicht gemäss OR)</li>
                <li><strong>Rechnungen:</strong> 10 Jahre (Aufbewahrungspflicht)</li>
                <li><strong>Newsletter-Daten:</strong> Bis zur Abmeldung</li>
                <li><strong>Cookies:</strong> Maximal 24 Monate (abhängig vom Cookie-Typ)</li>
                <li><strong>Server-Logs:</strong> 30 Tage</li>
                <li><strong>Altersverifizierung:</strong> Verifizierungsstatus dauerhaft, Dokumente bei Stripe gemäss deren Richtlinien</li>
              </ul>
              <p className="mt-2">
                Nach Ablauf der Speicherfristen werden die Daten gelöscht, sofern keine anderen rechtlichen Gründe einer Löschung entgegenstehen.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">15. Änderungen dieser Datenschutzerklärung</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen unserer Dienstleistungen sowie der Datenverarbeitung anzupassen.
              </p>
              <p className="mt-2">
                Bei wesentlichen Änderungen werden wir Sie per E-Mail informieren oder durch einen deutlichen Hinweis auf unserer Website aufmerksam machen.
              </p>
              <p className="mt-2">
                <strong>Empfehlung:</strong> Besuchen Sie diese Seite regelmässig, um über den aktuellen Stand der Datenschutzerklärung informiert zu bleiben.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl lg:text-h3 font-serif text-graphite-dark mb-3 md:mb-4">16. Kontakt</h2>
              <p>
                Bei Fragen zum Datenschutz, zur Ausübung Ihrer Rechte oder bei Beschwerden kontaktieren Sie uns bitte:
              </p>
              <div className="bg-rose-light/30 p-4 md:p-6 rounded-lg mt-2">
                <p className="font-semibold">VIER KORKEN - Datenschutz</p>
                <p>Joel Hediger</p>
                <p>Steinbrunnengasse 3A</p>
                <p>5707 Seengen AG</p>
                <p>Schweiz</p>
                <p className="mt-2">E-Mail: info@vierkorken.ch</p>
                <p>Betreff: Datenschutz</p>
              </div>
            </section>

            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-accent-burgundy/10 rounded-lg">
              <p className="text-xs md:text-sm">
                <strong>Stand:</strong> Januar 2025<br />
                <strong>Version:</strong> 2.0<br />
                <strong>Gilt für:</strong> Website www.vierkorken.ch und Online-Shop
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
