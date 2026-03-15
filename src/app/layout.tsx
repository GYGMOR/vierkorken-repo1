import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { CartProvider } from '@/contexts/CartContext';
import { SeasonalEffects } from '@/components/effects/SeasonalEffects';
import { MaintenanceGuard } from '@/components/maintenance/MaintenanceGuard';
import '@/styles/globals.css';
import { LoyaltyGiftPopup } from '@/components/loyalty/LoyaltyGiftPopup';

// Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Vier Korken Wein-Boutique – Premium Weinshop',
    template: '%s | Vier Korken Wein-Boutique',
  },
  description: 'Entdecken Sie exquisite Weine aus aller Welt. Die Vier Korken Wein-Boutique verbindet Weinkompetenz, Kultur und Genuss in einer stilvollen digitalen Weinwelt.',
  keywords: ['Wein', 'Weinshop', 'Premium Weine', 'Weingut', 'Weinverkostung', 'Schweiz'],
  authors: [{ name: 'Vier Korken Wein-Boutique' }],
  creator: 'Vier Korken Wein-Boutique',
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Vier Korken Wein-Boutique',
    title: 'Vier Korken Wein-Boutique – Premium Weinshop',
    description: 'Entdecken Sie exquisite Weine aus aller Welt.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vier Korken Wein-Boutique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vier Korken Wein-Boutique – Premium Weinshop',
    description: 'Entdecken Sie exquisite Weine aus aller Welt.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/images/layout/Favicon/vierkorken-logo.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          <MaintenanceGuard>
            <CartProvider>
              {children}
              <SeasonalEffects />
              <LoyaltyGiftPopup />
            </CartProvider>
          </MaintenanceGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
