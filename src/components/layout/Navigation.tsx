'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useCart } from '@/contexts/CartContext';

export interface NavigationProps {
  className?: string;
  showUserMenu?: boolean;
}

export function Navigation({ className, showUserMenu = true }: NavigationProps) {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const user = session?.user ? {
    firstName: session.user.name?.split(' ')[0] || '',
    lastName: session.user.name?.split(' ')[1] || '',
    email: session.user.email || '',
  } : null;

  // Check if user is admin and load profile image
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (data.user.role === 'ADMIN') {
              setIsAdmin(true);
            }
            if (data.user.profileImage) {
              setProfileImage(data.user.profileImage);
            }
          }
        })
        .catch(() => {
          setIsAdmin(false);
          setProfileImage(null);
        });
    } else {
      setIsAdmin(false);
      setProfileImage(null);
    }
  }, [session]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className={cn('backdrop-elegant border-b border-taupe-light/30 sticky top-0 z-50', className)}>
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/images/layout/Wein Boutique_edited.png"
              alt="VIER KORKEN Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/weine" className="text-graphite hover:text-graphite-dark transition-colors whitespace-nowrap">
              Weine
            </Link>
            <Link href="/news" className="text-graphite hover:text-graphite-dark transition-colors whitespace-nowrap">
              News
            </Link>
            <Link href="/events" className="text-graphite hover:text-graphite-dark transition-colors whitespace-nowrap">
              Events
            </Link>
            <Link href="/uber-uns" className="text-graphite hover:text-graphite-dark transition-colors whitespace-nowrap">
              Über uns
            </Link>

            {/* Dropdown "Mehr" */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-graphite hover:text-graphite-dark transition-colors py-2">
                <span>Mehr</span>
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-warmwhite rounded-lg shadow-strong border border-taupe-light overflow-hidden">
                  <Link href="/geschenkgutscheine" className="block px-4 py-3 text-sm text-graphite hover:bg-wood-lightest/30 transition-colors">
                    Geschenkgutscheine
                  </Link>
                  <Link href="/divers" className="block px-4 py-3 text-sm text-graphite hover:bg-wood-lightest/30 transition-colors">
                    Divers
                  </Link>
                  <Link href="/club" className="block px-4 py-3 text-sm text-graphite hover:bg-wood-lightest/30 transition-colors">
                    Treueprogramm
                  </Link>
                  <Link href="/kontakt" className="block px-4 py-3 text-sm text-graphite hover:bg-wood-lightest/30 transition-colors">
                    Kontakt
                  </Link>
                  <Link href="/dein-event" className="block px-4 py-3 text-sm text-graphite hover:bg-wood-lightest/30 transition-colors">
                    Dein Event
                  </Link>
                  <Link href="/blog" className="block px-4 py-3 text-sm text-graphite hover:bg-wood-lightest/30 transition-colors">
                    Weinwissen
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-graphite hover:text-graphite-dark transition-colors"
              aria-label="Suche"
            >
              <SearchIcon />
            </button>

            {/* User Menu */}
            {showUserMenu && (
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      aria-label="Benutzermenü"
                    >
                      <UserAvatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        email={user.email}
                        imageUrl={profileImage}
                        size="sm"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-warmwhite rounded-lg shadow-strong border border-taupe-light z-50">
                        <div className="p-4 border-b border-taupe-light">
                          <p className="font-semibold text-graphite-dark">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-graphite/60">{user.email}</p>
                        </div>
                        <div className="py-2">
                          {isAdmin && (
                            <>
                              <Link
                                href="/admin"
                                className="block px-4 py-2 text-accent-burgundy font-semibold hover:bg-accent-burgundy/5 transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  Admin Portal
                                </span>
                              </Link>
                              <div className="border-t border-taupe-light my-2"></div>
                            </>
                          )}
                          <Link
                            href="/konto"
                            className="block px-4 py-2 text-graphite hover:bg-warmwhite-light transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Mein Konto
                          </Link>
                          <Link
                            href="/konto?tab=orders"
                            className="block px-4 py-2 text-graphite hover:bg-warmwhite-light transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Bestellungen
                          </Link>
                          <Link
                            href="/konto?tab=loyalty"
                            className="block px-4 py-2 text-graphite hover:bg-warmwhite-light transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Loyalty Club
                          </Link>
                          <div className="border-t border-taupe-light my-2"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-accent-burgundy hover:bg-warmwhite-light transition-colors"
                          >
                            Abmelden
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-graphite hover:text-graphite-dark transition-colors"
                    aria-label="Anmelden"
                  >
                    <UserIcon />
                  </Link>
                )}
              </div>
            )}

            <Link
              href="/warenkorb"
              className="text-graphite hover:text-graphite-dark transition-colors relative"
              aria-label="Warenkorb"
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-burgundy text-warmwhite text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Favorites Icon */}
            <Link
              href="/favoriten"
              className="text-graphite hover:text-graphite-dark transition-colors relative"
              aria-label="Favoriten"
            >
              <HeartIcon />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-graphite hover:text-graphite-dark transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-taupe-light/30 mt-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/weine"
                className="text-graphite hover:text-graphite-dark transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Weine
              </Link>
              <Link
                href="/news"
                className="text-graphite hover:text-graphite-dark transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/events"
                className="text-graphite hover:text-graphite-dark transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/uber-uns"
                className="text-graphite hover:text-graphite-dark transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Über uns
              </Link>

              <div className="border-t border-taupe-light/30 my-1"></div>
              <div className="text-sm font-semibold text-graphite-dark uppercase tracking-wider py-1">Mehr</div>

              <Link
                href="/geschenkgutscheine"
                className="text-graphite hover:text-graphite-dark transition-colors py-2 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Geschenkgutscheine
              </Link>
              <Link
                href="/divers"
                className="text-graphite hover:text-graphite-dark transition-colors py-2 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Divers
              </Link>
              <Link
                href="/club"
                className="text-graphite hover:text-graphite-dark transition-colors py-2 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Treueprogramm
              </Link>
              <Link
                href="/kontakt"
                className="text-graphite hover:text-graphite-dark transition-colors py-2 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kontakt
              </Link>
              <Link
                href="/dein-event"
                className="text-graphite hover:text-graphite-dark transition-colors py-2 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dein Event
              </Link>
              <Link
                href="/blog"
                className="text-graphite hover:text-graphite-dark transition-colors py-2 pl-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Weinwissen
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </nav>
  );
}

// Search Modal Component
function SearchModal({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    wines: any[];
    events: any[];
    pages: any[];
  }>({ wines: [], events: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Mock data - in real app, fetch from API
  const allWines = [
    { id: '1', name: 'Château Margaux 2015', type: 'Rotwein', region: 'Bordeaux', price: 450 },
    { id: '2', name: 'Sassicaia 2018', type: 'Rotwein', region: 'Toskana', price: 280 },
    { id: '3', name: 'Meursault Premier Cru', type: 'Weisswein', region: 'Burgund', price: 120 },
  ];

  const allEvents = [
    { id: '1', slug: 'burgundy-tasting-november', title: 'Burgunderweine Verkostung', type: 'Verkostung' },
    { id: '2', slug: 'italian-wine-dinner', title: 'Italienisches Weindinner', type: 'Wine Dinner' },
    { id: '3', slug: 'champagne-masterclass', title: 'Champagner Masterclass', type: 'Masterclass' },
  ];

  const allPages = [
    { title: 'Weine', url: '/weine', description: 'Entdecken Sie unsere Weinauswahl' },
    { title: 'Events', url: '/events', description: 'Exklusive Weinerlebnisse' },
    { title: 'Loyalty Club', url: '/club', description: 'Punkte sammeln und Vorteile genießen' },
    { title: 'Über uns', url: '/uber-uns', description: 'Erfahren Sie mehr über VIER KORKEN Weinboutique' },
    { title: 'Kontakt', url: '/kontakt', description: 'Nehmen Sie Kontakt mit uns auf' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults({ wines: [], events: [], pages: [] });
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    setTimeout(() => {
      const lowercaseQuery = query.toLowerCase();

      const wines = allWines.filter(wine =>
        wine.name.toLowerCase().includes(lowercaseQuery) ||
        wine.type.toLowerCase().includes(lowercaseQuery) ||
        wine.region.toLowerCase().includes(lowercaseQuery)
      );

      const events = allEvents.filter(event =>
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.type.toLowerCase().includes(lowercaseQuery)
      );

      const pages = allPages.filter(page =>
        page.title.toLowerCase().includes(lowercaseQuery) ||
        page.description.toLowerCase().includes(lowercaseQuery)
      );

      setSearchResults({ wines, events, pages });
      setIsSearching(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-warmwhite rounded-lg shadow-strong max-w-2xl w-full max-h-[80vh] overflow-hidden border border-wood-light">
        {/* Search Input */}
        <div className="p-6 border-b border-wood-light">
          <div className="flex items-center gap-3">
            <SearchIcon />
            <input
              type="text"
              placeholder="Weine, Events, Seiten durchsuchen..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-wine-dark placeholder:text-graphite/40 text-lg"
            />
            <button
              onClick={onClose}
              className="text-graphite hover:text-wine transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {searchQuery.length < 2 ? (
            <div className="p-8 text-center text-graphite/60">
              <p>Geben Sie mindestens 2 Zeichen ein, um zu suchen</p>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine mx-auto"></div>
            </div>
          ) : (
            <div className="p-4">
              {searchResults.wines.length === 0 &&
                searchResults.events.length === 0 &&
                searchResults.pages.length === 0 ? (
                <div className="p-8 text-center text-graphite/60">
                  <p>Keine Ergebnisse gefunden für "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Wines */}
                  {searchResults.wines.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-graphite/60 uppercase tracking-wide mb-3 px-2">
                        Weine ({searchResults.wines.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.wines.map((wine) => (
                          <Link
                            key={wine.id}
                            href={`/weine/${wine.id}`}
                            onClick={onClose}
                            className="block p-3 rounded-lg hover:bg-wood-lightest/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-wine-dark">{wine.name}</p>
                                <p className="text-sm text-graphite/60">
                                  {wine.type} • {wine.region}
                                </p>
                              </div>
                              <p className="font-serif text-wine">CHF {wine.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {searchResults.events.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-graphite/60 uppercase tracking-wide mb-3 px-2">
                        Events ({searchResults.events.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.events.map((event) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.slug}`}
                            onClick={onClose}
                            className="block p-3 rounded-lg hover:bg-wood-lightest/30 transition-colors"
                          >
                            <p className="font-medium text-wine-dark">{event.title}</p>
                            <p className="text-sm text-graphite/60">{event.type}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pages */}
                  {searchResults.pages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-graphite/60 uppercase tracking-wide mb-3 px-2">
                        Seiten ({searchResults.pages.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.pages.map((page, idx) => (
                          <Link
                            key={idx}
                            href={page.url}
                            onClick={onClose}
                            className="block p-3 rounded-lg hover:bg-wood-lightest/30 transition-colors"
                          >
                            <p className="font-medium text-wine-dark">{page.title}</p>
                            <p className="text-sm text-graphite/60">{page.description}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-4 border-t border-wood-light bg-wood-lightest/20">
          <p className="text-xs text-graphite/60 text-center">
            Drücken Sie ESC zum Schließen
          </p>
        </div>
      </div>
    </div>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
