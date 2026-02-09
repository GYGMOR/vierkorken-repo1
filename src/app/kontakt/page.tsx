import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';
import { ContactForm } from './ContactForm';

export default function KontaktPage() {
  return (
    <MainLayout>
      <div className="section-padding bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-display font-serif font-light text-graphite-dark mb-4">
              Kontakt
            </h1>
            <p className="text-body-lg text-graphite max-w-2xl mx-auto">
              Wir freuen uns auf Ihre Nachricht. Besuchen Sie uns oder kontaktieren Sie uns telefonisch.
            </p>
          </div>

          {/* Geschäftsführerin Section */}
          <div className="card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Image */}
              <div className="flex-shrink-0">
                <Image
                  src="/images/layout/Inhaberin.png"
                  alt="Geschäftsführerin"
                  width={160}
                  height={160}
                  className="rounded-full object-cover border-4 border-accent-gold/20"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-h3 font-serif mb-2">Geschäftsführerin</h2>
                <p className="text-graphite mb-4">
                  Ihre Ansprechpartnerin für alle Fragen rund um VIER KORKEN.
                </p>
                <div className="space-y-2 text-graphite-dark">
                  <p><strong>Name:</strong> Christina Hediger</p>
                  <p><strong>E-Mail:</strong> info@vierkorken.ch</p>
                  <p><strong>Telefon:</strong> 062 390 04 04</p>
                </div>
              </div>
            </div>
          </div>

          {/* Standort & Öffnungszeiten */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Standort */}
            <div className="card p-6">
              <h3 className="text-h4 font-serif mb-4">Unser Standort</h3>
              <div className="space-y-2 text-graphite mb-4">
                <p className="font-semibold text-graphite-dark">VIER KORKEN</p>
                <p>Steinbrunnengasse 3A</p>
                <p>5707 Seengen</p>
                <p>Schweiz</p>
              </div>

              {/* Google Maps */}
              <div className="mt-4">
                <iframe
                  src="https://www.google.com/maps?q=Vier+Korken+Wein-Boutique,+Steinbrunnengasse+3a,+5707+Seengen&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vier Korken Wein-Boutique Standort"
                ></iframe>
              </div>
            </div>

            {/* Öffnungszeiten */}
            <div className="card p-6">
              <h3 className="text-h4 font-serif mb-4">Öffnungszeiten</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-taupe-light">
                  <span className="text-graphite">Montag & Dienstag</span>
                  <span className="font-semibold text-graphite-dark">Geschlossen</span>
                </div>
                <div className="flex justify-between py-2 border-b border-taupe-light">
                  <span className="text-graphite">Mittwoch</span>
                  <span className="font-semibold text-graphite-dark">13:30 – 18:30</span>
                </div>
                <div className="flex justify-between py-2 border-b border-taupe-light">
                  <span className="text-graphite">Donnerstag</span>
                  <span className="font-semibold text-graphite-dark">13:30 – 18:30</span>
                </div>
                <div className="flex justify-between py-2 border-b border-taupe-light">
                  <span className="text-graphite">Freitag</span>
                  <span className="font-semibold text-graphite-dark">09:00 – 12:00, 13:30 – 18:30</span>
                </div>
                <div className="flex justify-between py-2 border-b border-taupe-light">
                  <span className="text-graphite">Samstag</span>
                  <span className="font-semibold text-graphite-dark">09:00 – 14:00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-graphite">Sonntag</span>
                  <span className="font-semibold text-graphite-dark">Geschlossen</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-rose-light/30 rounded-lg">
                <p className="text-sm text-graphite">
                  <strong>Hinweis:</strong> Während Events können die Öffnungszeiten abweichen.
                  Bitte kontaktieren Sie uns vorab.
                </p>
              </div>
            </div>
          </div>

          {/* Kontaktformular */}
          <ContactForm />
        </div>
      </div>
    </MainLayout>
  );
}
