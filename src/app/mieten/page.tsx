import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';
import { ContactForm } from '../kontakt/ContactForm'; // Reuse the standalone contact form

export const metadata = {
    title: 'Mieten | VIER KORKEN Weinboutique',
    description: 'Mieten Sie unsere Weinboutique für Ihr nächstes privates oder geschäftliches Event in Seengen.',
};

export default function MietenPage() {
    return (
        <MainLayout>
            <div className="bg-gradient-to-b from-warmwhite to-white min-h-screen">
                {/* Hero Section */}
                <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-graphite-dark">
                        <Image
                            src="/images/layout/wein_regal_nah.jpg"
                            alt="Mieten Background"
                            fill
                            className="object-cover opacity-30"
                            priority
                        />
                    </div>
                    <div className="relative z-10 text-center text-white px-4 max-w-3xl">
                        <h1 className="text-display font-serif font-light mb-6">Location Mieten</h1>
                        <p className="text-body-lg text-white/90">
                            Der ideale Raum für Ihre Ideen. Mieten Sie unsere inspirierende Weinboutique für Seminare, Meetings oder kleine Feiern.
                        </p>
                    </div>
                </section>

                <div className="container-custom py-16">

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h2 className="text-h2 font-serif text-graphite-dark mb-6">Ihre Location in Seengen</h2>
                            <p className="text-graphite text-lg mb-6 leading-relaxed">
                                Unsere stilvoll eingerichtete Weinboutique bietet das perfekte Ambiente für ungestörte Meetings, kreative Workshops oder exklusive Präsentationen. Umgeben von edlen Tropfen entsteht eine entspannte und produktive Atmosphäre.
                            </p>

                            <h3 className="text-h4 font-serif text-graphite-dark mb-4 mt-8">Ausstattung & Vorteile</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-graphite">Zentral gelegener Raum in Seengen mit stilvollem Ambiente</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-graphite">Schnelles WLAN & moderne Präsentationstechnik (auf Anfrage)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-graphite">Catering-Optionen & individuelle Weinbegleitung möglich</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-accent-burgundy flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-graphite">Ideal für Gruppen bis zu 20 Personen</span>
                                </li>
                            </ul>

                            <div className="mt-8 bg-rose-light/20 p-6 rounded-xl border border-taupe-light/30">
                                <p className="text-graphite-dark font-medium">Preise & Konditionen:</p>
                                <p className="text-graphite text-sm mt-2">
                                    Gerne erstellen wir Ihnen ein individuelles Angebot basierend auf Ihren Anforderungen (Dauer, Teilnehmerzahl, Catering).
                                </p>
                            </div>
                        </div>

                        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-strong">
                            <Image
                                src="/images/layout/Laden_Sessel.jpeg"
                                alt="Vier Korken Boutique"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 border-[6px] border-white/20 rounded-2xl pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-h2 font-serif text-graphite-dark">Mietanfrage senden</h2>
                            <p className="text-graphite mt-2">Bitte teilen Sie uns den geplanten Termin und Ihre Wünsche mit.</p>
                        </div>

                        {/* Using the standard ContactForm which works perfectly for this */}
                        <div className="bg-white rounded-2xl shadow-medium overflow-hidden border border-taupe-light/30">
                            <ContactForm />
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
