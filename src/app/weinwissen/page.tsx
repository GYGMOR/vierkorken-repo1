'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { EditableImage } from '@/components/admin/EditableImage';
import { EditableText } from '@/components/admin/EditableText';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export default async function WeinwissenPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    let isAdmin = false;

    if (user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });
        if (dbUser && dbUser.role === 'ADMIN') {
            isAdmin = true;
        }
    }

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-accent-burgundy/10 border-b border-taupe-light overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <EditableImage
                        settingKey="weinwissen_page_header_image"
                        defaultSrc="/images/layout/weingläser.jpg"
                        alt="Weinwissen Hintergrund"
                        fill
                        className="object-cover opacity-15"
                        priority
                        isAdmin={isAdmin}
                    />
                </div>

                <div className="container-custom py-16 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <BackButton href="/" className="mb-4" />
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 backdrop-blur-sm">
                            <span className="text-accent-burgundy font-medium text-sm">WEINWISSEN</span>
                        </div>
                        <h1 className="text-display font-serif font-light text-graphite-dark">
                            Wein verstehen & geniessen
                        </h1>
                        <p className="text-body-lg text-graphite">
                            Tauchen Sie ein in die faszinierende Welt des Weins. Von der Traube bis ins Glas –
                            entdecken Sie das Wissen, das jeden Schluck zu einem besonderen Erlebnis macht.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container-custom py-12 space-y-16">
                {/* Introduction */}
                <section className="max-w-4xl mx-auto">
                    <p className="text-body-lg text-graphite leading-relaxed">
                        Wein ist mehr als nur ein Getränk – er ist Kultur, Geschichte und Handwerk.
                        Ob Sie gerade erst beginnen, sich für Wein zu interessieren, oder bereits ein
                        erfahrener Geniesser sind: Hier finden Sie wertvolles Wissen rund um Rebsorten,
                        Verkostung, Lagerung und die perfekte Kombination von Wein und Speisen.
                    </p>
                </section>

                {/* Knowledge Cards */}
                <section className="grid md:grid-cols-2 gap-8">
                    <Card className="hover:shadow-strong transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                                <GrapeIcon className="w-6 h-6 text-accent-burgundy" />
                            </div>
                            <CardTitle>Rebsorten</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body-sm text-graphite mb-4">
                                Von Pinot Noir bis Chardonnay – lernen Sie die wichtigsten Rebsorten kennen
                                und verstehen Sie ihre einzigartigen Charakteristiken.
                            </p>
                            <ul className="space-y-2 text-body-sm text-graphite/80">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Rotwein-Rebsorten: Pinot Noir, Merlot, Cabernet Sauvignon</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Weisswein-Rebsorten: Chardonnay, Sauvignon Blanc, Riesling</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Schweizer Spezialitäten: Chasselas, Petite Arvine</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-strong transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                                <NoseIcon className="w-6 h-6 text-accent-burgundy" />
                            </div>
                            <CardTitle>Verkostung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body-sm text-graphite mb-4">
                                Die Kunst der Weinverkostung: Sehen, Riechen, Schmecken –
                                entdecken Sie, wie Sie Wein mit allen Sinnen geniessen.
                            </p>
                            <ul className="space-y-2 text-body-sm text-graphite/80">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Die richtige Temperatur für jeden Weintyp</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Aromen erkennen und beschreiben</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Die Bedeutung von Struktur und Balance</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-strong transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                                <StorageIcon className="w-6 h-6 text-accent-burgundy" />
                            </div>
                            <CardTitle>Lagerung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body-sm text-graphite mb-4">
                                Bewahren Sie Ihre Weine optimal auf und lassen Sie sie reifen –
                                die richtige Lagerung macht den Unterschied.
                            </p>
                            <ul className="space-y-2 text-body-sm text-graphite/80">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Ideale Temperatur: 10-15°C konstant</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Luftfeuchtigkeit und Lichtschutz</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Liegende Lagerung für Korkverschlüsse</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-strong transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                                <FoodIcon className="w-6 h-6 text-accent-burgundy" />
                            </div>
                            <CardTitle>Food Pairing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body-sm text-graphite mb-4">
                                Die perfekte Harmonie: Entdecken Sie, welcher Wein zu welchem Gericht passt
                                und warum.
                            </p>
                            <ul className="space-y-2 text-body-sm text-graphite/80">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Rotwein zu Fleisch und kräftigen Gerichten</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Weisswein zu Fisch und leichten Speisen</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-burgundy mt-1">•</span>
                                    <span>Süsswein und Käse – eine klassische Kombination</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA Section */}
                <section className="max-w-3xl mx-auto text-center">
                    <Card className="p-12 bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
                        <h2 className="text-h2 font-serif font-light text-wine-dark mb-4">
                            Vertiefen Sie Ihr Wissen
                        </h2>
                        <p className="text-body-lg text-graphite mb-8">
                            Besuchen Sie unsere Verkostungen und Masterclasses, um Ihr Weinwissen
                            praktisch zu erweitern und neue Favoriten zu entdecken.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/events">
                                <Button size="lg">
                                    Zu den Events
                                </Button>
                            </Link>
                            <Link href="/weine">
                                <Button size="lg" variant="secondary">
                                    Weine entdecken
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </section>
            </div>
        </MainLayout>
    );
}

// Icons
function GrapeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="16" cy="12" r="1.5" />
            <circle cx="12" cy="16" r="1.5" />
        </svg>
    );
}

function NoseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

function StorageIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    );
}

function FoodIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}
