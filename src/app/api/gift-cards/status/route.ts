import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendGiftCardEmail, sendInfoMail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

/**
 * Check if a gift card coupon is active
 * Used by the success page to verify the payment was processed
 *
 * FALLBACK: If webhook didn't fire, this endpoint will check Stripe directly
 * and activate the coupon if payment was successful
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        isActive: true,
        type: true,
        value: true,
        validUntil: true,
        internalNote: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        found: false,
        isActive: false,
      });
    }

    // If coupon is already active, return immediately
    if (coupon.isActive) {
      return NextResponse.json({
        success: true,
        found: true,
        isActive: true,
        value: Number(coupon.value),
        validUntil: coupon.validUntil,
      });
    }

    // FALLBACK: Coupon not active - check if payment was completed via Stripe
    console.log(`🔍 Checking Stripe for payment status of coupon: ${coupon.code}`);

    try {
      // Search for checkout sessions with this coupon ID in metadata
      const sessions = await stripe.checkout.sessions.list({
        limit: 10,
      });

      // Find session that matches this coupon
      const matchingSession = sessions.data.find(
        (session) =>
          session.metadata?.couponId === coupon.id &&
          session.metadata?.source === 'gift-card-purchase'
      );

      if (matchingSession && matchingSession.payment_status === 'paid') {
        console.log(`✅ Payment confirmed for coupon ${coupon.code}, activating...`);

        // Activate the coupon
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { isActive: true },
        });

        // Parse internal note for email details
        let senderName = 'VIER KORKEN Weinboutique';
        let recipientName = '';
        let giftMessage = '';
        let recipientEmail = matchingSession.metadata?.recipientEmail;
        const buyerEmail = matchingSession.customer_details?.email || matchingSession.client_reference_id;

        if (coupon.internalNote) {
          try {
            const noteData = JSON.parse(coupon.internalNote);
            senderName = noteData.senderName || 'VIER KORKEN Weinboutique';
            recipientName = noteData.recipientName || '';
            giftMessage = noteData.message || '';
            recipientEmail = recipientEmail || noteData.recipientEmail;
          } catch (e) {
            console.log('Could not parse coupon internal note');
          }
        }

        // Send emails (if not already sent)
        if (recipientEmail) {
          try {
            await sendGiftCardEmail(recipientEmail, {
              code: coupon.code,
              amount: Number(coupon.value),
              senderName,
              recipientName,
              message: giftMessage,
            });
            console.log('✅ Gift card email sent to:', recipientEmail);
          } catch (emailError: any) {
            console.error('❌ Failed to send gift card email:', emailError.message);
          }

          // Send confirmation to buyer
          if (buyerEmail && buyerEmail !== recipientEmail && buyerEmail !== 'guest') {
            try {
              await sendGiftCardEmail(buyerEmail, {
                code: coupon.code,
                amount: Number(coupon.value),
                senderName: 'VIER KORKEN Weinboutique',
                recipientName: senderName,
                message: `Sie haben erfolgreich einen Geschenkgutschein im Wert von CHF ${Number(coupon.value).toFixed(2)} für ${recipientEmail} gekauft. Der Gutschein wurde an den Empfänger gesendet.`,
              });
              console.log('✅ Buyer confirmation sent to:', buyerEmail);
            } catch (buyerEmailError: any) {
              console.error('❌ Failed to send buyer email:', buyerEmailError.message);
            }
          }

          // Send admin notification
          try {
            const adminEmail = process.env.ADMIN_EMAIL || 'info@vierkorken.ch';
            await sendInfoMail({
              to: adminEmail,
              subject: `Neuer Gutscheinkauf - ${coupon.code} - CHF ${Number(coupon.value).toFixed(2)}`,
              text: `
Neuer Geschenkgutschein gekauft!

Gutschein-Code: ${coupon.code}
Wert: CHF ${Number(coupon.value).toFixed(2)}

Käufer: ${buyerEmail || 'Unbekannt'}
Absender-Name: ${senderName}

Empfänger-Email: ${recipientEmail}
Empfänger-Name: ${recipientName || 'Nicht angegeben'}

Nachricht: ${giftMessage || 'Keine'}

Kaufdatum: ${new Date().toLocaleString('de-CH')}

(Hinweis: Dieser Gutschein wurde via Fallback-Mechanismus aktiviert, da der Webhook nicht ausgelöst wurde)
              `.trim(),
              html: `
<h2>Neuer Geschenkgutschein gekauft!</h2>
<table style="border-collapse: collapse; width: 100%; max-width: 500px;">
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Gutschein-Code:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 16px; color: #6D2932;">${coupon.code}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Wert:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">CHF ${Number(coupon.value).toFixed(2)}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Käufer:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${buyerEmail || 'Unbekannt'}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Absender-Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${senderName}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Empfänger-Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${recipientEmail}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Empfänger-Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${recipientName || 'Nicht angegeben'}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nachricht:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${giftMessage || 'Keine'}</td></tr>
</table>
<p style="color: #666; font-size: 12px; margin-top: 20px;">Hinweis: Aktiviert via Fallback (Webhook nicht ausgelöst)</p>
              `,
            });
            console.log('✅ Admin notification sent');
          } catch (adminEmailError: any) {
            console.error('❌ Failed to send admin notification:', adminEmailError.message);
          }
        }

        return NextResponse.json({
          success: true,
          found: true,
          isActive: true,
          value: Number(coupon.value),
          validUntil: coupon.validUntil,
          activatedViaFallback: true,
        });
      }
    } catch (stripeError: any) {
      console.error('Error checking Stripe:', stripeError.message);
      // Continue and return inactive status
    }

    return NextResponse.json({
      success: true,
      found: true,
      isActive: coupon.isActive,
      value: Number(coupon.value),
      validUntil: coupon.validUntil,
    });
  } catch (error) {
    console.error('Error checking gift card status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
