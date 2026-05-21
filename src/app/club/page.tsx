import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Card, CardContent } from '@/components/ui/Card';
import { BadgeDisplay } from '@/components/loyalty/BadgeDisplay';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { CustomerCard } from '@/components/loyalty/CustomerCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EditableText } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';

export const dynamic = 'force-dynamic';

export default async function LoyaltyClubPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let userData = {
    id: 'GUEST-ID-0000',
    firstName: 'Max',
    lastName: 'Mustermann',
    loyaltyPoints: 0,
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
        id: dbUser.id,
        firstName: dbUser.firstName || user.name?.split(' ')[0] || 'Kunde',
        lastName: dbUser.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        loyaltyPoints: dbUser.loyaltyPoints,
        badges: dbUser.badges.map(b => ({
          ...b.badge,
          earnedAt: b.earnedAt,
        })) as any,
        isAdmin: dbUser.role === 'ADMIN'
      };
    }
  }

  // Fetch Levels to extract gifts and their point requirements (ignoring level names)
  const dbLevels = await prisma.loyaltyLevel.findMany({
    include: { gifts: true },
    orderBy: { minPoints: 'asc' }
  });

  const allGifts = dbLevels.flatMap(level => 
    level.gifts.map(gift => ({
      ...gift,
      pointsRequired: level.minPoints
    }))
  );

  return (
    <MainLayout>
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

        {/* Rewards / Gifts */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-h2 font-serif font-light text-graphite-dark mb-4">
              Verfügbare Prämien
            </h2>
            <p className="text-body-lg text-graphite">
              Tauschen Sie Ihre gesammelten Punkte gegen fantastische Prämien ein.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {allGifts.map((gift) => {
              const canAfford = userData.loyaltyPoints >= gift.pointsRequired;
              
              return (
                <Card key={gift.id} className="overflow-hidden border-2 hover:border-accent-gold transition-colors flex flex-col">
                  {gift.image && (
                    <div className="w-full h-48 bg-taupe-light/30 relative">
                      <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-graphite-dark">{gift.name}</h3>
                      <span className="bg-accent-gold/10 text-accent-gold-dark px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        {gift.pointsRequired} PTS
                      </span>
                    </div>
                    <p className="text-sm text-graphite/70 mb-6 flex-1">{gift.description}</p>
                    
                    <Button 
                      variant={canAfford ? 'primary' : 'secondary'} 
                      className="w-full"
                      disabled={!canAfford || !user}
                      onClick={() => {/* In a real implementation this would trigger an exchange */}}
                    >
                      {canAfford ? 'Prämie einlösen' : 'Nicht genügend Punkte'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        {userData.badges.length > 0 && (
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
        )}

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
            <span><strong>1 CHF = 1 Punkt.</strong> Bei jedem Einkauf (auch Bruchteile werden mathematisch abgerundet, z.B. 86.99 CHF = 86 Punkte).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-gold">•</span>
            <span>Punkte können im Geschäft oder online gegen Prämien eingelöst werden.</span>
          </li>
        </ul>
        {/* Triangle pointer */}
        <div className="absolute top-full right-3 border-8 border-transparent border-t-graphite-dark"></div>
      </div>
    </div>
  );
}
