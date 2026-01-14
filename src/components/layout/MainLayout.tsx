import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { CookieConsent } from '../CookieConsent';

export interface MainLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  showUserMenu?: boolean;
}

export function MainLayout({
  children,
  showNavigation = true,
  showFooter = true,
  showUserMenu = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-warmwhite">
      <CookieConsent />
      {showNavigation && <Navigation showUserMenu={showUserMenu} />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
