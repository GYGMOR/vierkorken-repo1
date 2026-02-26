/**
 * Resend.com E-Mail System
 *
 * Verwendet Resend.com API für E-Mail-Versand
 * Vorteile:
 * - Sehr gute IP-Reputation (99%+ Zustellrate)
 * - Professioneller E-Mail-Service
 * - DKIM/SPF automatisch konfiguriert
 * - Kostenlos für 3.000 E-Mails/Monat
 */

import { Resend } from 'resend';

// ============================================================
// Resend.com Konfiguration
// ============================================================
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAIL_FROM_INFO = process.env.MAIL_FROM_INFO || 'info@vierkorken.ch';
const MAIL_FROM_NOREPLY = process.env.MAIL_FROM_NOREPLY || 'no-reply@vierkorken.ch';

// Resend Client erstellen
function getResendClient() {
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key missing. Check RESEND_API_KEY in .env');
  }
  return new Resend(RESEND_API_KEY);
}

// ============================================================
// Zentrale E-Mail Utility Funktionen
// ============================================================

/**
 * Sendet eine E-Mail mit info@vierkorken.ch als Absender
 * Verwendet für: Newsletter, Kontaktformular, Bestellungen, normale Kommunikation
 */
export async function sendInfoMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}) {
  const resend = getResendClient();

  try {
    const startTime = Date.now();
    console.log('📧 [sendInfoMail] Attempting to send...');
    console.log('📧 [sendInfoMail] To:', options.to);
    console.log('📧 [sendInfoMail] From:', MAIL_FROM_INFO);
    console.log('📧 [sendInfoMail] Subject:', options.subject);
    console.log('📧 [sendInfoMail] Has attachments:', !!options.attachments);
    console.log('📧 [sendInfoMail] HTML length:', options.html?.length || 0);
    console.log('📧 [sendInfoMail] Text length:', options.text?.length || 0);

    const data = await resend.emails.send({
      from: MAIL_FROM_INFO,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [sendInfoMail] SUCCESS! Email sent in ${duration}ms`);
    console.log(`✅ [sendInfoMail] To: ${options.to}`);
    console.log(`✅ [sendInfoMail] From: ${MAIL_FROM_INFO}`);
    console.log(`✅ [sendInfoMail] Resend ID: ${data.data?.id}`);
    console.log(`✅ [sendInfoMail] Full response:`, JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('❌ [sendInfoMail] FAILED to send email');
    console.error('❌ [sendInfoMail] To:', options.to);
    console.error('❌ [sendInfoMail] From:', MAIL_FROM_INFO);
    console.error('❌ [sendInfoMail] Error type:', error.constructor?.name);
    console.error('❌ [sendInfoMail] Error message:', error.message);
    console.error('❌ [sendInfoMail] Error code:', error.code);
    console.error('❌ [sendInfoMail] Error statusCode:', error.statusCode);
    console.error('❌ [sendInfoMail] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error(`Failed to send info-mail: ${error.message}`);
  }
}

/**
 * Sendet eine E-Mail mit no-reply@vierkorken.ch als Absender
 * Verwendet für: Passwort-Reset, Account Recovery (nur ausgehende Mails)
 */
export async function sendNoReplyMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResendClient();

  try {
    const startTime = Date.now();
    console.log('📧 Sending no-reply-mail to:', options.to, 'subject:', options.subject);

    const data = await resend.emails.send({
      from: MAIL_FROM_NOREPLY,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: MAIL_FROM_INFO, // Antworten gehen an info@, falls jemand doch antwortet
    });

    const duration = Date.now() - startTime;
    console.log(`✅ No-Reply-Mail sent to: ${options.to} from: ${MAIL_FROM_NOREPLY} (${duration}ms) - ID: ${data.data?.id}`);

    return data;
  } catch (error: any) {
    console.error('❌ Error sending no-reply-mail:', error.message);
    throw new Error(`Failed to send no-reply-mail: ${error.message}`);
  }
}

// ============================================================
// E-Mail Templates & Funktionen
// ============================================================

/**
 * Send password reset email (verwendet no-reply@vierkorken.ch)
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  firstName: string
) {
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Passwort zurücksetzen</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Passwort zurücksetzen</h2>

            <p>Hallo ${firstName || ''},</p>

            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den untenstehenden Button, um ein neues Passwort zu erstellen:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                Passwort zurücksetzen
              </a>
            </div>

            <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
            <p style="background-color: #fff; padding: 12px; border-left: 4px solid #8B4513; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <strong>Wichtig:</strong> Dieser Link ist nur 1 Stunde gültig.
            </p>

            <p style="color: #666; font-size: 14px;">
              Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Passwort zurücksetzen - Vier Korken Wein-Boutique

Hallo ${firstName || ''},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Verwenden Sie den folgenden Link, um ein neues Passwort zu erstellen:

${resetUrl}

Dieser Link ist nur 1 Stunde gültig.

Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Bei Fragen: info@vierkorken.ch
    `.trim();

  // Verwenden no-reply@ für Passwort-Reset
  await sendNoReplyMail({
    to,
    subject: 'Passwort zurücksetzen - Vier Korken Wein-Boutique',
    html,
    text,
  });
}

/**
 * Send welcome email (optional - for future use)
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
  // Implementation for welcome email
  // ...
}

/**
 * Send contact form inquiry to admin (verwendet info@vierkorken.ch)
 */
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@vierkorken.ch';

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Neue Kontaktanfrage</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Neue Kontaktanfrage</h2>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>E-Mail:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Betreff:</strong> ${subject}</p>
            </div>

            <h3 style="color: #333; margin-top: 20px;">Nachricht:</h3>
            <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; white-space: pre-wrap;">${message}</div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Hinweis:</strong> Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Diese E-Mail wurde automatisch vom Kontaktformular generiert.
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Neue Kontaktanfrage

KONTAKTDATEN:
Name: ${name}
E-Mail: ${email}
Betreff: ${subject}

NACHRICHT:
${message}

Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
    `.trim();

  await sendInfoMail({
    to: adminEmail,
    subject: `Kontaktanfrage: ${subject}`,
    html,
    text,
    replyTo: email, // Admin kann direkt auf die E-Mail des Kunden antworten
  });
}

/**
 * Send order confirmation email with PDF invoice attached (verwendet info@vierkorken.ch)
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderId: string,
  orderDetails: any,
  ticketPDFs?: Buffer[]
) {
  console.log('📧 [sendOrderConfirmationEmail] Starting...', {
    to,
    orderId,
    orderNumber: orderDetails.orderNumber,
    customerName: `${orderDetails.customerFirstName} ${orderDetails.customerLastName}`,
    itemCount: orderDetails.items?.length,
    ticketCount: orderDetails.tickets?.length || 0,
  });

  // Transform tickets for PDF if present
  const ticketsForPDF = orderDetails.tickets?.map((ticket: any) => {
    // Format event date for display
    let eventDate = '';
    try {
      const dateObj = ticket.event?.startDateTime ? new Date(ticket.event.startDateTime) : null;
      if (dateObj) {
        eventDate = new Intl.DateTimeFormat('de-CH', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(dateObj);
      }
    } catch {
      eventDate = '';
    }

    return {
      ticketNumber: ticket.ticketNumber,
      eventTitle: ticket.event?.title || 'Event',
      eventDate: eventDate,
      price: Number(ticket.price),
      holderName: `${ticket.holderFirstName || ''} ${ticket.holderLastName || ''}`.trim(),
    };
  }) || [];

  // Try to generate PDF but don't fail if it doesn't work
  let pdfBuffer: Buffer | null = null;
  try {
    console.log('📄 Attempting to generate PDF invoice...');
    console.log('📄 Items:', orderDetails.items?.length || 0, 'Tickets:', ticketsForPDF.length);
    const { generateInvoicePDFBuffer } = await import('./pdf-invoice-buffer');

    pdfBuffer = await generateInvoicePDFBuffer({
      orderNumber: orderDetails.orderNumber,
      date: orderDetails.createdAt,
      customerFirstName: orderDetails.customerFirstName,
      customerLastName: orderDetails.customerLastName,
      billingAddress: orderDetails.billingAddress,
      items: orderDetails.items,
      eventTickets: orderDetails.tickets, // Pass raw tickets so nested event property is intact
      subtotal: orderDetails.subtotal,
      shippingCost: orderDetails.shippingCost,
      taxAmount: orderDetails.taxAmount,
      taxRate: 8.1,
      total: orderDetails.total,
    });
    console.log('✅ PDF invoice generated successfully (with', ticketsForPDF.length, 'tickets)');
  } catch (error: any) {
    console.error('❌ Error generating PDF (will send email without PDF):', error.message);
    console.error('❌ PDF Error stack:', error.stack?.split('\n').slice(0, 3));
    // Continue without PDF - email is more important!
    pdfBuffer = null;
  }

  // Create invoice download link as backup
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/${orderId}/invoice`;

  // Format items list for email (wines)
  const wineItemsList = orderDetails.items
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.wineName} (${item.winery}, ${item.vintage || 'N/A'}, ${item.bottleSize}l) - CHF ${Number(item.totalPrice).toFixed(2)}`
    )
    .join('\n');

  // Format tickets list for email
  const ticketItemsList = ticketsForPDF.length > 0
    ? ticketsForPDF
      .map(
        (ticket: any) =>
          `• Event-Ticket: ${ticket.eventTitle} (${ticket.eventDate}) - CHF ${Number(ticket.price).toFixed(2)}`
      )
      .join('\n')
    : '';

  // Combine all items
  const itemsList = [wineItemsList, ticketItemsList].filter(Boolean).join('\n');

  const formatPrice = (price: number) => `CHF ${Number(price).toFixed(2)}`;

  // Format addresses
  const billingAddr = orderDetails.billingAddress;
  const shippingAddr = orderDetails.shippingAddress;

  const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bestellbestätigung</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
            </div>

            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">Vielen Dank für Ihre Bestellung!</h2>

              <p>Hallo ${orderDetails.customerFirstName},</p>

              <p>Ihre Bestellung wurde erfolgreich aufgegeben und wird schnellstmöglich bearbeitet.</p>

              <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #8B4513; margin-top: 0;">Bestellnummer: ${orderDetails.orderNumber}</h3>
                <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString('de-CH')}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Bestätigt</p>
              </div>

              <h3 style="color: #333;">Bestellte Artikel:</h3>
              <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="white-space: pre-line; margin: 0; font-size: 14px;">${itemsList}</p>
              </div>

              <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Zwischensumme:</td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(orderDetails.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Versand:</td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(orderDetails.shippingCost)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 2px solid #8B4513;">MwSt. (8.1%):</td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 2px solid #8B4513;">${formatPrice(orderDetails.taxAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #8B4513;">Gesamtbetrag:</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #8B4513;">${formatPrice(orderDetails.total)}</td>
                  </tr>
                </table>
              </div>

              <h3 style="color: #333;">Rechnungsadresse:</h3>
              <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                ${billingAddr.company ? `<p style="margin: 5px 0;">${billingAddr.company}</p>` : ''}
                <p style="margin: 5px 0;">${billingAddr.firstName} ${billingAddr.lastName}</p>
                <p style="margin: 5px 0;">${billingAddr.street} ${billingAddr.streetNumber}</p>
                <p style="margin: 5px 0;">${billingAddr.postalCode} ${billingAddr.city}</p>
                <p style="margin: 5px 0;">${billingAddr.country}</p>
              </div>

              <h3 style="color: #333;">Lieferadresse:</h3>
              <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                ${shippingAddr.company ? `<p style="margin: 5px 0;">${shippingAddr.company}</p>` : ''}
                <p style="margin: 5px 0;">${shippingAddr.firstName} ${shippingAddr.lastName}</p>
                <p style="margin: 5px 0;">${shippingAddr.street} ${shippingAddr.streetNumber}</p>
                <p style="margin: 5px 0;">${shippingAddr.postalCode} ${shippingAddr.city}</p>
                <p style="margin: 5px 0;">${shippingAddr.country}</p>
              </div>

              <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                  <strong>📎 Ihre Rechnung</strong><br>
                  Ihre Rechnung als PDF ist dieser E-Mail als Anhang beigefügt. Sie können sie direkt öffnen und speichern.
                </p>
              </div>

              <h3 style="color: #333;">Nächste Schritte:</h3>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Wir bereiten Ihre Bestellung sorgfältig vor</li>
                <li style="margin-bottom: 10px;">Sie erhalten eine Versandbestätigung, sobald Ihre Bestellung unterwegs ist</li>
                <li style="margin-bottom: 10px;">Die Lieferung erfolgt innerhalb von 3-5 Werktagen</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bestellung/${orderDetails.orderNumber}" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                  Bestellung verfolgen
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
                Steinbrunnengasse 3a, 5707 Seengen<br>
                Tel: 062 390 04 04 | info@vierkorken.ch<br><br>
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt darauf.<br>
                Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
              </p>
            </div>
          </body>
        </html>
      `;

  const text = `
Vier Korken Wein-Boutique - Bestellbestätigung

Vielen Dank für Ihre Bestellung!

Hallo ${orderDetails.customerFirstName},

Ihre Bestellung wurde erfolgreich aufgegeben und wird schnellstmöglich bearbeitet.

Bestellnummer: ${orderDetails.orderNumber}
Datum: ${new Date(orderDetails.createdAt).toLocaleDateString('de-CH')}
Status: Bestätigt

BESTELLTE ARTIKEL:
${itemsList}

PREISÜBERSICHT:
Zwischensumme: ${formatPrice(orderDetails.subtotal)}
Versand: ${formatPrice(orderDetails.shippingCost)}
MwSt. (8.1%): ${formatPrice(orderDetails.taxAmount)}
─────────────────────────
Gesamtbetrag: ${formatPrice(orderDetails.total)}

RECHNUNGSADRESSE:
${billingAddr.company ? billingAddr.company + '\n' : ''}${billingAddr.firstName} ${billingAddr.lastName}
${billingAddr.street} ${billingAddr.streetNumber}
${billingAddr.postalCode} ${billingAddr.city}
${billingAddr.country}

LIEFERADRESSE:
${shippingAddr.company ? shippingAddr.company + '\n' : ''}${shippingAddr.firstName} ${shippingAddr.lastName}
${shippingAddr.street} ${shippingAddr.streetNumber}
${shippingAddr.postalCode} ${shippingAddr.city}
${shippingAddr.country}

📎 IHRE RECHNUNG:
Ihre Rechnung als PDF ist dieser E-Mail als Anhang beigefügt.

NÄCHSTE SCHRITTE:
1. Wir bereiten Ihre Bestellung sorgfältig vor
2. Sie erhalten eine Versandbestätigung, sobald Ihre Bestellung unterwegs ist
3. Die Lieferung erfolgt innerhalb von 3-5 Werktagen

Bestellung verfolgen: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bestellung/${orderDetails.orderNumber}

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Steinbrunnengasse 3a, 5707 Seengen
Tel: 062 390 04 04 | info@vierkorken.ch

Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
      `.trim();

  // Prepare attachments
  const attachments: { filename: string; content: Buffer }[] = [];

  if (pdfBuffer) {
    attachments.push({
      filename: `Rechnung_${orderDetails.orderNumber}.pdf`,
      content: pdfBuffer,
    });
  }

  if (ticketPDFs && ticketPDFs.length > 0) {
    ticketPDFs.forEach((pdf, index) => {
      attachments.push({
        filename: `EventTicket_${orderDetails.orderNumber}_${index + 1}.pdf`,
        content: pdf,
      });
    });
  }

  const finalAttachments = attachments.length > 0 ? attachments : undefined;

  console.log('📧 About to send order confirmation email...');
  console.log('📧 Email details:', {
    to,
    subject: `Bestellbestätigung - ${orderDetails.orderNumber}`,
    hasPDF: !!pdfBuffer,
    hasAttachments: !!attachments,
  });

  try {
    const result = await sendInfoMail({
      to,
      subject: `Bestellbestätigung - ${orderDetails.orderNumber}`,
      html,
      text,
      attachments: finalAttachments,
    });
    console.log('✅ Order confirmation email sent successfully via sendInfoMail');
    console.log('✅ Resend response:', result);
    return result;
  } catch (emailSendError: any) {
    console.error('❌ CRITICAL: Failed to send order confirmation email');
    console.error('❌ To:', to);
    console.error('❌ Error message:', emailSendError.message);
    console.error('❌ Error type:', emailSendError.constructor?.name);
    console.error('❌ Error stack:', emailSendError.stack?.split('\n').slice(0, 5));
    // Don't throw - we want the order to succeed even if email fails
    // But log it heavily so we can debug
    return null;
  }
}

/**
 * Send new order notification to admin/vendor (verwendet info@vierkorken.ch)
 */
export async function sendNewOrderNotificationToAdmin(orderId: string, orderDetails: any, overrideRecipient?: string) {
  const adminEmail = overrideRecipient || process.env.ADMIN_EMAIL || 'info@vierkorken.ch';

  // Format items list for email (wines/products)
  let itemsList = orderDetails.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${item.quantity}x ${item.wineName || item.name || 'Produkt'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">CHF ${Number(item.totalPrice || item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  // Format tickets list for email
  if (orderDetails.tickets && orderDetails.tickets.length > 0) {
    const ticketsHtml = orderDetails.tickets
      .map(
        (ticket: any) =>
          `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">1x Event-Ticket: ${ticket.event?.title || ticket.eventTitle || 'Event'} (${ticket.event?.date || ticket.eventDate ? new Date(ticket.event?.date || ticket.eventDate).toLocaleDateString('de-CH') : ''})</td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">CHF ${Number(ticket.price).toFixed(2)}</td>
        </tr>`
      )
      .join('');
    itemsList += ticketsHtml;
  }

  const formatPrice = (price: number) => `CHF ${Number(price).toFixed(2)}`;

  // Format addresses
  const billingAddr = orderDetails.billingAddress;
  const shippingAddr = orderDetails.shippingAddress;

  const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Neue Bestellung</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
              <p style="color: #fff; margin: 10px 0 0 0; font-size: 14px;">Admin-Benachrichtigung</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <div style="background-color: #4caf50; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px;">🎉 Neue Bestellung eingegangen!</h2>
              </div>

              <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8B4513;">
                <h3 style="color: #8B4513; margin-top: 0;">Bestellinformationen</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Bestellnummer:</td>
                    <td style="padding: 8px 0;">${orderDetails.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Kunde:</td>
                    <td style="padding: 8px 0;">${orderDetails.customerFirstName} ${orderDetails.customerLastName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">E-Mail:</td>
                    <td style="padding: 8px 0;">${orderDetails.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Telefon:</td>
                    <td style="padding: 8px 0;">${orderDetails.customerPhone || '-'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Zahlungsmethode:</td>
                    <td style="padding: 8px 0;">${orderDetails.paymentMethod === 'stripe' ? 'Kreditkarte (Stripe)' : orderDetails.paymentMethod === 'cash' ? 'Barzahlung bei Abholung' : orderDetails.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Liefermethode:</td>
                    <td style="padding: 8px 0;">${orderDetails.deliveryMethod === 'SHIPPING' ? 'Versand' : 'Abholung im Geschäft'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Zeitpunkt:</td>
                    <td style="padding: 8px 0;">${new Date().toLocaleString('de-CH')}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-top: 0;">Bestellte Artikel</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f5f5f5;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8B4513;">Artikel</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #8B4513;">Preis</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                  <tfoot>
                    <tr style="font-weight: bold;">
                      <td style="padding: 12px 8px; border-top: 2px solid #8B4513;">Zwischensumme:</td>
                      <td style="padding: 12px 8px; border-top: 2px solid #8B4513; text-align: right;">${formatPrice(orderDetails.subtotal)}</td>
                    </tr>
                    ${Number(orderDetails.shippingCost) > 0 ? `
                    <tr>
                      <td style="padding: 8px;">Versandkosten:</td>
                      <td style="padding: 8px; text-align: right;">${formatPrice(orderDetails.shippingCost)}</td>
                    </tr>
                    ` : ''}
                    ${Number(orderDetails.discountAmount) > 0 ? `
                    <tr style="color: #4caf50;">
                      <td style="padding: 8px;">Rabatt:</td>
                      <td style="padding: 8px; text-align: right;">-${formatPrice(orderDetails.discountAmount)}</td>
                    </tr>
                    ` : ''}
                    <tr style="font-size: 18px; font-weight: bold; background-color: #f5f5f5;">
                      <td style="padding: 12px 8px;">Gesamtbetrag:</td>
                      <td style="padding: 12px 8px; text-align: right; color: #8B4513;">${formatPrice(orderDetails.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: #fff; padding: 15px; border-radius: 8px;">
                  <h4 style="color: #333; margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666;">Rechnungsadresse</h4>
                  <p style="margin: 5px 0; font-size: 14px; line-height: 1.4;">
                    ${billingAddr.firstName} ${billingAddr.lastName}<br>
                    ${billingAddr.street} ${billingAddr.streetNumber}<br>
                    ${billingAddr.postalCode} ${billingAddr.city}<br>
                    ${billingAddr.country}
                  </p>
                </div>
                <div style="background-color: #fff; padding: 15px; border-radius: 8px;">
                  <h4 style="color: #333; margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666;">Lieferadresse</h4>
                  <p style="margin: 5px 0; font-size: 14px; line-height: 1.4;">
                    ${shippingAddr.firstName} ${shippingAddr.lastName}<br>
                    ${shippingAddr.street} ${shippingAddr.streetNumber}<br>
                    ${shippingAddr.postalCode} ${shippingAddr.city}<br>
                    ${shippingAddr.country}
                  </p>
                </div>
              </div>

              ${orderDetails.customerNote ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <h4 style="color: #856404; margin-top: 0;">💬 Kundennotiz</h4>
                <p style="margin: 0; color: #856404;">${orderDetails.customerNote}</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders"
                   style="display: inline-block; background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                  Bestellung im Admin-Panel öffnen
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
                Diese E-Mail wurde automatisch generiert.
              </p>
            </div>
          </body>
        </html>
      `;

  const text = `
Vier Korken Wein-Boutique - Neue Bestellung

Bestellnummer: ${orderDetails.orderNumber}
Kunde: ${orderDetails.customerFirstName} ${orderDetails.customerLastName}
E-Mail: ${orderDetails.customerEmail}
Telefon: ${orderDetails.customerPhone || '-'}

Bestellte Artikel:
${orderDetails.items.map((item: any) =>
    `${item.quantity}x ${item.wineName} - CHF ${Number(item.totalPrice).toFixed(2)}`
  ).join('\n')}

Gesamtbetrag: ${formatPrice(orderDetails.total)}

Admin-Panel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/orders
      `.trim();

  try {
    await sendInfoMail({
      to: adminEmail,
      subject: `🔔 Neue Bestellung - ${orderDetails.orderNumber}`,
      html,
      text,
    });
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    // Don't throw error - admin notification is not critical
  }
}

/**
 * Send maintenance mode subscription confirmation email (verwendet info@vierkorken.ch)
 */
export async function sendMaintenanceSubscriptionEmail(to: string) {
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vielen Dank</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">Vier Korken Wein-Boutique</h1>
            <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
          </div>

          <div style="background-color: #FAF8F5; padding: 40px 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #6D2932; margin-top: 0; font-family: Georgia, serif; font-weight: 300; font-size: 24px;">
              Vielen Dank für Ihr Interesse!
            </h2>

            <p>Wir freuen uns sehr über Ihr Interesse an unserem Premium-Weinshop.</p>

            <p>Unser Team arbeitet gerade an spannenden Updates, um Ihnen das beste Einkaufserlebnis zu bieten. Sie gehören zu den Ersten, die benachrichtigt werden, sobald wir wieder online sind.</p>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A961; margin: 30px 0;">
              <p style="margin: 0; color: #6D2932;">
                <strong>Was Sie erwarten können:</strong>
              </p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Persönliche Beratung durch unsere Sommeliers</li>
                <li>Schneller und sicherer Versand</li>
                <li>Besondere Angebote für Stammkunden</li>
              </ul>
            </div>

            <p>Wir melden uns bei Ihnen, sobald es soweit ist!</p>

            <p style="margin-top: 30px;">
              Mit besten Grüßen,<br>
              <strong style="color: #6D2932;">Ihr Vier Korken Wein-Boutique Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Premium Weinshop

Vielen Dank für Ihr Interesse!

Wir freuen uns sehr über Ihr Interesse an unserem Premium-Weinshop.

Unser Team arbeitet gerade an spannenden Updates, um Ihnen das beste Einkaufserlebnis zu bieten. Sie gehören zu den Ersten, die benachrichtigt werden, sobald wir wieder online sind.

Was Sie erwarten können:
• Persönliche Beratung durch unsere Sommeliers
• Schneller und sicherer Versand
• Besondere Angebote für Stammkunden

Wir melden uns bei Ihnen, sobald es soweit ist!

Mit besten Grüßen,
Ihr Vier Korken Wein-Boutique Team

---
© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: 'Vielen Dank für Ihr Interesse an Vier Korken Wein-Boutique',
    html,
    text,
  });
}

/**
 * Send launch notification email to subscribers (verwendet info@vierkorken.ch)
 */
export async function sendLaunchNotificationEmail(to: string) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch';

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Wir sind online!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 36px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">Vier Korken Wein-Boutique</h1>
            <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
            <p style="color: #FAF8F5; font-size: 18px; margin-top: 20px; margin-bottom: 0;">Wir sind jetzt online!</p>
          </div>

          <div style="background-color: #FAF8F5; padding: 40px 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #6D2932; margin-top: 0; font-family: Georgia, serif; font-weight: 300; font-size: 24px;">
              Willkommen zurück!
            </h2>

            <p>Es ist soweit – unser Premium-Weinshop ist wieder online und besser als je zuvor!</p>

            <p>Als einer unserer geschätzten Interessenten laden wir Sie ein, unsere Auswahl an exklusiven Weinen zu entdecken.</p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${siteUrl}" style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 16px; box-shadow: 0 4px 12px rgba(109, 41, 50, 0.3);">
                Jetzt Shop besuchen
              </a>
            </div>

            <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #C9A961;">
              <h3 style="color: #6D2932; margin-top: 0; font-size: 18px; font-family: Georgia, serif;">
                ✨ Besondere Highlights
              </h3>
              <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #3D3D3D;">
                <li style="margin-bottom: 10px;">Persönliche Beratung durch Sommeliers</li>
                <li style="margin-bottom: 10px;">Kostenloser Versand ab CHF 150</li>
                <li style="margin-bottom: 10px;">Sichere Zahlung mit Stripe oder Klara</li>
              </ul>
            </div>

            <p>Wir freuen uns darauf, Sie bei Vier Korken Wein-Boutique begrüßen zu dürfen!</p>

            <p style="margin-top: 30px;">
              Prost und beste Grüße,<br>
              <strong style="color: #6D2932;">Ihr Vier Korken Wein-Boutique Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a> |
              <a href="${siteUrl}" style="color: #6D2932; text-decoration: none;">www.vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Premium Weinshop

Wir sind jetzt online!

Willkommen zurück!

Es ist soweit – unser Premium-Weinshop ist wieder online und besser als je zuvor!

Als einer unserer geschätzten Interessenten laden wir Sie ein, unsere Auswahl an exklusiven Weinen zu entdecken.

Jetzt Shop besuchen: ${siteUrl}

BESONDERE HIGHLIGHTS:
• Persönliche Beratung durch Sommeliers
• Kostenloser Versand ab CHF 150
• Sichere Zahlung mit Stripe oder Klara

Wir freuen uns darauf, Sie bei Vier Korken Wein-Boutique begrüßen zu dürfen!

Prost und beste Grüße,
Ihr Vier Korken Wein-Boutique Team

---
© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
info@vierkorken.ch | ${siteUrl}
    `.trim();

  await sendInfoMail({
    to,
    subject: '🎉 Vier Korken Wein-Boutique ist jetzt online!',
    html,
    text,
  });
}

/**
 * Send newsletter subscription confirmation email (verwendet info@vierkorken.ch)
 */
export async function sendNewsletterConfirmationEmail(to: string) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch';
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?email=${encodeURIComponent(to)}`;

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Newsletter Bestätigung</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">Vier Korken Wein-Boutique</h1>
            <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
          </div>

          <div style="background-color: #FAF8F5; padding: 40px 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #6D2932; margin-top: 0; font-family: Georgia, serif; font-weight: 300; font-size: 24px;">
              Willkommen beim Vier Korken Wein-Boutique Newsletter!
            </h2>

            <p>Vielen Dank für Ihr Interesse an unserem Newsletter. Sie sind jetzt angemeldet und erhalten ab sofort:</p>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A961; margin: 30px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Neuigkeiten & Ankündigungen</strong> - Erfahren Sie als Erster von neuen Produkten und Updates</li>
                <li style="margin-bottom: 10px;"><strong>Exklusive Angebote</strong> - Besondere Rabatte nur für Newsletter-Abonnenten</li>
                <li style="margin-bottom: 10px;"><strong>Wein-Empfehlungen</strong> - Persönliche Tipps von unseren Sommeliers</li>
                <li><strong>Event-Einladungen</strong> - Zugang zu Verkostungen und Veranstaltungen</li>
              </ul>
            </div>

            <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #8B4155; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #6D2932;">
                <strong>💡 Tipp:</strong> Erstellen Sie jetzt einen Account und sammeln Sie Treuepunkte bei jedem Einkauf!
              </p>
              <a href="${siteUrl}/registrieren?email=${encodeURIComponent(to)}" style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                Jetzt Account erstellen
              </a>
            </div>

            <p>Wir freuen uns, Sie auf dem Laufenden zu halten!</p>

            <p style="margin-top: 30px;">
              Prost und beste Grüße,<br>
              <strong style="color: #6D2932;">Ihr Vier Korken Wein-Boutique Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.<br>
              <a href="${unsubscribeUrl}" style="color: #6D2932; text-decoration: underline;">Newsletter abbestellen</a>
            </p>

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Premium Weinshop

Willkommen beim Vier Korken Wein-Boutique Newsletter!

Vielen Dank für Ihr Interesse an unserem Newsletter. Sie sind jetzt angemeldet und erhalten ab sofort:

• Neuigkeiten & Ankündigungen - Erfahren Sie als Erster von neuen Produkten und Updates
• Exklusive Angebote - Besondere Rabatte nur für Newsletter-Abonnenten
• Wein-Empfehlungen - Persönliche Tipps von unseren Sommeliers
• Event-Einladungen - Zugang zu Verkostungen und Veranstaltungen

TIPP: Erstellen Sie jetzt einen Account und sammeln Sie Treuepunkte bei jedem Einkauf!
Account erstellen: ${siteUrl}/registrieren?email=${encodeURIComponent(to)}

Wir freuen uns, Sie auf dem Laufenden zu halten!

Prost und beste Grüße,
Ihr Vier Korken Wein-Boutique Team

---
Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.
Newsletter abbestellen: ${unsubscribeUrl}

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: 'Willkommen beim Vier Korken Wein-Boutique Newsletter',
    html,
    text,
  });
}

/**
 * Send news notification email to newsletter subscribers (verwendet info@vierkorken.ch)
 */
export async function sendNewsNotificationEmail(
  to: string,
  news: {
    title: string;
    excerpt?: string;
    slug: string;
    featuredImage?: string;
    content: string;
  }
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch';
  const newsUrl = `${siteUrl}/news/${news.slug}`;
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?email=${encodeURIComponent(to)}`;

  // Truncate content for email preview (first 500 chars)
  const contentPreview = news.content.length > 500
    ? news.content.substring(0, 500) + '...'
    : news.content;

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${news.title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF8F5;">
          <!-- Hero Image or Standard Header -->
          ${news.featuredImage ? `
          <div style="width: 100%; height: 250px; background-image: url('${news.featuredImage}'); background-size: cover; background-position: center; border-radius: 12px 12px 0 0; position: relative;">
             <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)); border-radius: 12px 12px 0 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 30px; box-sizing: border-box;">
                <span style="background-color: #C9A961; color: #fff; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; align-self: flex-start;">Neuigkeiten</span>
                <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px; font-family: Georgia, serif; text-shadow: 0 2px 10px rgba(0,0,0,0.3); line-height: 1.2;">${news.title}</h1>
             </div>
          </div>
          ` : `
          <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">Vier Korken Wein-Boutique</h1>
            <div style="margin-top: 15px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
            <p style="color: #FAF8F5; margin-top: 15px; margin-bottom: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Neuigkeiten</p>
          </div>
          <h2 style="color: #6D2932; font-size: 28px; margin: 30px 30px 0; font-family: Georgia, serif; font-weight: 400; line-height: 1.3; text-align: center;">
            ${news.title}
          </h2>
          `}

          <!-- News Content -->
          <div style="background-color: #fff; padding: ${news.featuredImage ? '30px' : '10px 30px 30px'}; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

            ${news.excerpt ? `
              <p style="color: #8B4155; font-size: 16px; font-style: italic; margin: 15px 0; padding-left: 20px; border-left: 3px solid #C9A961;">
                ${news.excerpt}
              </p>
            ` : ''}

            <div style="color: #3D3D3D; line-height: 1.8; font-size: 15px; margin: 20px 0;">
              ${contentPreview}
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0 25px;">
              <a href="${newsUrl}" style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 16px; box-shadow: 0 4px 12px rgba(109, 41, 50, 0.3); transition: all 0.3s;">
                Vollständigen Artikel lesen →
              </a>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999; font-size: 13px; margin: 0;">
                Entdecken Sie weitere exklusive Inhalte auf unserer Website
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F5F0EB; padding: 25px 20px; text-align: center; border-radius: 8px; margin-top: 20px;">
            <div style="margin-bottom: 15px;">
              <a href="${siteUrl}/weine" style="color: #6D2932; text-decoration: none; margin: 0 12px; font-size: 14px;">Weine entdecken</a>
              <span style="color: #C9A961;">|</span>
              <a href="${siteUrl}/events" style="color: #6D2932; text-decoration: none; margin: 0 12px; font-size: 14px;">Events</a>
              <span style="color: #C9A961;">|</span>
              <a href="${siteUrl}/news" style="color: #6D2932; text-decoration: none; margin: 0 12px; font-size: 14px;">Alle News</a>
            </div>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 20px 0;">

            <p style="color: #999; font-size: 12px; margin: 10px 0;">
              Sie erhalten diese E-Mail, weil Sie unseren Newsletter abonniert haben.<br>
              <a href="${unsubscribeUrl}" style="color: #6D2932; text-decoration: underline;">Newsletter abbestellen</a>
            </p>

            <p style="color: #999; font-size: 12px; margin: 10px 0 0;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Premium Weinshop

NEUE NEUIGKEITEN

${news.title}
${'='.repeat(news.title.length)}

${news.excerpt || ''}

${contentPreview}

Vollständigen Artikel lesen:
${newsUrl}

---

Weitere Links:
• Weine entdecken: ${siteUrl}/weine
• Events: ${siteUrl}/events
• Alle News: ${siteUrl}/news

Sie erhalten diese E-Mail, weil Sie unseren Newsletter abonniert haben.
Newsletter abbestellen: ${unsubscribeUrl}

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: `Neue News: ${news.title}`,
    html,
    text,
  });
}

/**
 * Send order processing email (verwendet info@vierkorken.ch)
 */
export async function sendOrderProcessingEmail(
  to: string,
  orderNumber: string,
  customerFirstName: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${siteUrl}/bestellung/${orderNumber}`;

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestellung in Bearbeitung</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Ihre Bestellung wird bearbeitet</h2>

            <p>Hallo ${customerFirstName},</p>

            <p>Wir haben mit der Bearbeitung Ihrer Bestellung begonnen und stellen gerade alles für Sie zusammen.</p>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513;">
              <p style="margin: 0;"><strong>Bestellnummer:</strong> ${orderNumber}</p>
              <p style="margin: 10px 0 0;"><strong>Status:</strong> In Bearbeitung</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>📦 Nächster Schritt:</strong> Sobald Ihre Bestellung versendet wurde, erhalten Sie eine weitere E-Mail mit der Tracking-Nummer.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                Bestellung verfolgen
              </a>
            </div>

            <p>Vielen Dank für Ihr Vertrauen!</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Bestellung in Bearbeitung

Hallo ${customerFirstName},

Wir haben mit der Bearbeitung Ihrer Bestellung begonnen und stellen gerade alles für Sie zusammen.

Bestellnummer: ${orderNumber}
Status: In Bearbeitung

Nächster Schritt: Sobald Ihre Bestellung versendet wurde, erhalten Sie eine weitere E-Mail mit der Tracking-Nummer.

Bestellung verfolgen: ${orderUrl}

Vielen Dank für Ihr Vertrauen!

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Bei Fragen: info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: `Bestellung ${orderNumber} - In Bearbeitung`,
    html,
    text,
  });
}

/**
 * Send order shipped email with tracking (verwendet info@vierkorken.ch)
 */
export async function sendOrderShippedEmail(
  to: string,
  orderNumber: string,
  customerFirstName: string,
  trackingNumber?: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${siteUrl}/bestellung/${orderNumber}`;

  // Swiss Post tracking URL
  const trackingUrl = trackingNumber
    ? `https://service.post.ch/vgn/showTrackAndTrace.do?formattedParcelCodes=${trackingNumber}`
    : null;

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestellung versendet</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #155724; margin: 0; font-size: 24px;">📦 Ihre Bestellung ist unterwegs!</h2>
            </div>

            <p>Hallo ${customerFirstName},</p>

            <p>Gute Neuigkeiten! Ihre Bestellung wurde soeben versendet und ist nun auf dem Weg zu Ihnen.</p>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0;"><strong>Bestellnummer:</strong> ${orderNumber}</p>
              <p style="margin: 10px 0 0;"><strong>Status:</strong> Versendet</p>
              ${trackingNumber ? `
              <p style="margin: 10px 0 0;"><strong>Tracking-Nummer:</strong></p>
              <p style="margin: 5px 0 0; font-family: monospace; font-size: 14px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">${trackingNumber}</p>
              ` : ''}
            </div>

            ${trackingUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="background-color: #28a745; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; margin-bottom: 10px;">
                📍 Sendung verfolgen
              </a>
              <p style="margin: 10px 0 0; font-size: 13px; color: #666;">
                Klicken Sie hier, um Ihre Sendung bei der Post zu verfolgen
              </p>
            </div>
            ` : ''}

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">📅 Voraussichtliche Lieferung</h3>
              <p style="margin: 5px 0 0; color: #666;">Ihre Bestellung sollte innerhalb von 2-3 Werktagen bei Ihnen eintreffen.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                Bestelldetails ansehen
              </a>
            </div>

            <p>Vielen Dank für Ihre Bestellung. Wir hoffen, Sie genießen Ihre Weine!</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Bestellung versendet

Hallo ${customerFirstName},

Gute Neuigkeiten! Ihre Bestellung wurde soeben versendet und ist nun auf dem Weg zu Ihnen.

Bestellnummer: ${orderNumber}
Status: Versendet
${trackingNumber ? `Tracking-Nummer: ${trackingNumber}` : ''}

${trackingUrl ? `Sendung verfolgen: ${trackingUrl}` : ''}

Voraussichtliche Lieferung: 2-3 Werktage

Bestelldetails ansehen: ${orderUrl}

Vielen Dank für Ihre Bestellung. Wir hoffen, Sie genießen Ihre Weine!

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Bei Fragen: info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: `Bestellung ${orderNumber} - Versendet ${trackingNumber ? '📦' : ''}`,
    html,
    text,
  });
}

/**
 * Send order delivered email (verwendet info@vierkorken.ch)
 */
export async function sendOrderDeliveredEmail(
  to: string,
  orderNumber: string,
  customerFirstName: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${siteUrl}/bestellung/${orderNumber}`;

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestellung zugestellt</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #155724; margin: 0; font-size: 24px;">✅ Ihre Bestellung wurde zugestellt!</h2>
            </div>

            <p>Hallo ${customerFirstName},</p>

            <p>Ihre Bestellung wurde erfolgreich zugestellt. Wir hoffen, dass alles zu Ihrer Zufriedenheit ist!</p>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0;"><strong>Bestellnummer:</strong> ${orderNumber}</p>
              <p style="margin: 10px 0 0;"><strong>Status:</strong> Zugestellt</p>
            </div>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">🍷 Genießen Sie Ihre Weine</h3>
              <p style="margin: 5px 0 0; color: #666;">
                Wir empfehlen, die Flaschen vor dem Genuss einige Stunden ruhen zu lassen.
                Bei Fragen zur optimalen Serviertemperatur oder Dekantierung kontaktieren Sie uns gerne.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                Bestelldetails ansehen
              </a>
            </div>

            <p>Vielen Dank für Ihr Vertrauen. Wir freuen uns darauf, Sie bald wieder bei Vier Korken Wein-Boutique begrüßen zu dürfen!</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Bestellung zugestellt

Hallo ${customerFirstName},

Ihre Bestellung wurde erfolgreich zugestellt. Wir hoffen, dass alles zu Ihrer Zufriedenheit ist!

Bestellnummer: ${orderNumber}
Status: Zugestellt

Genießen Sie Ihre Weine!
Wir empfehlen, die Flaschen vor dem Genuss einige Stunden ruhen zu lassen.
Bei Fragen zur optimalen Serviertemperatur oder Dekantierung kontaktieren Sie uns gerne.

Bestelldetails ansehen: ${orderUrl}

Vielen Dank für Ihr Vertrauen. Wir freuen uns darauf, Sie bald wieder bei Vier Korken Wein-Boutique begrüßen zu dürfen!

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Bei Fragen: info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: `Bestellung ${orderNumber} - Zugestellt ✅`,
    html,
    text,
  });
}

/**
 * Send order cancelled email (verwendet info@vierkorken.ch)
 */
export async function sendOrderCancelledEmail(
  to: string,
  orderNumber: string,
  customerFirstName: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestellung storniert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Bestellung storniert</h2>

            <p>Hallo ${customerFirstName},</p>

            <p>Ihre Bestellung wurde storniert.</p>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <p style="margin: 0;"><strong>Bestellnummer:</strong> ${orderNumber}</p>
              <p style="margin: 10px 0 0;"><strong>Status:</strong> Storniert</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                Falls Sie bereits bezahlt haben, wird der Betrag innerhalb von 5-7 Werktagen zurückerstattet.
              </p>
            </div>

            <p>Bei Fragen zur Stornierung kontaktieren Sie uns bitte unter info@vierkorken.ch</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/weine" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                Weiter einkaufen
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Bestellung storniert

Hallo ${customerFirstName},

Ihre Bestellung wurde storniert.

Bestellnummer: ${orderNumber}
Status: Storniert

Falls Sie bereits bezahlt haben, wird der Betrag innerhalb von 5-7 Werktagen zurückerstattet.

Bei Fragen zur Stornierung kontaktieren Sie uns bitte unter info@vierkorken.ch

Weiter einkaufen: ${siteUrl}/weine

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Bei Fragen: info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: `Bestellung ${orderNumber} - Storniert`,
    html,
    text,
  });
}

/**
 * Send event tickets with QR codes as PDF attachments
 */
export async function sendEventTicketsEmail(
  to: string,
  orderNumber: string,
  customerFirstName: string,
  tickets: Array<{
    ticketNumber: string;
    eventTitle: string;
    eventDate: string;
    pdfBuffer: Buffer;
  }>
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const ticketList = tickets
    .map((t) => `• ${t.eventTitle} - Ticket: ${t.ticketNumber}`)
    .join('\n');

  const ticketListHtml = tickets
    .map(
      (t) => `
      <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #6D2932;">
        <p style="margin: 0; font-weight: bold; color: #6D2932;">${t.eventTitle}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
          Ticket-Nr: <span style="font-family: monospace;">${t.ticketNumber}</span>
        </p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #888;">${t.eventDate}</p>
      </div>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ihre Event-Tickets</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">Vier Korken Wein-Boutique</h1>
          <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
          <p style="color: #FAF8F5; margin-top: 15px; margin-bottom: 0; font-size: 16px;">Ihre Event-Tickets</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #6D2932; margin-top: 0;">Hallo ${customerFirstName}!</h2>

          <p>Vielen Dank für Ihren Ticketkauf! Ihre Tickets sind dieser E-Mail als PDF angehängt.</p>

          <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
              <strong>Ihre ${tickets.length} Ticket(s):</strong>
            </p>
          </div>

          ${ticketListHtml}

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>Wichtig:</strong> Bitte bringen Sie Ihre Tickets ausgedruckt oder digital auf Ihrem Smartphone zum Event mit. Der QR-Code wird beim Check-in gescannt.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/bestellung/${orderNumber}" style="background-color: #6D2932; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
              Bestellung & Tickets ansehen
            </a>
          </div>

          <p>Wir freuen uns auf Sie!</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
            Steinbrunnengasse 3a, 5707 Seengen<br>
            Tel: 062 390 04 04 | info@vierkorken.ch
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Vier Korken Wein-Boutique - Ihre Event-Tickets

Hallo ${customerFirstName}!

Vielen Dank für Ihren Ticketkauf! Ihre Tickets sind dieser E-Mail als PDF angehängt.

IHRE ${tickets.length} TICKET(S):
${ticketList}

WICHTIG:
Bitte bringen Sie Ihre Tickets ausgedruckt oder digital auf Ihrem Smartphone zum Event mit. Der QR-Code wird beim Check-in gescannt.

Bestellung & Tickets ansehen: ${siteUrl}/bestellung/${orderNumber}

Wir freuen uns auf Sie!

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Steinbrunnengasse 3a, 5707 Seengen
Tel: 062 390 04 04 | info@vierkorken.ch
  `.trim();

  // Prepare attachments
  const attachments = tickets.map((t) => ({
    filename: `Ticket-${t.ticketNumber}.pdf`,
    content: t.pdfBuffer,
  }));

  await sendInfoMail({
    to,
    subject: `Ihre Event-Tickets - ${orderNumber}`,
    html,
    text,
    attachments,
  });
}

/**
 * Send gift card email to recipient with the coupon code
 */
export async function sendGiftCardEmail(
  recipientEmail: string,
  giftCard: {
    code: string;
    amount: number;
    senderName: string;
    recipientName?: string;
    message?: string;
  }
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Geschenkgutschein</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">Vier Korken Wein-Boutique</h1>
          <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
          <p style="color: #C9A961; margin-top: 20px; margin-bottom: 0; font-size: 18px; font-family: Georgia, serif;">Geschenkgutschein</p>
        </div>

        <div style="background-color: #FAF8F5; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #6D2932; margin-top: 0; text-align: center; font-family: Georgia, serif; font-weight: 300;">
            ${giftCard.recipientName ? `Liebe(r) ${giftCard.recipientName},` : 'Herzlichen Glückwunsch!'}
          </h2>

          <p style="text-align: center; font-size: 16px;">
            ${giftCard.senderName} hat Ihnen einen Geschenkgutschein geschenkt!
          </p>

          <!-- Gift Card Box -->
          <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(109, 41, 50, 0.3);">
            <p style="color: #C9A961; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Gutschein-Wert</p>
            <p style="color: #fff; margin: 10px 0; font-size: 48px; font-family: Georgia, serif; font-weight: 300;">
              CHF ${giftCard.amount.toFixed(2)}
            </p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #C9A961; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ihr Gutschein-Code</p>
              <p style="color: #fff; margin: 10px 0 0 0; font-size: 24px; font-family: monospace; letter-spacing: 3px; font-weight: bold;">
                ${giftCard.code}
              </p>
            </div>
          </div>

          ${giftCard.message
      ? `
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A961; margin: 20px 0;">
            <p style="margin: 0; color: #6D2932; font-style: italic;">
              "${giftCard.message}"
            </p>
            <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">
              - ${giftCard.senderName}
            </p>
          </div>
          `
      : ''
    }

          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #6D2932; margin-top: 0; font-size: 16px;">So lösen Sie Ihren Gutschein ein:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #666;">
              <li style="margin-bottom: 8px;">Besuchen Sie unseren Online-Shop</li>
              <li style="margin-bottom: 8px;">Wählen Sie Ihre Lieblingsweine aus</li>
              <li style="margin-bottom: 8px;">Geben Sie beim Checkout den Gutschein-Code ein</li>
              <li>Geniessen Sie erstklassige Weine!</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/weine" style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 16px; box-shadow: 0 4px 12px rgba(109, 41, 50, 0.3);">
              Jetzt Weine entdecken
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center;">
            Dieser Gutschein ist 3 Jahre gültig und kann für alle Produkte in unserem Shop eingelöst werden.
          </p>

          <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
            Steinbrunnengasse 3a, 5707 Seengen<br>
            Tel: 062 390 04 04 | info@vierkorken.ch
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Vier Korken Wein-Boutique - Geschenkgutschein

${giftCard.recipientName ? `Liebe(r) ${giftCard.recipientName},` : 'Herzlichen Glückwunsch!'}

${giftCard.senderName} hat Ihnen einen Geschenkgutschein geschenkt!

═══════════════════════════════
GUTSCHEIN-WERT: CHF ${giftCard.amount.toFixed(2)}
GUTSCHEIN-CODE: ${giftCard.code}
═══════════════════════════════

${giftCard.message ? `Nachricht: "${giftCard.message}" - ${giftCard.senderName}` : ''}

SO LÖSEN SIE IHREN GUTSCHEIN EIN:
1. Besuchen Sie unseren Online-Shop: ${siteUrl}/weine
2. Wählen Sie Ihre Lieblingsweine aus
3. Geben Sie beim Checkout den Gutschein-Code ein
4. Geniessen Sie erstklassige Weine!

Dieser Gutschein ist 3 Jahre gültig und kann für alle Produkte in unserem Shop eingelöst werden.

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
Steinbrunnengasse 3a, 5707 Seengen
Tel: 062 390 04 04 | info@vierkorken.ch
  `.trim();

  await sendInfoMail({
    to: recipientEmail,
    subject: `Ein Geschenk von ${giftCard.senderName} - Vier Korken Wein-Boutique Gutschein`,
    html,
    text,
  });
}

/**
 * Send event notification email to subscribers
 */
export async function sendEventNotificationEmail(to: string, event: any) {
  // Safe Mode logic:
  // 1. Always active in Development
  // 2. Active in Production if EMAIL_SAFE_MODE env var is set to "true"
  const isSafeMode = process.env.NODE_ENV === 'development' || process.env.EMAIL_SAFE_MODE === 'true';

  // Allowed recipients in Safe Mode
  const isAllowedRecipient =
    to.includes('vierkorken.ch') ||
    to.includes('test') ||
    to.includes('joel') ||
    to.includes('admin');

  if (isSafeMode && !isAllowedRecipient) {
    console.log(`🔒 [SafeMode] Skipping email to ${to} (Safe Mode Active)`);
    return;
  }

  const eventDate = new Date(event.startDateTime).toLocaleDateString('de-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const eventTime = new Date(event.startDateTime).toLocaleTimeString('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${event.title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
          <!-- Header Image -->
          ${event.featuredImage ? `
          <div style="width: 100%; height: 250px; background-image: url('${event.featuredImage}'); background-size: cover; background-position: center; border-radius: 8px 8px 0 0;">
             <div style="width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; box-sizing: border-box;">
                <span style="background-color: #D4AF37; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; align-self: flex-start; margin-bottom: 10px; text-transform: uppercase;">Neues Event</span>
                <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${event.title}</h1>
             </div>
          </div>
          ` : `
          <div style="background-color: #8B4513; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Vier Korken Wein-Boutique</h1>
            <p style="color: #e0e0e0; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Events & Tastings</p>
          </div>
          `}

          <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
            <!-- Event Info Box -->
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #8B4513;">
               <table style="width: 100%; border-collapse: collapse;">
                 <tr>
                   <td style="padding: 5px 0; color: #666; width: 30px;">📅</td>
                   <td style="padding: 5px 0; font-weight: 600; color: #333;">${eventDate}</td>
                 </tr>
                 <tr>
                   <td style="padding: 5px 0; color: #666;">⏰</td>
                   <td style="padding: 5px 0; font-weight: 600; color: #333;">${eventTime} Uhr</td>
                 </tr>
                 <tr>
                   <td style="padding: 5px 0; color: #666;">📍</td>
                   <td style="padding: 5px 0; font-weight: 600; color: #333;">${event.venue}</td>
                 </tr>
                 <tr>
                   <td style="padding: 5px 0; color: #666;">🎟️</td>
                   <td style="padding: 5px 0; font-weight: 600; color: #8B4513;">CHF ${Number(event.price).toFixed(2)}</td>
                 </tr>
               </table>
            </div>

            <h2 style="color: #333; margin-top: 0; font-size: 20px;">${event.subtitle || 'Erleben Sie Wein neu'}</h2>
            
            <div style="color: #555; margin-bottom: 30px; line-height: 1.8;">
              ${event.description ? event.description.substring(0, 300) + '...' : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}" 
                 style="background-color: #8B4513; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 6px rgba(139, 69, 19, 0.2);">
                Jetzt anmelden
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop<br>
              Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe" style="color: #8B4513; text-decoration: underline;">Abmelden</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Vier Korken Wein-Boutique - Neues Event: ${event.title}

${event.subtitle || ''}

Wann: ${eventDate} um ${eventTime} Uhr
Wo: ${event.venue}
Preis: CHF ${Number(event.price).toFixed(2)}

${event.description ? event.description.substring(0, 150) + '...' : ''}

Jetzt anmelden: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}

© ${new Date().getFullYear()} Vier Korken Wein-Boutique - Premium Weinshop
  `.trim();

  await sendInfoMail({
    to,
    subject: `🥂 Neues Event: ${event.title}`,
    html,
    text,
  });
}
