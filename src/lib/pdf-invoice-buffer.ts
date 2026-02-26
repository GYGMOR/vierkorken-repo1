import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface OrderItem {
  wineName: string;
  winery: string;
  vintage: number | null;
  bottleSize: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface EventTicketItem {
  ticketNumber: string;
  eventTitle: string;
  eventDate: string;
  price: number;
  holderName?: string;
}

interface Address {
  company?: string;
  firstName: string;
  lastName: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

interface OrderForPDF {
  orderNumber: string;
  date: string | Date;
  customerFirstName: string;
  customerLastName: string;
  billingAddress: Address;
  items: OrderItem[];
  tickets?: EventTicketItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  taxRate: number;
  total: number;
}

/**
 * Generate PDF invoice as Buffer (for email attachments)
 * Uses pdf-lib which works in serverless environments (no external font files needed)
 */
export async function generateInvoicePDFBuffer(order: OrderForPDF): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed standard fonts (these are built-in, no external files needed)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add a page (A4 size: 595.28 x 841.89 points)
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const burgundy = rgb(0.545, 0.271, 0.075); // #8B4513

  let y = height - 50; // Start from top

  // ===== COMPANY HEADER =====
  page.drawText('Vier Korken Wein-Boutique', {
    x: 50,
    y: y,
    size: 24,
    font: helveticaBold,
    color: burgundy,
  });

  y -= 30;
  const companyInfo = [
    'Premium Weinshop',
    'Steinbrunnengasse 3a',
    '5707 Seengen',
    'Tel: 062 390 04 04',
    'info@vierkorken.ch',
    'www.vierkorken.ch',
    'MWST NR.: CHE-471.048.672 MWST'
  ];

  // Try to embed Logo in top right
  try {
    let logoImageBytes;

    // First try fetch (works best in serverless environments for public assets)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      const res = await fetch(`${baseUrl}/images/layout/logo_text.png`);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        logoImageBytes = Buffer.from(arrayBuffer);
      }
    } catch (e) {
      // Ignore fetch error, fallback to fs
    }

    // Fallback to local FS
    if (!logoImageBytes) {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'layout', 'logo_text.png');
      if (fs.existsSync(logoPath)) {
        logoImageBytes = fs.readFileSync(logoPath);
      }
    }

    if (logoImageBytes) {
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      // Determine scale to fit in a reasonable header space
      // Max width 150px, max height 60px
      const maxW = 150;
      const maxH = 60;
      let ratio = 1;
      if (logoImage.width > maxW || logoImage.height > maxH) {
        ratio = Math.min(maxW / logoImage.width, maxH / logoImage.height);
      }
      const logoDims = logoImage.scale(ratio);

      page.drawImage(logoImage, {
        x: width - logoDims.width - 50,
        y: height - logoDims.height - 40,
        width: logoDims.width,
        height: logoDims.height,
      });
    }
  } catch (err) {
    console.warn("Could not load logo for PDF:", err);
  }

  for (const line of companyInfo) {
    page.drawText(line, {
      x: 50,
      y: y,
      size: 10,
      font: helvetica,
      color: gray,
    });
    y -= 14;
  }

  // ===== INVOICE TITLE =====
  y = height - 180;
  page.drawText('RECHNUNG', {
    x: 50,
    y: y,
    size: 20,
    font: helveticaBold,
    color: black,
  });

  // ===== INVOICE INFO =====
  y -= 30;
  const dateStr = typeof order.date === 'string' ? order.date : order.date.toISOString().split('T')[0];

  page.drawText(`Rechnungsnummer: ${order.orderNumber}`, {
    x: 50,
    y: y,
    size: 10,
    font: helvetica,
    color: black,
  });

  y -= 15;
  page.drawText(`Datum: ${formatDate(dateStr)}`, {
    x: 50,
    y: y,
    size: 10,
    font: helvetica,
    color: black,
  });

  // ===== BILLING ADDRESS (right side) =====
  let addressY = height - 180;
  page.drawText('Rechnungsadresse:', {
    x: 350,
    y: addressY,
    size: 12,
    font: helveticaBold,
    color: black,
  });

  addressY -= 20;

  if (order.billingAddress.company) {
    page.drawText(order.billingAddress.company, {
      x: 350,
      y: addressY,
      size: 10,
      font: helvetica,
      color: black,
    });
    addressY -= 14;
  }

  const addressLines = [
    `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
    `${order.billingAddress.street} ${order.billingAddress.streetNumber}`,
    `${order.billingAddress.postalCode} ${order.billingAddress.city}`,
    order.billingAddress.country,
  ];

  for (const line of addressLines) {
    page.drawText(line, {
      x: 350,
      y: addressY,
      size: 10,
      font: helvetica,
      color: black,
    });
    addressY -= 14;
  }

  // ===== ITEMS TABLE =====
  y = height - 350;

  // Table header
  page.drawText('Artikel', { x: 50, y, size: 10, font: helveticaBold, color: black });
  page.drawText('Menge', { x: 320, y, size: 10, font: helveticaBold, color: black });
  page.drawText('Einzelpreis', { x: 380, y, size: 10, font: helveticaBold, color: black });
  page.drawText('Gesamt', { x: 480, y, size: 10, font: helveticaBold, color: black });

  // Line under header
  y -= 5;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: gray,
  });

  y -= 20;

  // Table items
  for (const item of order.items) {
    // Wine name
    page.drawText(truncateText(item.wineName, 35), {
      x: 50,
      y,
      size: 10,
      font: helveticaBold,
      color: black,
    });

    // Wine details
    y -= 12;
    const details = `${item.winery} • ${item.vintage || 'N/A'} • ${item.bottleSize}l`;
    page.drawText(truncateText(details, 40), {
      x: 50,
      y,
      size: 9,
      font: helvetica,
      color: gray,
    });

    // Quantity, price, total (on the first line of item)
    page.drawText(item.quantity.toString(), {
      x: 330,
      y: y + 12,
      size: 10,
      font: helvetica,
      color: black,
    });

    page.drawText(formatPrice(item.unitPrice), {
      x: 380,
      y: y + 12,
      size: 10,
      font: helvetica,
      color: black,
    });

    page.drawText(formatPrice(item.totalPrice), {
      x: 480,
      y: y + 12,
      size: 10,
      font: helvetica,
      color: black,
    });

    y -= 25;
  }

  // ===== EVENT TICKETS SECTION =====
  if (order.tickets && order.tickets.length > 0) {
    y -= 10;

    // Section header for tickets
    page.drawText('Event-Tickets', { x: 50, y, size: 10, font: helveticaBold, color: burgundy });
    y -= 15;

    // Line under tickets header
    page.drawLine({
      start: { x: 50, y: y + 5 },
      end: { x: 545, y: y + 5 },
      thickness: 0.5,
      color: burgundy,
    });

    y -= 5;

    for (const ticket of order.tickets) {
      // Event title
      page.drawText(truncateText(ticket.eventTitle, 35), {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: black,
      });

      // Ticket details
      y -= 12;
      const ticketDetails = `Ticket: ${ticket.ticketNumber} - ${ticket.eventDate}`;
      page.drawText(truncateText(ticketDetails, 50), {
        x: 50,
        y,
        size: 9,
        font: helvetica,
        color: gray,
      });

      // Quantity (1 per ticket) and price
      page.drawText('1', {
        x: 330,
        y: y + 12,
        size: 10,
        font: helvetica,
        color: black,
      });

      page.drawText(formatPrice(ticket.price), {
        x: 380,
        y: y + 12,
        size: 10,
        font: helvetica,
        color: black,
      });

      page.drawText(formatPrice(ticket.price), {
        x: 480,
        y: y + 12,
        size: 10,
        font: helvetica,
        color: black,
      });

      y -= 25;
    }
  }

  // ===== TOTALS =====
  y -= 20;

  // Line above totals
  page.drawLine({
    start: { x: 350, y: y + 10 },
    end: { x: 545, y: y + 10 },
    thickness: 1,
    color: gray,
  });

  // Subtotal
  page.drawText('Zwischensumme:', { x: 350, y, size: 10, font: helvetica, color: black });
  page.drawText(formatPrice(order.subtotal), { x: 480, y, size: 10, font: helvetica, color: black });

  y -= 18;
  page.drawText('Versand:', { x: 350, y, size: 10, font: helvetica, color: black });
  page.drawText(formatPrice(order.shippingCost), { x: 480, y, size: 10, font: helvetica, color: black });

  y -= 18;
  page.drawText(`MwSt. (${order.taxRate}%):`, { x: 350, y, size: 10, font: helvetica, color: black });
  page.drawText(formatPrice(order.taxAmount), { x: 480, y, size: 10, font: helvetica, color: black });

  y -= 10;
  // Line above total
  page.drawLine({
    start: { x: 350, y },
    end: { x: 545, y },
    thickness: 2,
    color: burgundy,
  });

  y -= 18;
  page.drawText('Gesamtbetrag:', { x: 350, y, size: 12, font: helveticaBold, color: black });
  page.drawText(formatPrice(order.total), { x: 480, y, size: 12, font: helveticaBold, color: burgundy });

  // ===== FOOTER =====
  page.drawText('Zahlungsbedingungen: Innerhalb von 30 Tagen ohne Abzug.', {
    x: 50,
    y: 80,
    size: 8,
    font: helvetica,
    color: gray,
  });

  page.drawText('Vielen Dank für Ihren Einkauf bei Vier Korken Wein-Boutique!', {
    x: 50,
    y: 65,
    size: 8,
    font: helvetica,
    color: gray,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}

function formatPrice(price: number): string {
  return `CHF ${Number(price).toFixed(2)}`;
}

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
