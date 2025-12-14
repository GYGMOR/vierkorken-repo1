import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { AgeVerification } from '../AgeVerification';
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
      <AgeVerification />
      <CookieConsent />
      {showNavigation && <Navigation showUserMenu={showUserMenu} />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
