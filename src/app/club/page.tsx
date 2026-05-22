import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { CustomerCard } from '@/components/loyalty/CustomerCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EditableText } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { SwipeableGiftCards } from '@/components/loyalty/SwipeableGiftCards';
import { MemberDealsSection } from '@/components/loyalty/MemberDealsSection';

export const dynamic = 'force-dynamic';

export default async function LoyaltyClubPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let userData = {
    id: 'GUEST-ID-0000',
    firstName: 'Max',
    lastName: 'Mustermann',
    loyaltyPoints: 0,
    badges: [] as any[],
    isAdmin: false
  };

  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (dbUser) {
      userData = {
        id: dbUser.id,
        firstName: dbUser.firstName || user.name?.split(' ')[0] || 'Kunde',
        lastName: dbUser.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        loyaltyPoints: dbUser.loyaltyPoints,
        badges: [],
        isAdmin: dbUser.role === 'ADMIN'
      };
    }
  }

  // Fetch all gifts, sorted by pointCost ascending
  const allGiftsRaw = await prisma.levelGift.findMany({
    orderBy: { pointCost: 'asc' },
  });

  // Fetch active member deals
  const memberDeals = await prisma.memberDeal.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  const allGifts = allGiftsRaw.map(gift => ({
    ...gift,
    pointsRequired: gift.pointCost,
  }));

  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-warmwhite via-rose-light to-accent-gold/10 border-b border-taupe-light overflow-hidden">
        <div className="absolute inset-0 z-0">
          <EditableImage
            settingKey="club_page_header_image"
            defaultSrc="/images/layout/weingläser.jpg"
            alt="Weingläser Hintergrund"
            fill
            className="object-cover opacity-15"
            priority
            isAdmin={userData.isAdmin}
          />
        </div>

        <div className="container-custom py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BackButton href="/" className="mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/20 rounded-full border border-accent-gold/30 backdrop-blur-sm">
              <span className="text-accent-burgundy font-medium text-sm">LOYALTY PROGRAMM</span>
            </div>
            <EditableText
              settingKey="club_page_header_title"
              defaultValue="Ihr Vierkorken Treueprogramm"
              isAdmin={userData.isAdmin}
              as="h1"
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-graphite-dark"
            />
            <EditableText
              settingKey="club_page_header_subtitle"
              defaultValue="Sammeln Sie Punkte mit jedem Einkauf und tauschen Sie diese gegen exklusive Geschenke ein."
              isAdmin={userData.isAdmin}
              as="p"
              className="text-lg text-graphite max-w-2xl mx-auto"
              multiline={true}
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-12 space-y-16 bg-gradient-to-b from-warmwhite to-warmwhite-light">

        {/* Customer Card Section */}
        <section>
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full flex justify-end mb-4 pr-4">
              <InfoTooltip />
            </div>

            {user ? (
              <CustomerCard
                firstName={userData.firstName}
                lastName={userData.lastName}
                userId={userData.id}
                loyaltyPoints={userData.loyaltyPoints}
              />
            ) : (
              <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-taupe-light max-w-md w-full">
                <h3 className="font-serif text-2xl text-graphite-dark mb-4">Digitale Kundenkarte</h3>
                <p className="text-graphite mb-6">Bitte melden Sie sich an, um Ihre persönliche Kundenkarte zu sehen und Punkte zu sammeln.</p>
                <Link href="/login">
                  <Button>Jetzt Anmelden</Button>
                </Link>
              </div>
            )}

            <p className="text-center mt-6 text-sm text-graphite/60 max-w-md">
              Scannen Sie Ihre Karte bei Ihrem nächsten Besuch im Geschäft, um automatisch Punkte gutgeschrieben zu bekommen.
            </p>
          </div>
        </section>

        {/* Rewards / Gifts — McDonald's-style swipeable cards */}
        <SwipeableGiftCards
          gifts={allGifts}
          userPoints={userData.loyaltyPoints}
          isLoggedIn={!!user}
          userId={userData.id}
        />

        {/* Member Deals */}
        <MemberDealsSection
          deals={memberDeals.map(d => ({
            ...d,
            originalPrice: Number(d.originalPrice),
            dealPrice: Number(d.dealPrice),
          }))}
          isLoggedIn={!!user}
        />

      </div>
    </MainLayout>
  );
}

function InfoTooltip() {
  return (
    <div className="relative group inline-block z-20">
      <div className="w-8 h-8 bg-warmwhite-dark rounded-full flex items-center justify-center text-graphite font-serif font-bold cursor-help shadow-sm border border-taupe-light hover:bg-accent-burgundy hover:text-white transition-colors">
        i
      </div>
      <div className="absolute right-0 bottom-full mb-2 w-64 p-4 bg-graphite-dark text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        <h4 className="font-semibold mb-2 text-accent-gold">So funktioniert's</h4>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="text-accent-gold">•</span>
            <span><strong>1 CHF = 1 Punkt.</strong> Bruchteile werden abgerundet (z.B. 86.99 CHF = 86 Punkte).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-gold">•</span>
            <span>Punkte können im Geschäft oder online gegen Prämien eingelöst werden.</span>
          </li>
        </ul>
        <div className="absolute top-full right-3 border-8 border-transparent border-t-graphite-dark"></div>
      </div>
    </div>
  );
}
