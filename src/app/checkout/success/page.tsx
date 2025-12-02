import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { MainLayout } from '@/components/layout/MainLayout';
import CheckoutSuccessContent from './CheckoutSuccessContent';

// Diese Seite wird dynamisch gerendert (nicht pre-rendered)
export const dynamic = 'force-dynamic';

// Metadata für SEO
export const metadata = {
  title: 'Bestellung erfolgreich | Vierkorken',
  description: 'Ihre Bestellung wurde erfolgreich aufgegeben',
  robots: 'noindex, nofollow', // Success-Seiten sollten nicht indexiert werden
};

function LoadingFallback() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-burgundy mx-auto mb-4" />
                <p className="text-graphite">Lade Bestelldaten...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
