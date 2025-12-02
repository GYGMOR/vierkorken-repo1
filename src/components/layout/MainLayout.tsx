import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { AgeVerification } from '../AgeVerification';

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
      {showNavigation && <Navigation showUserMenu={showUserMenu} />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
