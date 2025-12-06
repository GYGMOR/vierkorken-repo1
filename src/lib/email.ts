import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  firstName: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"VIERKORKEN" <noreply@vierkorken.ch>',
    to,
    subject: 'Passwort zurücksetzen - VIERKORKEN',
    html: `
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

            <p>Hallo ${firstName ? firstName : ''},</p>

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
              Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht darauf.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Passwort zurücksetzen - VIERKORKEN

Hallo ${firstName ? firstName : ''},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Verwenden Sie den folgenden Link, um ein neues Passwort zu erstellen:

${resetUrl}

Dieser Link ist nur 1 Stunde gültig.

Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', to);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email (optional - for future use)
 */
export async function sendWelcomeEmail(to: string, firstName: string) {
  // Implementation for welcome email
  // ...
}

/**
 * Send contact form inquiry to admin
 */
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const adminEmail = process.env.EMAIL_USER || 'info@vierkorken.ch';

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"VIERKORKEN" <noreply@vierkorken.ch>',
    to: adminEmail,
    replyTo: email, // Allow admin to reply directly to sender
    subject: `Kontaktanfrage: ${subject}`,
    html: `
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
    `,
    text: `
VIERKORKEN - Neue Kontaktanfrage

KONTAKTDATEN:
Name: ${name}
E-Mail: ${email}
Betreff: ${subject}

NACHRICHT:
${message}

Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.

© ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    throw new Error('Failed to send contact form email');
  }
}

/**
 * Generate PDF invoice buffer using the existing invoice generator
 * NOTE: This is disabled due to PDFKit font issues in Next.js
 */
async function generateInvoicePDF_DISABLED(orderId: string): Promise<Buffer> {
  // Import the PDF generation logic from the invoice route
  const PDFDocument = (await import('pdfkit')).default;
  const { prisma } = await import('@/lib/prisma');

  // Fetch order from database
  const dbOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
    },
  });

  if (!dbOrder) {
    throw new Error('Order not found');
  }

  // Parse JSON addresses
  const shippingAddress = dbOrder.shippingAddress as any;
  const billingAddress = dbOrder.billingAddress as any;

  // Transform to format expected by PDF generator
  const order = {
    orderNumber: dbOrder.orderNumber,
    date: dbOrder.createdAt.toISOString().split('T')[0],
    customerFirstName: dbOrder.customerFirstName,
    customerLastName: dbOrder.customerLastName,
    billingAddress: {
      company: billingAddress?.company || '',
      firstName: billingAddress?.firstName || dbOrder.customerFirstName,
      lastName: billingAddress?.lastName || dbOrder.customerLastName,
      street: billingAddress?.street || '',
      streetNumber: billingAddress?.streetNumber || '',
      postalCode: billingAddress?.postalCode || '',
      city: billingAddress?.city || '',
      country: billingAddress?.country || 'Schweiz',
    },
    items: dbOrder.items.map(item => ({
      wineName: item.wineName,
      winery: item.winery,
      vintage: item.vintage || 0,
      bottleSize: Number(item.bottleSize),
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    subtotal: Number(dbOrder.subtotal),
    shippingCost: Number(dbOrder.shippingCost),
    taxAmount: Number(dbOrder.taxAmount),
    taxRate: 8.1,
    total: Number(dbOrder.total),
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Create PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  // Company Header (no bold fonts, just normal)
  doc
    .fontSize(24)
    .text('VIERKORKEN', 50, 50);

  doc
    .fontSize(10)
    .text('Premium Weinshop', 50, 80)
    .text('Musterstrasse 1', 50, 95)
    .text('8000 Zürich', 50, 110)
    .text('Schweiz', 50, 125)
    .text('info@vierkorken.ch', 50, 140)
    .text('www.vierkorken.ch', 50, 155);

  // Invoice Title
  doc
    .fontSize(20)
    .text('RECHNUNG', 50, 220);

  // Invoice Info
  doc
    .fontSize(10)
    .text(`Rechnungsnummer: ${order.orderNumber}`, 50, 250)
    .text(`Datum: ${formatDate(order.date)}`, 50, 265);

  // Billing Address
  doc
    .fontSize(12)
    .text('Rechnungsadresse:', 350, 220);

  doc.fontSize(10);

  let yPos = 240;
  if (order.billingAddress.company) {
    doc.text(order.billingAddress.company, 350, yPos);
    yPos += 15;
  }
  doc
    .text(`${order.billingAddress.firstName} ${order.billingAddress.lastName}`, 350, yPos)
    .text(`${order.billingAddress.street} ${order.billingAddress.streetNumber}`, 350, yPos + 15)
    .text(`${order.billingAddress.postalCode} ${order.billingAddress.city}`, 350, yPos + 30)
    .text(order.billingAddress.country, 350, yPos + 45);

  // Items Table
  const tableTop = 350;
  doc.fontSize(10);

  // Table Header
  doc
    .text('Artikel', 50, tableTop)
    .text('Menge', 300, tableTop, { width: 50, align: 'right' })
    .text('Einzelpreis', 370, tableTop, { width: 80, align: 'right' })
    .text('Gesamt', 470, tableTop, { width: 80, align: 'right' });

  // Line under header
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Table Items
  let yPosition = tableTop + 25;

  order.items.forEach((item) => {
    doc
      .text(
        `${item.wineName}\n${item.winery} • ${item.vintage} • ${item.bottleSize}l`,
        50,
        yPosition,
        { width: 240 }
      )
      .text(item.quantity.toString(), 300, yPosition, { width: 50, align: 'right' })
      .text(formatPrice(item.unitPrice), 370, yPosition, { width: 80, align: 'right' })
      .text(formatPrice(item.totalPrice), 470, yPosition, { width: 80, align: 'right' });

    yPosition += 45;
  });

  // Totals
  yPosition += 20;
  doc
    .moveTo(350, yPosition)
    .lineTo(550, yPosition)
    .stroke();

  yPosition += 15;

  doc
    .text('Zwischensumme:', 350, yPosition)
    .text(formatPrice(order.subtotal), 470, yPosition, { width: 80, align: 'right' });

  yPosition += 20;
  doc
    .text('Versand:', 350, yPosition)
    .text(formatPrice(order.shippingCost), 470, yPosition, { width: 80, align: 'right' });

  yPosition += 20;
  doc
    .text(`MwSt. (${order.taxRate}%):`, 350, yPosition)
    .text(formatPrice(order.taxAmount), 470, yPosition, { width: 80, align: 'right' });

  yPosition += 25;
  doc
    .moveTo(350, yPosition)
    .lineTo(550, yPosition)
    .stroke();

  yPosition += 15;
  doc
    .fontSize(12)
    .text('Gesamtbetrag:', 350, yPosition)
    .text(formatPrice(order.total), 470, yPosition, { width: 80, align: 'right' });

  // Footer
  doc
    .fontSize(8)
    .text(
      'Zahlungsbedingungen: Innerhalb von 30 Tagen ohne Abzug.\nVielen Dank für Ihren Einkauf!',
      50,
      750,
      { align: 'center', width: 500 }
    );

  // Finalize PDF
  doc.end();

  // Wait for PDF to be generated
  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

/**
 * Send order confirmation email with link to PDF invoice
 */
export async function sendOrderConfirmationEmail(to: string, orderId: string, orderDetails: any) {
  try {
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

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VIERKORKEN" <noreply@vierkorken.ch>',
      to,
      subject: `Bestellbestätigung - ${orderDetails.orderNumber}`,
      html: `
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
      `,
      text: `
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
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw new Error('Failed to send order confirmation email');
  }
}

/**
 * Send new order notification to admin/vendor
 */
export async function sendNewOrderNotificationToAdmin(orderId: string, orderDetails: any) {
  try {
    const adminEmail = process.env.EMAIL_USER || 'info@vierkorken.ch';

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

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VIERKORKEN" <noreply@vierkorken.ch>',
      to: adminEmail,
      subject: `🔔 Neue Bestellung - ${orderDetails.orderNumber}`,
      html: `
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
      `,
      text: `
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
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Order notification sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    // Don't throw error - admin notification is not critical
  }
}
