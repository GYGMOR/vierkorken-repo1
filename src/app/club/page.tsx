import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Card, CardContent } from '@/components/ui/Card';
import { LoyaltyProgress } from '@/components/loyalty/LoyaltyProgress';
import { BadgeDisplay } from '@/components/loyalty/BadgeDisplay';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { PointsGrid } from '@/components/loyalty/PointsGrid';
import { LevelsGrid } from '@/components/loyalty/LevelsGrid';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function LoyaltyClubPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Use session user or fallback to mock if no session (but fetch real levels)
  // Ideally, we fetch the REAL user data from DB if session exists to get latest points
  let userData = {
    loyaltyPoints: 0,
    loyaltyLevel: 1,
    badges: [],
    isAdmin: false
  };

  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { badges: { include: { badge: true } } }
    });
    if (dbUser) {
      userData = {
        loyaltyPoints: dbUser.loyaltyPoints,
        loyaltyLevel: dbUser.loyaltyLevel,
        badges: dbUser.badges.map(b => ({
          ...b.badge,
          earnedAt: b.earnedAt,
        })) as any,
        isAdmin: dbUser.role === 'ADMIN'
      };
    }
  }

  // Fetch Levels and Rules from DB
  const [dbLevels, dbRules] = await Promise.all([
    prisma.loyaltyLevel.findMany({ orderBy: { level: 'asc' } }),
    prisma.loyaltyProgramRule.findMany({ orderBy: { updatedAt: 'asc' } }) // Or another order
  ]);

  // If no rules exist (first run before migration seed), fallback to empty or ensure seed ran.
  // We assume seed ran.

  return (
    <MainLayout>
      {/* Hero mit Weingläser-Bild (gleiche Größe wie Events) */}
      <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-accent-gold/10 border-b border-taupe-light overflow-hidden">
        {/* Hintergrundbild - transparent */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/layout/weingläser.jpg"
            alt="Weingläser Hintergrund"
            fill
            className="object-cover opacity-15"
            quality={90}
            priority
          />
        </div>

        {/* Content - über dem Bild */}
        <div className="container-custom py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BackButton href="/" className="mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/20 rounded-full border border-accent-gold/30 backdrop-blur-sm">
              <span className="text-accent-burgundy font-medium text-sm">LOYALTY CLUB</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-graphite-dark">
              Ihr Vierkorken Club
            </h1>
            <p className="text-lg text-graphite max-w-2xl mx-auto">
              Sammeln Sie Punkte mit jedem Einkauf und genießen Sie exklusive Vorteile
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12 space-y-16 bg-gradient-to-b from-warmwhite to-warmwhite-light">
        {/* User Progress */}
        <section>
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 border-2 border-taupe-light shadow-lg">
              <LoyaltyProgress
                currentPoints={userData.loyaltyPoints}
                currentLevel={userData.loyaltyLevel}
              />

              <div className="mt-8 pt-6 border-t border-taupe-light">
                <h3 className="font-serif text-h4 text-graphite-dark mb-4">
                  Punkte sammeln
                </h3>

                {/* Interactive Points Grid */}
                <PointsGrid rules={dbRules} isAdmin={userData.isAdmin} />

              </div>
            </Card>
          </div>
        </section>

        {/* All Levels */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-h2 font-serif font-light text-graphite-dark mb-4">
              Die 7 Level
            </h2>
            <p className="text-body-lg text-graphite">
              Steigen Sie auf und profitieren Sie von immer besseren Vorteilen
            </p>
          </div>

          {/* Interactive Levels Grid */}
          <LevelsGrid
            levels={dbLevels}
            currentLevel={userData.loyaltyLevel}
            isAdmin={userData.isAdmin}
          />
        </section>

        {/* Badges */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-h2 font-serif font-light text-graphite-dark mb-4">
              Ihre Badges
            </h2>
            <p className="text-body-lg text-graphite">
              Sammeln Sie stilvolle Badges durch Käufe und besondere Aktionen
            </p>
          </div>

          <BadgeDisplay badges={userData.badges} />
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite border-2 border-taupe-light shadow-lg">
            <h2 className="text-h2 font-serif font-light text-graphite-dark mb-4">
              Bereit zu starten?
            </h2>
            <p className="text-body-lg text-graphite mb-8">
              Erstellen Sie jetzt ein Konto und beginnen Sie Punkte zu sammeln
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/registrieren">
                <Button size="lg">Jetzt registrieren</Button>
              </Link>
              <Link href="/weine">
                <Button variant="secondary" size="lg">
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
function PointsCard({ iconType, label, points }: { iconType: string; label: string; points: string }) {
  const icons: Record<string, React.ReactNode> = {
    cart: <CartIcon />,
    review: <ReviewIcon />,
    event: <EventIcon />,
    referral: <ReferralIcon />,
  };

  return (
    <div className="p-4 bg-warmwhite-light rounded-lg border-2 border-taupe-light shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-light text-graphite-dark">
          {icons[iconType]}
        </div>
        <div>
          <p className="text-body-sm text-graphite/60">{label}</p>
          <p className="font-medium text-graphite-dark">{points}</p>
        </div>
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function ReferralIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
