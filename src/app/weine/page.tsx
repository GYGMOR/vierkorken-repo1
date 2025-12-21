import { Suspense } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import WineListContent from './WineListContent';

// Use cache-first strategy but allow dynamic rendering for client interactions
export const dynamic = 'auto';

export const metadata = {
  title: 'Unsere Weine | Vierkorken',
  description: 'Entdecken Sie unsere Auswahl an exquisiten Weinen',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-warmwhite">
      <Navigation />
      <div className="container-custom py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy"></div>
          <p className="ml-4 text-graphite">Lade Weine...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function WinesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WineListContent />
    </Suspense>
  );
}
