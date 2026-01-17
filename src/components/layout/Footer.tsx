import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-graphite-darker text-warmwhite section-padding', className)}>
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl mb-4 text-accent-gold">VIER KORKEN</h3>
            <p className="text-warmwhite/70 text-sm">
              Ihre digitale Weinwelt für Genuss, Kultur und Gemeinschaft.
            </p>
            {/* Google Maps */}
            <div className="mt-4">
              <iframe
                src="https://www.google.com/maps?q=Vier+Korken+Wein-Boutique,+Steinbrunnengasse+3a,+5707+Seengen&output=embed"
                width="100%"
                height="150"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vier Korken Wein-Boutique Standort"
              ></iframe>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-accent-gold">Shop</h4>
            <ul className="space-y-2 text-sm text-warmwhite/70">
              <li>
                <Link href="/weine" className="hover:text-warmwhite transition-colors">
                  Alle Weine
                </Link>
              </li>
              <li>
                <Link href="/weine" className="hover:text-warmwhite transition-colors">
                  Rotwein
                </Link>
              </li>
              <li>
                <Link href="/weine" className="hover:text-warmwhite transition-colors">
                  Weisswein
                </Link>
              </li>
              <li>
                <Link href="/weine" className="hover:text-warmwhite transition-colors">
                  Roséwein
                </Link>
              </li>
              <li>
                <Link href="/weine" className="hover:text-warmwhite transition-colors">
                  Schaumwein
                </Link>
              </li>
            </ul>
          </div>

          {/* Entdecken */}
          <div>
            <h4 className="font-semibold mb-4 text-accent-gold">Entdecken</h4>
            <ul className="space-y-2 text-sm text-warmwhite/70">
              <li>
                <Link href="/events" className="hover:text-warmwhite transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/club" className="hover:text-warmwhite transition-colors">
                  Loyalty Club
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-warmwhite transition-colors">
                  Weinwissen
                </Link>
              </li>
              <li>
                <Link href="/uber-uns" className="hover:text-warmwhite transition-colors">
                  Über uns
                </Link>
              </li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-semibold mb-4 text-accent-gold">Service</h4>
            <ul className="space-y-2 text-sm text-warmwhite/70">
              <li>
                <Link href="/kontakt" className="hover:text-warmwhite transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/versand" className="hover:text-warmwhite transition-colors">
                  Versand & Lieferung
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-warmwhite transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-warmwhite transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/widerruf" className="hover:text-warmwhite transition-colors">
                  Widerrufsrecht
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider mb-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-warmwhite/60">
          <p>&copy; {currentYear} VIER KORKEN. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/vier.korken.wein.boutique"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-warmwhite transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/share/1BmnrFBhWf/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-warmwhite transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.linkedin.com/in/christina-hediger-13a813275"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-warmwhite transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Social Media Icons
function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
