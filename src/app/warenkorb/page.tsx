'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total: subtotal } = useCart();

  const handleCheckout = () => {
    // Redirect to checkout page instead of directly to Stripe
    window.location.href = '/checkout';
  };

  // Free shipping at CHF 150+
  const shipping = subtotal >= 150 ? 0 : 9.90;
  const total = subtotal + shipping;

  // Check if cart has wine products (not events)
  const wineCategories = ['Rotwein', 'Rosé', 'Weisswein', 'Schaumwein', 'Dessertwein', 'Alkoholfrei'];
  const wineItems = items.filter(item => item.type === 'wine');
  const hasWineProducts = wineItems.length > 0;

  // Calculate total wine bottle count
  const totalBottles = wineItems.reduce((sum, item) => sum + item.quantity, 0);

  // Show package suggestion only if:
  // 1. Has wine products
  // 2. Total bottles is not a multiple of 6
  // 3. Total bottles is between 1 and 5, or 7-11, etc. (any incomplete 6-pack)
  const bottlesNeededForFullCase = totalBottles > 0 ? (6 - (totalBottles % 6)) % 6 : 0;
  const shouldShowPackageSuggestion = hasWineProducts && bottlesNeededForFullCase > 0;

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-warmwhite">
      <div className="container-custom px-4 md:px-6 py-6 md:py-12">
        <h1 className="text-2xl md:text-3xl lg:text-h1 font-serif font-light text-graphite-dark mb-6 md:mb-8">
          Warenkorb
        </h1>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 md:p-6">
                <div className="flex gap-3 md:gap-6">
                  {/* Image */}
                  {item.slug && (
                    <Link
                      href={`/weine/${item.slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-16 h-24 md:w-24 md:h-32 bg-gradient-to-br from-warmwhite to-sand-light rounded-lg relative overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <WineBottleIcon className="w-12 h-12 text-taupe" />
                          </div>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {item.slug ? (
                      <Link
                        href={`/weine/${item.slug}`}
                        className="block group"
                      >
                        <h3 className="font-serif text-base md:text-lg lg:text-h4 text-graphite-dark group-hover:text-accent-burgundy transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        {item.winery && (
                          <p className="text-xs md:text-sm lg:text-body text-graphite mt-1">
                            {item.winery}
                          </p>
                        )}
                        {item.vintage && (
                          <p className="text-xs md:text-body-sm text-graphite/60 mt-1">
                            {item.vintage}
                          </p>
                        )}
                        {item.eventDate && (
                          <p className="text-xs md:text-body-sm text-graphite/60 mt-1">
                            {new Date(item.eventDate).toLocaleDateString('de-CH')}
                          </p>
                        )}
                      </Link>
                    ) : (
                      <div>
                        <h3 className="font-serif text-base md:text-lg lg:text-h4 text-graphite-dark">
                          {item.name}
                        </h3>
                        {item.winery && <p className="text-xs md:text-sm lg:text-body text-graphite mt-1">{item.winery}</p>}
                        {item.eventDate && (
                          <p className="text-xs md:text-body-sm text-graphite/60 mt-1">
                            {new Date(item.eventDate).toLocaleDateString('de-CH')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 md:mt-4 gap-3 sm:gap-0">
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-taupe hover:bg-taupe-light transition-colors flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="w-10 md:w-12 text-center font-medium text-graphite-dark text-sm md:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-taupe hover:bg-taupe-light transition-colors flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-serif text-lg md:text-xl lg:text-h4 text-graphite-dark">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-xs md:text-body-sm text-graphite/60">
                          {formatPrice(item.price)} / Flasche
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 text-graphite/40 hover:text-red-600 transition-colors self-start"
                    aria-label="Entfernen"
                  >
                    <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </Card>
            ))}

            {/* Package Suggestions - Only for wine products and incomplete cases */}
            {shouldShowPackageSuggestion && (
              <Card className="p-4 md:p-6 bg-rose-light/30">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent-burgundy/10 flex items-center justify-center">
                    <BoxIcon className="w-5 h-5 md:w-6 md:h-6 text-accent-burgundy" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-base md:text-lg lg:text-h4 text-graphite-dark mb-2">
                      Versandoptimierung
                    </h3>
                    <p className="text-sm md:text-body text-graphite mb-3 md:mb-4">
                      Mit {bottlesNeededForFullCase === 1 ? 'nur 1 weiteren Flasche' : `nur ${bottlesNeededForFullCase} weiteren Flaschen`} können Sie eine 6er-Kiste bestellen
                      und Versandkosten sparen!
                    </p>
                    <Link href="/weine">
                      <Button variant="secondary" size="sm">
                        Passende Weine anzeigen
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Gift Card Suggestion */}
            <Card className="p-4 md:p-6 bg-accent-gold/5 border-accent-gold/20">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base md:text-lg lg:text-h4 text-graphite-dark mb-2">
                    Geschenkgutscheine
                  </h3>
                  <p className="text-sm md:text-body text-graphite mb-3 md:mb-4">
                    Schenken Sie Weingenuss. Perfekt für jeden Anlass.
                  </p>
                  <Link href="/geschenkgutscheine">
                    <Button variant="secondary" size="sm">
                      Gutscheine kaufen
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="font-serif text-xl md:text-2xl lg:text-h3 text-graphite-dark mb-4 md:mb-6">
                Zusammenfassung
              </h2>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between text-sm md:text-body">
                  <span className="text-graphite">Zwischensumme</span>
                  <span className="font-medium text-graphite-dark">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm md:text-body">
                  <span className="text-graphite">Versand</span>
                  <span className="font-medium text-graphite-dark">
                    {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                  </span>
                </div>

                {shipping > 0 && (
                  <div className="flex items-start gap-2 p-2.5 md:p-3 bg-blue-50 rounded-lg">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs md:text-body-sm text-blue-900 flex-1">
                      Ab {formatPrice(150)} Bestellwert versandkostenfrei!
                      {subtotal < 150 && ` Noch ${formatPrice(150 - subtotal)} bis zur kostenlosen Lieferung.`}
                    </p>
                  </div>
                )}

                <div className="divider"></div>

                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg md:text-xl lg:text-h4 text-graphite-dark">
                    Total
                  </span>
                  <span className="font-serif text-xl md:text-2xl lg:text-h3 text-graphite-dark">
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="text-xs md:text-body-sm text-graphite/60">
                  Inkl. MwSt. und Versandkosten
                </p>
              </div>

              <Button
                className="w-full mt-4 md:mt-6"
                size="lg"
                onClick={handleCheckout}
              >
                Zur Kasse
              </Button>

              <Link href="/weine">
                <button className="btn btn-ghost w-full mt-2 md:mt-3 text-sm md:text-base">
                  Weiter einkaufen
                </button>
              </Link>

              {/* Loyalty Points */}
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-br from-accent-gold/10 to-accent-burgundy/10 rounded-lg border border-accent-gold/20">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <StarIcon className="w-4 h-4 md:w-5 md:h-5 text-accent-gold" />
                  <span className="font-medium text-sm md:text-base text-graphite-dark">
                    Loyalty Punkte
                  </span>
                </div>
                <p className="text-xs md:text-body-sm text-graphite/80">
                  Sie erhalten <span className="font-semibold">{Math.floor(total * 1.2)}</span> Punkte
                  für diese Bestellung!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="min-h-screen bg-warmwhite flex items-center justify-center">
      <div className="text-center max-w-md px-4 md:px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-taupe-light/30 mb-4 md:mb-6">
          <CartIcon className="w-10 h-10 md:w-12 md:h-12 text-taupe" />
        </div>
        <h1 className="text-xl md:text-2xl lg:text-h2 font-serif font-light text-graphite-dark mb-3 md:mb-4">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-sm md:text-base lg:text-body-lg text-graphite mb-6 md:mb-8">
          Entdecken Sie unsere exquisite Weinauswahl und finden Sie Ihren nächsten Lieblingswein.
        </p>
        <Link href="/weine">
          <Button size="lg">Weine entdecken</Button>
        </Link>
      </div>
    </div>
  );
}

// Icons
function WineBottleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3h6v3h-6V3zM8 6h8v4l-2 11H10L8 10V6z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
