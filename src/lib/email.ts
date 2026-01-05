/**
 * Microsoft Graph API E-Mail System
 *
 * Verwendet Microsoft Graph API statt SMTP für E-Mail-Versand
 * Vorteil: Keine SMTP-Probleme, moderne OAuth2 Authentifizierung, funktioniert mit Security Defaults
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

// ============================================================
// Microsoft Graph API Konfiguration
// ============================================================
const MS_TENANT_ID = process.env.MS_TENANT_ID || '';
const MS_CLIENT_ID = process.env.MS_CLIENT_ID || '';
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET || '';
const MAIL_FROM_INFO = process.env.MAIL_FROM_INFO || 'info@vierkorken.ch';
const MAIL_FROM_NOREPLY = process.env.MAIL_FROM_NOREPLY || 'no-reply@vierkorken.ch';

// Timeout für E-Mail-Versand (Standard: 10 Sekunden)
const EMAIL_TIMEOUT = parseInt(process.env.EMAIL_TIMEOUT || '10000', 10);

/**
 * Timeout Promise Wrapper für schnellere Fehlerbehandlung
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// Graph API Client erstellen
function getGraphClient() {
  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET) {
    throw new Error('Microsoft Graph API credentials missing. Check MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET in .env');
  }

  const credential = new ClientSecretCredential(
    MS_TENANT_ID,
    MS_CLIENT_ID,
    MS_CLIENT_SECRET
  );

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const tokenPromise = credential.getToken('https://graph.microsoft.com/.default');
        const token = await withTimeout(
          tokenPromise,
          5000,
          'Microsoft Graph API token request timed out after 5s'
        );
        return token?.token || '';
      },
    },
  });

  return client;
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
}) {
  const client = getGraphClient();

  const message = {
    message: {
      subject: options.subject,
      body: {
        contentType: 'HTML',
        content: options.html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: options.to,
          },
        },
      ],
      replyTo: options.replyTo
        ? [
            {
              emailAddress: {
                address: options.replyTo,
              },
            },
          ]
        : undefined,
    },
    saveToSentItems: true,
  };

  try {
    const startTime = Date.now();
    console.log('📧 Sending info-mail to:', options.to, 'subject:', options.subject);

    const sendPromise = client
      .api(`/users/${MAIL_FROM_INFO}/sendMail`)
      .post(message);

    await withTimeout(
      sendPromise,
      EMAIL_TIMEOUT,
      `Email sending timed out after ${EMAIL_TIMEOUT}ms`
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Info-Mail sent to: ${options.to} from: ${MAIL_FROM_INFO} (${duration}ms)`);
  } catch (error: any) {
    console.error('❌ Error sending info-mail:', error.message);
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
  const client = getGraphClient();

  const message = {
    message: {
      subject: options.subject,
      body: {
        contentType: 'HTML',
        content: options.html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: options.to,
          },
        },
      ],
      replyTo: [
        {
          emailAddress: {
            address: MAIL_FROM_INFO, // Antworten gehen an info@, falls jemand doch antwortet
          },
        },
      ],
    },
    saveToSentItems: true,
  };

  try {
    const startTime = Date.now();
    console.log('📧 Sending no-reply-mail to:', options.to, 'subject:', options.subject);

    const sendPromise = client
      .api(`/users/${MAIL_FROM_NOREPLY}/sendMail`)
      .post(message);

    await withTimeout(
      sendPromise,
      EMAIL_TIMEOUT,
      `Email sending timed out after ${EMAIL_TIMEOUT}ms`
    );

    const duration = Date.now() - startTime;
    console.log(`✅ No-Reply-Mail sent to: ${options.to} from: ${MAIL_FROM_NOREPLY} (${duration}ms)`);
  } catch (error: any) {
    console.error('❌ Error sending no-reply-mail:', error.message);
    throw new Error(`Failed to send no-reply-mail: ${error.message}`);
  }
}

// ============================================================
// E-Mail Templates & Funktionen
// ============================================================

/**
 * Send password reset email (verwendet info@vierkorken.ch)
 * WICHTIG: Wir verwenden info@ statt no-reply@ für bessere Zustellbarkeit
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
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">VIERKORKEN</h1>
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
              © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
              Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
Passwort zurücksetzen - VIERKORKEN

Hallo ${firstName || ''},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Verwenden Sie den folgenden Link, um ein neues Passwort zu erstellen:

${resetUrl}

Dieser Link ist nur 1 Stunde gültig.

Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
Bei Fragen: info@vierkorken.ch
    `.trim();

  // Verwenden info@ statt no-reply@ für bessere Zustellbarkeit
  await sendInfoMail({
    to,
    subject: 'Passwort zurücksetzen - VIERKORKEN',
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
          <title>Kontaktanfrage</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">VIERKORKEN</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Neue Kontaktanfrage</h2>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin-top: 0;">Kontaktdaten</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>E-Mail:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Betreff:</strong> ${subject}</p>
            </div>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Nachricht</h3>
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Hinweis:</strong> Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
              Diese E-Mail wurde automatisch vom Kontaktformular generiert.
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
VIERKORKEN - Neue Kontaktanfrage

KONTAKTDATEN:
Name: ${name}
E-Mail: ${email}
Betreff: ${subject}

NACHRICHT:
${message}

Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
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
 * Send order confirmation email with link to PDF invoice (verwendet info@vierkorken.ch)
 */
export async function sendOrderConfirmationEmail(to: string, orderId: string, orderDetails: any) {
  // Create invoice download link instead of attaching PDF
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/${orderId}/invoice`;

  // Format items list for email
  const itemsList = orderDetails.items
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.wineName} (${item.winery}, ${item.vintage || 'N/A'}, ${item.bottleSize}l) - CHF ${Number(item.totalPrice).toFixed(2)}`
    )
    .join('\n');

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
              <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">VIERKORKEN</h1>
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

              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>📎 Rechnung herunterladen</strong><br>
                  Sie können Ihre Rechnung jederzeit als PDF herunterladen.
                </p>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${invoiceUrl}" style="background-color: #28a745; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                  📄 Rechnung als PDF herunterladen
                </a>
              </div>

              <h3 style="color: #333;">Nächste Schritte:</h3>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Wir bereiten Ihre Bestellung sorgfältig vor</li>
                <li style="margin-bottom: 10px;">Sie erhalten eine Versandbestätigung, sobald Ihre Bestellung unterwegs ist</li>
                <li style="margin-bottom: 10px;">Die Lieferung erfolgt innerhalb von 3-5 Werktagen</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/konto/bestellungen" style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                  Bestellung verfolgen
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
                Musterstrasse 1, 8000 Zürich, Schweiz<br>
                info@vierkorken.ch | www.vierkorken.ch<br><br>
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt darauf.<br>
                Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
              </p>
            </div>
          </body>
        </html>
      `;

  const text = `
VIERKORKEN - Bestellbestätigung

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

RECHNUNG HERUNTERLADEN:
${invoiceUrl}

NÄCHSTE SCHRITTE:
1. Wir bereiten Ihre Bestellung sorgfältig vor
2. Sie erhalten eine Versandbestätigung, sobald Ihre Bestellung unterwegs ist
3. Die Lieferung erfolgt innerhalb von 3-5 Werktagen

Bestellung verfolgen: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/konto/bestellungen

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
Musterstrasse 1, 8000 Zürich, Schweiz
info@vierkorken.ch | www.vierkorken.ch

Bei Fragen kontaktieren Sie uns unter info@vierkorken.ch
      `.trim();

  await sendInfoMail({
    to,
    subject: `Bestellbestätigung - ${orderDetails.orderNumber}`,
    html,
    text,
  });
}

/**
 * Send new order notification to admin/vendor (verwendet info@vierkorken.ch)
 */
export async function sendNewOrderNotificationToAdmin(orderId: string, orderDetails: any) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@vierkorken.ch';

  // Format items list for email
  const itemsList = orderDetails.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${item.quantity}x ${item.wineName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">CHF ${Number(item.totalPrice).toFixed(2)}</td>
        </tr>`
    )
    .join('');

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
              <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">VIERKORKEN</h1>
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
                © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
                Diese E-Mail wurde automatisch generiert.
              </p>
            </div>
          </body>
        </html>
      `;

  const text = `
VIERKORKEN - Neue Bestellung

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
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">VIERKORKEN</h1>
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
                <li>Exklusive Weine aus aller Welt</li>
                <li>Persönliche Beratung durch unsere Sommeliers</li>
                <li>Schneller und sicherer Versand</li>
                <li>Besondere Angebote für Stammkunden</li>
              </ul>
            </div>

            <p>Wir melden uns bei Ihnen, sobald es soweit ist!</p>

            <p style="margin-top: 30px;">
              Mit besten Grüßen,<br>
              <strong style="color: #6D2932;">Ihr VIERKORKEN Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
VIERKORKEN - Premium Weinshop

Vielen Dank für Ihr Interesse!

Wir freuen uns sehr über Ihr Interesse an unserem Premium-Weinshop.

Unser Team arbeitet gerade an spannenden Updates, um Ihnen das beste Einkaufserlebnis zu bieten. Sie gehören zu den Ersten, die benachrichtigt werden, sobald wir wieder online sind.

Was Sie erwarten können:
• Exklusive Weine aus aller Welt
• Persönliche Beratung durch unsere Sommeliers
• Schneller und sicherer Versand
• Besondere Angebote für Stammkunden

Wir melden uns bei Ihnen, sobald es soweit ist!

Mit besten Grüßen,
Ihr VIERKORKEN Team

---
© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: 'Vielen Dank für Ihr Interesse an VIERKORKEN',
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
            <h1 style="color: #fff; margin: 0; font-size: 36px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">VIERKORKEN</h1>
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
                <li style="margin-bottom: 10px;">Über 500 exklusive Weine aus aller Welt</li>
                <li style="margin-bottom: 10px;">Persönliche Beratung durch Sommeliers</li>
                <li style="margin-bottom: 10px;">Kostenloser Versand ab CHF 150</li>
                <li style="margin-bottom: 10px;">Sichere Zahlung mit Stripe oder Klara</li>
              </ul>
            </div>

            <p>Wir freuen uns darauf, Sie bei VIERKORKEN begrüßen zu dürfen!</p>

            <p style="margin-top: 30px;">
              Prost und beste Grüße,<br>
              <strong style="color: #6D2932;">Ihr VIERKORKEN Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a> |
              <a href="${siteUrl}" style="color: #6D2932; text-decoration: none;">www.vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
VIERKORKEN - Premium Weinshop

Wir sind jetzt online!

Willkommen zurück!

Es ist soweit – unser Premium-Weinshop ist wieder online und besser als je zuvor!

Als einer unserer geschätzten Interessenten laden wir Sie ein, unsere Auswahl an exklusiven Weinen zu entdecken.

Jetzt Shop besuchen: ${siteUrl}

BESONDERE HIGHLIGHTS:
• Über 500 exklusive Weine aus aller Welt
• Persönliche Beratung durch Sommeliers
• Kostenloser Versand ab CHF 150
• Sichere Zahlung mit Stripe oder Klara

Wir freuen uns darauf, Sie bei VIERKORKEN begrüßen zu dürfen!

Prost und beste Grüße,
Ihr VIERKORKEN Team

---
© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
info@vierkorken.ch | ${siteUrl}
    `.trim();

  await sendInfoMail({
    to,
    subject: '🎉 VIERKORKEN ist jetzt online!',
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
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">VIERKORKEN</h1>
            <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
          </div>

          <div style="background-color: #FAF8F5; padding: 40px 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #6D2932; margin-top: 0; font-family: Georgia, serif; font-weight: 300; font-size: 24px;">
              Willkommen beim VIERKORKEN Newsletter!
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
              <strong style="color: #6D2932;">Ihr VIERKORKEN Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #E8E3DF; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.<br>
              <a href="${unsubscribeUrl}" style="color: #6D2932; text-decoration: underline;">Newsletter abbestellen</a>
            </p>

            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
VIERKORKEN - Premium Weinshop

Willkommen beim VIERKORKEN Newsletter!

Vielen Dank für Ihr Interesse an unserem Newsletter. Sie sind jetzt angemeldet und erhalten ab sofort:

• Neuigkeiten & Ankündigungen - Erfahren Sie als Erster von neuen Produkten und Updates
• Exklusive Angebote - Besondere Rabatte nur für Newsletter-Abonnenten
• Wein-Empfehlungen - Persönliche Tipps von unseren Sommeliers
• Event-Einladungen - Zugang zu Verkostungen und Veranstaltungen

TIPP: Erstellen Sie jetzt einen Account und sammeln Sie Treuepunkte bei jedem Einkauf!
Account erstellen: ${siteUrl}/registrieren?email=${encodeURIComponent(to)}

Wir freuen uns, Sie auf dem Laufenden zu halten!

Prost und beste Grüße,
Ihr VIERKORKEN Team

---
Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.
Newsletter abbestellen: ${unsubscribeUrl}

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: 'Willkommen beim VIERKORKEN Newsletter',
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
          <!-- Header with VIERKORKEN branding -->
          <div style="background: linear-gradient(135deg, #6D2932 0%, #8B4155 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 3px; font-family: Georgia, serif;">VIERKORKEN</h1>
            <div style="margin-top: 12px; height: 1px; width: 80px; background: linear-gradient(to right, transparent, #C9A961, transparent); margin-left: auto; margin-right: auto;"></div>
            <p style="color: #FAF8F5; margin-top: 15px; margin-bottom: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Neue Neuigkeiten</p>
          </div>

          <!-- News Content -->
          <div style="background-color: #fff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            ${news.featuredImage ? `
              <img src="${news.featuredImage}" alt="${news.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 25px; display: block;">
            ` : ''}

            <h2 style="color: #6D2932; font-size: 24px; margin-top: 0; font-family: Georgia, serif; font-weight: 400; line-height: 1.3;">
              ${news.title}
            </h2>

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
              © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
              <a href="mailto:info@vierkorken.ch" style="color: #6D2932; text-decoration: none;">info@vierkorken.ch</a>
            </p>
          </div>
        </body>
      </html>
    `;

  const text = `
VIERKORKEN - Premium Weinshop

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

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
info@vierkorken.ch
    `.trim();

  await sendInfoMail({
    to,
    subject: `Neue News: ${news.title}`,
    html,
    text,
  });
}
