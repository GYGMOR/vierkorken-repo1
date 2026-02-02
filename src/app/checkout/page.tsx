'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';

const MOCK_USER = {
  loyaltyPoints: 3500,
  loyaltyLevel: 3,
  // cashbackPercent: 2, // Removed for Gift System
};

type DeliveryMethod = 'shipping' | 'pickup';
type PaymentMethod = 'card' | 'twint' | 'cash';
type ShippingMethod = 'standard' | 'express';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { items, total } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Delivery & Payment Selection
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('shipping');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Address Data
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    country: 'CH',
  });

  const [billingIsSame, setBillingIsSame] = useState(true);
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    country: 'CH',
  });
  const [giftOptions, setGiftOptions] = useState({
    isGift: false,
    giftWrap: false,
    giftMessage: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Save address dialog
  const [showSaveAddressDialog, setShowSaveAddressDialog] = useState(false);
  const [saveAddressAsDefault, setSaveAddressAsDefault] = useState(false);

  const pointsToEarn = Math.floor(total * 1.2);
  // const cashbackAmount = (total * MOCK_USER.cashbackPercent) / 100;

  // Calculate shipping cost based on method and order amount (BEFORE coupon discount)
  const calculateShippingCost = () => {
    if (deliveryMethod === 'pickup') return 0;

    const freeShippingThreshold = 150;
    const isFreeShippingEligible = total >= freeShippingThreshold;

    if (shippingMethod === 'express') {
      return isFreeShippingEligible ? 9.90 : 19.90;
    } else {
      return isFreeShippingEligible ? 0 : 9.90;
    }
  };

  const shippingCost = calculateShippingCost();
  const giftWrapCost = giftOptions.giftWrap ? 5.0 : 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const subtotalBeforeDiscount = total + shippingCost + giftWrapCost;
  const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const finalTotal = subtotalAfterDiscount * 1.081; // inkl. MwSt

  // Load saved addresses when user is logged in
  useEffect(() => {
    if (session?.user) {
      fetchSavedAddresses();
    }
  }, [session]);

  // Check if user is already verified or returning from verification
  useEffect(() => {
    const checkVerificationStatus = async () => {
      // Check if returning from verification
      const verified = searchParams.get('verified');
      if (verified === 'true') {
        console.log('✅ Returned from successful verification');
        setIsVerified(true);

        // RESTORE form data from sessionStorage
        const savedFormData = sessionStorage.getItem('checkoutFormData');
        if (savedFormData) {
          try {
            const formData = JSON.parse(savedFormData);
            console.log('📋 Restoring form data from session:', {
              hasEmail: !!formData.shippingData?.email,
              email: formData.shippingData?.email,
              firstName: formData.shippingData?.firstName,
              lastName: formData.shippingData?.lastName,
            });

            // Update state
            setShippingData(formData.shippingData);
            setBillingData(formData.billingData);
            setBillingIsSame(formData.billingIsSame);
            setDeliveryMethod(formData.deliveryMethod);
            setShippingMethod(formData.shippingMethod);
            setPaymentMethod(formData.paymentMethod);
            setGiftOptions(formData.giftOptions);

            // Clean up sessionStorage
            sessionStorage.removeItem('checkoutFormData');

            // IMPORTANT: Proceed immediately with the RESTORED data (not state)
            // This avoids timing issues with React state updates
            console.log('🚀 Proceeding with checkout using restored data...');
            proceedWithCheckoutData(formData);
          } catch (error) {
            console.error('Error restoring form data:', error);
          }
        } else {
          console.warn('⚠️ No saved form data found after verification');
        }
        return;
      }

      // PROFESSIONAL: ONLY check DB for logged-in users
      // NO localStorage - guests must verify every time
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.user?.identityVerified) {
              console.log('✅ User already verified in database');
              setIsVerified(true);
            }
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }
    };

    checkVerificationStatus();
  }, [session, searchParams]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);

        // Auto-select default address and populate shippingData
        const defaultAddr = data.addresses?.find((addr: any) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          // Populate shippingData with the default address
          setShippingData({
            firstName: defaultAddr.firstName,
            lastName: defaultAddr.lastName,
            email: session?.user?.email || '',
            phone: defaultAddr.phone || '',
            street: defaultAddr.street,
            streetNumber: defaultAddr.streetNumber,
            postalCode: defaultAddr.postalCode,
            city: defaultAddr.city,
            country: defaultAddr.country,
          });
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);

    const addr = savedAddresses.find(a => a.id === addressId);
    if (addr) {
      setShippingData({
        firstName: addr.firstName,
        lastName: addr.lastName,
        email: session?.user?.email || '',
        phone: addr.phone || '',
        street: addr.street,
        streetNumber: addr.streetNumber,
        postalCode: addr.postalCode,
        city: addr.city,
        country: addr.country,
      });
    }
  };

  const saveAddress = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          street: shippingData.street,
          streetNumber: shippingData.streetNumber,
          postalCode: shippingData.postalCode,
          city: shippingData.city,
          country: shippingData.country,
          phone: shippingData.phone,
          isDefault: saveAddressAsDefault,
          isShipping: true,
        }),
      });

      if (response.ok) {
        await fetchSavedAddresses();
        setShowSaveAddressDialog(false);
        setSaveAddressAsDefault(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Bitte geben Sie einen Gutscheincode ein');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: total, // Use subtotal before shipping/gift wrap
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || 'Ungültiger Gutscheincode');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponError('');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Fehler beim Validieren des Gutscheincodes');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Ihr Warenkorb ist leer');
      return;
    }

    // Validation
    if (deliveryMethod === 'shipping') {
      // Check if using new address or selected address
      if (useNewAddress || savedAddresses.length === 0) {
        // Validate new address fields
        if (!shippingData.firstName || !shippingData.lastName || !shippingData.street ||
          !shippingData.streetNumber || !shippingData.city || !shippingData.postalCode) {
          alert('Bitte füllen Sie alle Pflichtfelder aus');
          return;
        }

        // Ask if user wants to save address (only if logged in and using new address)
        if (session?.user && (useNewAddress || savedAddresses.length === 0)) {
          setShowSaveAddressDialog(true);
          return; // Wait for user to decide
        }
      } else if (!selectedAddressId) {
        // No address selected
        alert('Bitte wählen Sie eine Lieferadresse');
        return;
      }
    }

    // Validate contact data for pickup
    if (deliveryMethod === 'pickup') {
      if (!shippingData.firstName || !shippingData.lastName || !shippingData.email) {
        alert('Bitte geben Sie Ihre Kontaktdaten an');
        return;
      }
    }

    // ⚠️ SCHWEIZER RICHTLINIEN: Identity Verification vor Payment
    // Check if user needs identity verification (18+ for alcohol)
    if (!isVerified) {
      console.log('🔐 Identity verification required, redirecting...');
      await startIdentityVerification();
      return;
    }

    // Continue with checkout
    await proceedWithCheckout();
  };

  const startIdentityVerification = async () => {
    try {
      setIsProcessing(true);
      console.log('🔐 Starting identity verification...');

      const response = await fetch('/api/checkout/create-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: shippingData.email || session?.user?.email,
          customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        }),
      });

      const data = await response.json();
      console.log('🔐 Verification response:', data);

      if (data.alreadyVerified) {
        // User is already verified, skip to payment
        console.log('✅ User already verified, proceeding to payment');
        setIsVerified(true);
        await proceedWithCheckout();
      } else if (data.url) {
        // SAVE form data to sessionStorage before redirect
        const formData = {
          shippingData,
          billingData,
          billingIsSame,
          deliveryMethod,
          shippingMethod,
          paymentMethod,
          giftOptions,
        };
        sessionStorage.setItem('checkoutFormData', JSON.stringify(formData));
        console.log('💾 Saved form data to session storage');

        // PROFESSIONAL: State token in URL, no localStorage needed
        console.log('🔗 Redirecting to verification:', data.url);
        console.log('🎫 State token:', data.stateToken);
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Fehler beim Starten der Identitätsprüfung');
      }
    } catch (error: any) {
      console.error('❌ Identity verification error:', error);
      alert('Fehler bei der Identitätsprüfung:\n\n' + error.message);
      setIsProcessing(false);
    }
  };

  // Helper function to proceed with checkout using explicit data (used after verification)
  const proceedWithCheckoutData = async (formData: any) => {
    setIsProcessing(true);

    try {
      console.log('🚀 proceedWithCheckoutData called with:', {
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        email: formData.shippingData?.email,
        firstName: formData.shippingData?.firstName,
      });

      // Barzahlung bei Abholung
      if (formData.paymentMethod === 'cash' && formData.deliveryMethod === 'pickup') {
        console.log('💰 Creating cash order for pickup (with restored data)...');
        console.log('📦 Items:', items);
        console.log('👤 Contact Data:', {
          firstName: formData.shippingData.firstName,
          lastName: formData.shippingData.lastName,
          email: formData.shippingData.email,
          phone: formData.shippingData.phone
        });

        const response = await fetch('/api/orders/create-cash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            deliveryMethod: formData.deliveryMethod,
            shippingMethod: null,
            paymentMethod: 'cash',
            shippingData: {
              firstName: formData.shippingData.firstName,
              lastName: formData.shippingData.lastName,
              email: formData.shippingData.email,
              phone: formData.shippingData.phone,
            },
            giftOptions: formData.giftOptions,
            couponCode: appliedCoupon?.code || null,
          }),
        });

        const data = await response.json();
        console.log('💰 Cash order response:', data);

        if (data.success) {
          console.log('✅ Cash order created successfully!');
          router.push(`/checkout/success?orderId=${data.orderId}`);
        } else {
          console.error('❌ Cash order failed:', data.error);
          throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
        }
      }
      // Stripe Payment (Karte/Twint)
      else {
        console.log('💳 Creating Stripe checkout session (with restored data)...');

        const checkoutData: any = {
          items,
          deliveryMethod: formData.deliveryMethod,
          shippingMethod: formData.deliveryMethod === 'shipping' ? formData.shippingMethod : null,
          paymentMethod: formData.paymentMethod,
          giftOptions: formData.giftOptions,
          couponCode: appliedCoupon?.code || null,
        };

        // Add contact/shipping data
        if (formData.deliveryMethod === 'pickup') {
          checkoutData.shippingData = {
            firstName: formData.shippingData.firstName,
            lastName: formData.shippingData.lastName,
            email: formData.shippingData.email,
            phone: formData.shippingData.phone,
          };
        } else {
          checkoutData.shippingData = formData.shippingData;
        }

        if (!formData.billingIsSame) {
          checkoutData.billingData = formData.billingData;
        }

        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        });

        const data = await response.json();
        console.log('💳 Stripe response:', data);

        if (data.error) {
          console.error('❌ Stripe error:', data.error);
          throw new Error(data.error);
        }

        if (data.url) {
          console.log('✅ Redirecting to Stripe Checkout:', data.url);
          window.location.href = data.url;
        } else {
          throw new Error('Keine Checkout-URL erhalten');
        }
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      alert('Fehler beim Checkout:\n\n' + error.message);
      setIsProcessing(false);
    }
  };

  const proceedWithCheckout = async () => {
    setIsProcessing(true);

    try {
      // Barzahlung bei Abholung
      if (paymentMethod === 'cash' && deliveryMethod === 'pickup') {
        console.log('💰 Creating cash order for pickup...');
        console.log('📦 Items:', items);
        console.log('👤 Contact Data:', {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone
        });

        const response = await fetch('/api/orders/create-cash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            deliveryMethod,
            shippingMethod: null,
            paymentMethod: 'cash',
            shippingData: {
              firstName: shippingData.firstName,
              lastName: shippingData.lastName,
              email: shippingData.email,
              phone: shippingData.phone,
            },
            giftOptions,
            couponCode: appliedCoupon?.code || null,
          }),
        });

        const data = await response.json();
        console.log('💰 Cash order response:', data);

        if (data.success) {
          console.log('✅ Cash order created successfully!');
          router.push(`/checkout/success?orderId=${data.orderId}`);
        } else {
          console.error('❌ Cash order failed:', data.error);
          throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
        }
      }
      // Stripe Payment (Karte/Twint)
      else {
        console.log('💳 Creating Stripe checkout session...');
        console.log('🛒 Checkout data being sent:');
        console.log('  - Delivery Method:', deliveryMethod);
        console.log('  - Payment Method:', paymentMethod);
        console.log('  - Items:', items);

        const checkoutData: any = {
          items,
          deliveryMethod,
          shippingMethod: deliveryMethod === 'shipping' ? shippingMethod : null,
          paymentMethod,
          giftOptions,
          couponCode: appliedCoupon?.code || null,
        };

        // Add contact/shipping data
        if (deliveryMethod === 'pickup') {
          // For pickup, send contact info as shippingData
          checkoutData.shippingData = {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            email: shippingData.email,
            phone: shippingData.phone,
          };
          console.log('  - Contact Data (pickup):', checkoutData.shippingData);
        } else {
          // For delivery, send full address
          checkoutData.shippingData = shippingData;
          console.log('  - Shipping Address:', checkoutData.shippingData);
        }

        // Add billing data if different
        if (!billingIsSame) {
          checkoutData.billingData = billingData;
          console.log('  - Billing Address (different):', checkoutData.billingData);
        }

        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        });

        const data = await response.json();
        console.log('💳 Stripe response:', data);

        if (data.url) {
          console.log('✅ Redirecting to Stripe checkout...');
          window.location.href = data.url;
        } else {
          console.error('❌ Stripe checkout failed:', data.error, data.details);
          throw new Error(data.error || 'Fehler beim Erstellen der Checkout-Session');
        }
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert('Fehler beim Checkout:\n\n' + error.message + '\n\nBitte versuchen Sie es erneut oder kontaktieren Sie unseren Support.');
      setIsProcessing(false);
    }
  };

  // Barzahlung nur bei Abholung möglich
  useEffect(() => {
    if (deliveryMethod === 'shipping' && paymentMethod === 'cash') {
      setPaymentMethod('card');
    }
  }, [deliveryMethod]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-warmwhite py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4">
                <BackButton href="/warenkorb" label="Zurück zum Warenkorb" />
              </div>
              <h1 className="text-h1 font-serif font-light text-graphite-dark mb-4">
                Checkout
              </h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Liefermethode */}
                <Card>
                  <CardHeader>
                    <CardTitle>1. Liefermethode wählen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <DeliveryOption
                        id="shipping"
                        label="Lieferung nach Hause"
                        sublabel={`${deliveryMethod === 'shipping' && shippingMethod === 'express' ? 'Express' : 'Standard'} Versand`}
                        icon={<TruckIcon />}
                        selected={deliveryMethod === 'shipping'}
                        onSelect={() => setDeliveryMethod('shipping')}
                      />
                      <DeliveryOption
                        id="pickup"
                        label="Abholung im Geschäft"
                        sublabel="Kostenlos - Vier Korken Weinlounge, Zürich"
                        icon={<StoreIcon />}
                        selected={deliveryMethod === 'pickup'}
                        onSelect={() => setDeliveryMethod('pickup')}
                      />
                    </div>

                    {/* Shipping Method Selection (only for delivery) */}
                    {deliveryMethod === 'shipping' && (
                      <div className="pt-4 border-t border-taupe-light space-y-3">
                        <label className="block text-sm font-medium text-graphite-dark">
                          Versandart wählen
                        </label>
                        <ShippingMethodOption
                          id="standard"
                          label="Standard Versand"
                          sublabel={`3-5 Werktage - ${total >= 150 ? 'Kostenlos' : 'CHF 9.90'}`}
                          selected={shippingMethod === 'standard'}
                          onSelect={() => setShippingMethod('standard')}
                        />
                        <ShippingMethodOption
                          id="express"
                          label="Express Versand"
                          sublabel={`1-2 Werktage - ${total >= 150 ? 'CHF 9.90' : 'CHF 19.90'}`}
                          selected={shippingMethod === 'express'}
                          onSelect={() => setShippingMethod('express')}
                        />
                        {total < 150 && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-blue-900 flex-1">
                              Bei Bestellungen ab CHF 150.- reduzieren sich die Versandkosten automatisch
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Adresse (nur bei Lieferung) */}
                {deliveryMethod === 'shipping' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Lieferadresse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Gespeicherte Adressen */}
                      {savedAddresses.length > 0 && !useNewAddress && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-graphite-dark">
                            Gespeicherte Adressen
                          </label>
                          {savedAddresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id
                                ? 'border-accent-burgundy bg-accent-burgundy/5'
                                : 'border-taupe hover:border-graphite'
                                }`}
                            >
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddressId === addr.id}
                                onChange={() => handleAddressSelect(addr.id)}
                                className="mt-1 w-4 h-4 text-accent-burgundy focus:ring-accent-burgundy"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-graphite-dark">
                                  {addr.firstName} {addr.lastName}
                                </div>
                                <div className="text-sm text-graphite">
                                  {addr.street} {addr.streetNumber}, {addr.postalCode} {addr.city}
                                </div>
                                {addr.isDefault && (
                                  <span className="inline-block mt-1 text-xs bg-accent-burgundy/10 text-accent-burgundy px-2 py-1 rounded">
                                    Standard
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                          <Button
                            variant="secondary"
                            onClick={() => setUseNewAddress(true)}
                            className="w-full"
                          >
                            + Neue Adresse verwenden
                          </Button>
                        </div>
                      )}

                      {/* Neue Adresse Formular */}
                      {(savedAddresses.length === 0 || useNewAddress) && (
                        <>
                          {useNewAddress && (
                            <Button
                              variant="secondary"
                              onClick={() => setUseNewAddress(false)}
                              size="sm"
                            >
                              ← Zurück zu gespeicherten Adressen
                            </Button>
                          )}
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input
                              label="Vorname"
                              required
                              value={shippingData.firstName}
                              onChange={(e) =>
                                setShippingData({ ...shippingData, firstName: e.target.value })
                              }
                            />
                            <Input
                              label="Nachname"
                              required
                              value={shippingData.lastName}
                              onChange={(e) =>
                                setShippingData({ ...shippingData, lastName: e.target.value })
                              }
                            />
                          </div>

                          <Input
                            label="E-Mail"
                            type="email"
                            required
                            value={shippingData.email}
                            onChange={(e) =>
                              setShippingData({ ...shippingData, email: e.target.value })
                            }
                          />

                          <Input
                            label="Telefon"
                            type="tel"
                            value={shippingData.phone}
                            onChange={(e) =>
                              setShippingData({ ...shippingData, phone: e.target.value })
                            }
                          />

                          <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-4 sm:col-span-3">
                              <Input
                                label="Strasse"
                                required
                                value={shippingData.street}
                                onChange={(e) =>
                                  setShippingData({ ...shippingData, street: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-span-4 sm:col-span-1">
                              <Input
                                label="Nr."
                                required
                                value={shippingData.streetNumber}
                                onChange={(e) =>
                                  setShippingData({ ...shippingData, streetNumber: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <Input
                              label="PLZ"
                              required
                              value={shippingData.postalCode}
                              onChange={(e) =>
                                setShippingData({ ...shippingData, postalCode: e.target.value })
                              }
                            />
                            <div className="col-span-2">
                              <Input
                                label="Ort"
                                required
                                value={shippingData.city}
                                onChange={(e) =>
                                  setShippingData({ ...shippingData, city: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Kontaktdaten bei Abholung */}
                {deliveryMethod === 'pickup' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Kontaktdaten</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Vorname"
                          required
                          value={shippingData.firstName}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, firstName: e.target.value })
                          }
                        />
                        <Input
                          label="Nachname"
                          required
                          value={shippingData.lastName}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, lastName: e.target.value })
                          }
                        />
                      </div>
                      <Input
                        label="E-Mail"
                        type="email"
                        required
                        value={shippingData.email}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, email: e.target.value })
                        }
                      />
                      <Input
                        label="Telefon"
                        type="tel"
                        value={shippingData.phone}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, phone: e.target.value })
                        }
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Rechnungsadresse */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rechnungsadresse</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Checkbox: Rechnungsadresse = Lieferadresse */}
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={billingIsSame}
                        onChange={(e) => setBillingIsSame(e.target.checked)}
                        className="w-4 h-4 rounded border-taupe text-accent-burgundy focus:ring-accent-burgundy"
                      />
                      <span className="text-body text-graphite">
                        Rechnungsadresse ist identisch mit {deliveryMethod === 'shipping' ? 'Lieferadresse' : 'Kontaktdaten'}
                      </span>
                    </label>

                    {/* Separate Rechnungsadresse Felder */}
                    {!billingIsSame && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            label="Vorname"
                            required
                            value={billingData.firstName}
                            onChange={(e) =>
                              setBillingData({ ...billingData, firstName: e.target.value })
                            }
                          />
                          <Input
                            label="Nachname"
                            required
                            value={billingData.lastName}
                            onChange={(e) =>
                              setBillingData({ ...billingData, lastName: e.target.value })
                            }
                          />
                        </div>

                        <Input
                          label="E-Mail"
                          type="email"
                          required
                          value={billingData.email}
                          onChange={(e) =>
                            setBillingData({ ...billingData, email: e.target.value })
                          }
                        />

                        <Input
                          label="Telefon"
                          type="tel"
                          value={billingData.phone}
                          onChange={(e) =>
                            setBillingData({ ...billingData, phone: e.target.value })
                          }
                        />

                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-3">
                            <Input
                              label="Strasse"
                              required
                              value={billingData.street}
                              onChange={(e) =>
                                setBillingData({ ...billingData, street: e.target.value })
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                              label="Nr."
                              required
                              value={billingData.streetNumber}
                              onChange={(e) =>
                                setBillingData({ ...billingData, streetNumber: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <Input
                            label="PLZ"
                            required
                            value={billingData.postalCode}
                            onChange={(e) =>
                              setBillingData({ ...billingData, postalCode: e.target.value })
                            }
                          />
                          <div className="col-span-2">
                            <Input
                              label="Ort"
                              required
                              value={billingData.city}
                              onChange={(e) =>
                                setBillingData({ ...billingData, city: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Zahlungsmethode */}
                <Card>
                  <CardHeader>
                    <CardTitle>3. Zahlungsmethode</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <PaymentOption
                      id="card"
                      label="Kreditkarte / Debitkarte"
                      sublabel={deliveryMethod === 'pickup'
                        ? 'Bezahlen bei Abholung mit Karte'
                        : 'Visa, Mastercard, American Express'}
                      icon={<CreditCardIcon />}
                      selected={paymentMethod === 'card'}
                      onSelect={() => setPaymentMethod('card')}
                    />
                    <PaymentOption
                      id="twint"
                      label="TWINT"
                      sublabel={deliveryMethod === 'pickup'
                        ? 'Bezahlen bei Abholung mit TWINT'
                        : 'Schnell und sicher mit TWINT bezahlen'}
                      icon={<TwintIcon />}
                      selected={paymentMethod === 'twint'}
                      onSelect={() => setPaymentMethod('twint')}
                    />
                    {deliveryMethod === 'pickup' && (
                      <PaymentOption
                        id="cash"
                        label="Barzahlung"
                        sublabel="Bei Abholung bar bezahlen"
                        icon={<CashIcon />}
                        selected={paymentMethod === 'cash'}
                        onSelect={() => setPaymentMethod('cash')}
                      />
                    )}

                    <div className="pt-4 border-t border-taupe-light">
                      <p className="text-body-sm text-graphite/60">
                        {paymentMethod === 'cash'
                          ? 'Bitte bezahlen Sie bei der Abholung in bar.'
                          : 'Ihre Zahlung wird sicher über Stripe Terminal verarbeitet.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Geschenkoptionen & Gutscheincode */}
                <Card>
                  <CardHeader>
                    <CardTitle>Geschenkoptionen & Gutscheincode</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Geschenkoptionen */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={giftOptions.isGift}
                          onChange={(e) =>
                            setGiftOptions({ ...giftOptions, isGift: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-taupe text-accent-burgundy focus:ring-accent-burgundy"
                        />
                        <span className="text-body text-graphite">Dies ist ein Geschenk</span>
                      </label>

                      {giftOptions.isGift && (
                        <>
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={giftOptions.giftWrap}
                              onChange={(e) =>
                                setGiftOptions({ ...giftOptions, giftWrap: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-taupe text-accent-burgundy focus:ring-accent-burgundy"
                            />
                            <span className="text-body text-graphite">
                              Geschenkverpackung (+CHF 5.00)
                            </span>
                          </label>

                          <div>
                            <label className="block text-sm font-medium text-graphite-dark mb-2">
                              Grußkarte Nachricht (optional)
                            </label>
                            <textarea
                              value={giftOptions.giftMessage}
                              onChange={(e) =>
                                setGiftOptions({ ...giftOptions, giftMessage: e.target.value })
                              }
                              rows={4}
                              maxLength={250}
                              className="input"
                              placeholder="Ihre persönliche Nachricht..."
                            />
                            <p className="text-xs text-graphite/60 mt-1">
                              {giftOptions.giftMessage.length}/250 Zeichen
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Gutscheincode */}
                    <div className="pt-4 border-t border-taupe-light">
                      <label className="block text-sm font-medium text-graphite-dark mb-3">
                        Gutscheincode
                      </label>

                      {appliedCoupon ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="font-medium text-green-900">
                                  Gutschein "{appliedCoupon.code}" angewendet
                                </span>
                              </div>
                              {appliedCoupon.description && (
                                <p className="text-sm text-green-700 mt-1">
                                  {appliedCoupon.description}
                                </p>
                              )}
                              <p className="text-sm font-semibold text-green-900 mt-1">
                                Rabatt: CHF {appliedCoupon.discountAmount.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={removeCoupon}
                            >
                              Entfernen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Gutscheincode eingeben"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError('');
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applyCoupon();
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="secondary"
                              onClick={applyCoupon}
                              disabled={isValidatingCoupon || !couponCode.trim()}
                            >
                              {isValidatingCoupon ? 'Prüfen...' : 'Anwenden'}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-sm text-red-600">{couponError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing
                    ? 'Wird verarbeitet...'
                    : paymentMethod === 'cash'
                      ? `Bestellung abschließen - CHF ${finalTotal.toFixed(2)}`
                      : `Jetzt bezahlen - CHF ${finalTotal.toFixed(2)}`}
                </Button>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Bestellübersicht</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 pb-3 border-b border-taupe-light">
                          <div className="w-16 h-16 bg-gradient-to-br from-rose-medium/20 to-accent-burgundy/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <WineBottleIcon className="w-8 h-8 text-graphite/30" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-body-sm font-medium text-graphite-dark truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-graphite/60">{item.winery || item.type}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-graphite/60">{item.quantity}x</span>
                              <span className="text-body-sm font-medium text-graphite-dark">
                                CHF {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Loyalty Benefits */}
                    <div className="p-4 bg-gradient-to-br from-accent-gold/10 to-accent-burgundy/10 rounded-lg border border-accent-gold/20">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-5 h-5 text-accent-gold"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        <span className="font-semibold text-graphite-dark">Ihre Vorteile</span>
                      </div>
                      <div className="space-y-2 text-body-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-graphite/70">Sie erhalten:</span>
                          <span className="font-semibold text-accent-burgundy">
                            +{pointsToEarn} Punkte
                          </span>
                        </div>
                        {/* Cashback removed */}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 pt-4 border-t border-taupe-light">
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-graphite/70">Zwischensumme</span>
                        <span className="text-graphite">CHF {total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-graphite/70">
                          Versand {deliveryMethod === 'shipping' && `(${shippingMethod === 'express' ? 'Express' : 'Standard'})`}
                        </span>
                        <span className={shippingCost === 0 ? 'text-green-600' : 'text-graphite'}>
                          {shippingCost === 0 ? 'Kostenlos' : `CHF ${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      {giftOptions.giftWrap && (
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="text-graphite/70">Geschenkverpackung</span>
                          <span className="text-graphite">CHF {giftWrapCost.toFixed(2)}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="text-green-600 font-medium">
                            Gutschein ({appliedCoupon.code})
                          </span>
                          <span className="text-green-600 font-medium">
                            -CHF {appliedCoupon.discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-graphite/70">MwSt. (8.1%)</span>
                        <span className="text-graphite">
                          CHF {(subtotalAfterDiscount * 0.081).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-graphite-dark">
                      <span className="font-serif text-h4 text-graphite-dark">Total</span>
                      <span className="font-serif text-h4 text-graphite-dark">
                        CHF {finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Address Dialog */}
      {showSaveAddressDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-h3 font-serif text-graphite-dark">
              Adresse speichern?
            </h3>
            <p className="text-body text-graphite">
              Möchten Sie diese Lieferadresse in Ihrem Konto speichern? So können Sie beim nächsten Einkauf schneller zur Kasse.
            </p>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={saveAddressAsDefault}
                onChange={(e) => setSaveAddressAsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-taupe text-accent-burgundy focus:ring-accent-burgundy"
              />
              <span className="text-body text-graphite">Als Standard-Adresse festlegen</span>
            </label>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={async () => {
                  setShowSaveAddressDialog(false);
                  await proceedWithCheckout();
                }}
                className="flex-1"
              >
                Nein, danke
              </Button>
              <Button
                onClick={async () => {
                  await saveAddress();
                  await proceedWithCheckout();
                }}
                className="flex-1"
              >
                Ja, speichern
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// Components
function DeliveryOption({
  id,
  label,
  sublabel,
  icon,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${selected
        ? 'border-accent-burgundy bg-accent-burgundy/5'
        : 'border-taupe hover:border-graphite'
        }`}
    >
      <input
        type="radio"
        name="delivery-method"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="w-4 h-4 text-accent-burgundy focus:ring-accent-burgundy"
      />
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-graphite-dark">{label}</div>
        <div className="text-sm text-graphite/60">{sublabel}</div>
      </div>
    </label>
  );
}

function PaymentOption({
  id,
  label,
  sublabel,
  icon,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${selected
        ? 'border-accent-burgundy bg-accent-burgundy/5'
        : 'border-taupe hover:border-graphite'
        }`}
    >
      <input
        type="radio"
        name="payment-method"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="w-4 h-4 text-accent-burgundy focus:ring-accent-burgundy"
      />
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-graphite-dark">{label}</div>
        <div className="text-sm text-graphite/60">{sublabel}</div>
      </div>
    </label>
  );
}

function ShippingMethodOption({
  id,
  label,
  sublabel,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  sublabel: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors ${selected
        ? 'border-accent-burgundy bg-accent-burgundy/5'
        : 'border-taupe hover:border-graphite'
        }`}
    >
      <input
        type="radio"
        name="shipping-method"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="w-4 h-4 text-accent-burgundy focus:ring-accent-burgundy"
      />
      <div className="flex-1">
        <div className="font-medium text-graphite-dark">{label}</div>
        <div className="text-sm text-graphite/60">{sublabel}</div>
      </div>
    </label>
  );
}

// Icons
function TruckIcon() {
  return (
    <svg className="w-6 h-6 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg className="w-6 h-6 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-6 h-6 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function TwintIcon() {
  return (
    <div className="w-12 h-8 bg-[#00a8e3] rounded text-white text-xs flex items-center justify-center font-bold">
      TWINT
    </div>
  );
}

function CashIcon() {
  return (
    <svg className="w-6 h-6 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function WineBottleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v9m0 0l-4 8h8l-4-8zm0 0a5 5 0 01-5-5h10a5 5 0 01-5 5z"
      />
    </svg>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen bg-warmwhite py-12">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-h1 font-serif font-light text-graphite-dark mb-4">
                  Checkout
                </h1>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-burgundy mx-auto mb-4"></div>
                      <p className="text-body text-graphite">Lädt...</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
