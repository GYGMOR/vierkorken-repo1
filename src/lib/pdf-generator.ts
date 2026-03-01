import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Removed duplicate - now defined below with gift fields

interface EventTicket {
  ticketNumber: string;
  price: number;
  event?: {
    title: string;
    subtitle?: string;
    startDateTime: string | Date;
    venue: string;
  };
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
  phone?: string;
}

interface OrderItem {
  wineName: string;
  winery: string;
  vintage: number;
  bottleSize: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isGift?: boolean;
  giftWrap?: boolean;
  giftMessage?: string;
}

interface Order {
  orderNumber: string;
  date: string;
  billingAddress: Address;
  shippingAddress?: Address;
  items: OrderItem[];
  eventTickets?: EventTicket[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  customerFirstName?: string;
  customerLastName?: string;
  deliveryMethod?: 'SHIPPING' | 'PICKUP';
  paymentMethod?: string;
  customerNote?: string;
}

export async function buildInvoiceDoc(order: Order, logoBase64?: string): Promise<jsPDF> {
  const doc = new jsPDF();

  // Helper functions
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

  // Colors
  const primaryColor = '#6B1B29'; // Burgundy
  const grayColor = '#4A4A4A';

  // Company Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Vier Korken Wein-Boutique', 20, 25);

  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Weinshop', 20, 32);
  doc.text('Steinbrunnengasse 3a', 20, 37);
  doc.text('5707 Seengen', 20, 42);
  doc.text('Tel: 062 390 04 04', 20, 47);
  doc.text('info@vierkorken.ch', 20, 52);
  doc.text('www.vierkorken.ch', 20, 57);
  doc.text('MWST NR.: CHE-471.048.672 MWST', 20, 62);

  if (logoBase64) {
    try {
      // Add icon to top right corner, properly sized, not squashed.
      // Icon is usually square or tall. 25x25 is safe.
      doc.addImage(logoBase64, 'PNG', 165, 15, 25, 25);
    } catch (err) {
      console.warn('Could not add logo to PDF:', err);
    }
  }

  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('RECHNUNG', 20, 85);

  // Invoice Info
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rechnungsnummer: ${order.orderNumber}`, 20, 95);
  doc.text(`Datum: ${formatDate(order.date)}`, 20, 101);

  // Billing Address - Move it down to prevent squishing
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rechnungsadresse:', 120, 85);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 93;

  // Handle billing address safely (might be empty object)
  const billingAddress = order.billingAddress || {};

  if (billingAddress.company) {
    doc.setFont('helvetica', 'bold');
    doc.text(billingAddress.company, 120, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
  }

  if (billingAddress.firstName || billingAddress.lastName) {
    doc.text(`${billingAddress.firstName || ''} ${billingAddress.lastName || ''}`.trim(), 120, yPos);
  } else {
    doc.text(`${order.customerFirstName} ${order.customerLastName}`, 120, yPos);
  }

  if (billingAddress.street || billingAddress.streetNumber) {
    doc.text(`${billingAddress.street || ''} ${billingAddress.streetNumber || ''}`.trim(), 120, yPos + 6);
  }

  if (billingAddress.postalCode || billingAddress.city) {
    doc.text(`${billingAddress.postalCode || ''} ${billingAddress.city || ''}`.trim(), 120, yPos + 12);
  }

  if (billingAddress.country) {
    doc.text(billingAddress.country, 120, yPos + 18);
  }

  // Shipping Address Y-Position adjustment to push the rest of the content down
  let currentY = 135;

  // Shipping Address (if different from billing or if pickup)
  if (order.shippingAddress) {
    currentY += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);

    // Explicitly add delivery method line before the address block
    doc.text(`Liefermethode: ${order.deliveryMethod === 'PICKUP' ? 'Abholung in Seengen' : 'Postversand'}`, 20, currentY);
    currentY += 8;

    doc.text(order.deliveryMethod === 'PICKUP' ? 'Abholadresse:' : 'Lieferadresse:', 20, currentY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor);

    let shippingY = currentY + 7;

    if (order.deliveryMethod === 'PICKUP') {
      doc.text('Vier Korken Wein-Boutique', 20, shippingY);
      shippingY += 5;
      doc.text('Steinbrunnengasse 3a', 20, shippingY);
      shippingY += 5;
      doc.text('5707 Seengen', 20, shippingY);
      shippingY += 5;
      doc.text('Schweiz', 20, shippingY);
      shippingY += 5;
      doc.text(`Kontakt: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 20, shippingY);
      if (order.shippingAddress.phone) {
        shippingY += 5;
        doc.text(`Tel: ${order.shippingAddress.phone}`, 20, shippingY);
      }
    } else {
      if (order.shippingAddress.firstName || order.shippingAddress.lastName) {
        doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 20, shippingY);
        shippingY += 5;
      }
      if (order.shippingAddress.street || order.shippingAddress.streetNumber) {
        doc.text(`${order.shippingAddress.street} ${order.shippingAddress.streetNumber}`, 20, shippingY);
        shippingY += 5;
      }
      if (order.shippingAddress.postalCode || order.shippingAddress.city) {
        doc.text(`${order.shippingAddress.postalCode} ${order.shippingAddress.city}`, 20, shippingY);
        shippingY += 5;
      }
      if (order.shippingAddress.country) {
        doc.text(order.shippingAddress.country, 20, shippingY);
        shippingY += 5;
      }
    }

    currentY = shippingY + 5;
  }

  // Payment Method
  if (order.paymentMethod) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor);
    const paymentText = order.paymentMethod === 'cash' ? 'Zahlungsart: Barzahlung (bei Abholung)' :
      order.paymentMethod === 'card' ? 'Zahlungsart: Kreditkarte' :
        order.paymentMethod === 'twint' ? 'Zahlungsart: TWINT' :
          `Zahlungsart: ${order.paymentMethod}`;
    doc.text(paymentText, 20, currentY);
    currentY += 8;
  }

  currentY += 5;

  // Wine Items Table (if any)
  if (order.items && order.items.length > 0) {
    const wineTableData = order.items.map((item) => [
      `${item.wineName}\n${item.winery} • ${item.vintage} • ${item.bottleSize}l`,
      item.quantity.toString(),
      formatPrice(item.unitPrice),
      formatPrice(item.totalPrice),
    ]);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Weine', 20, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['Artikel', 'Menge', 'Einzelpreis', 'Gesamt']],
      body: wineTableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: '#FFFFFF',
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: grayColor,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Event Tickets Table (if any)
  if (order.eventTickets && order.eventTickets.length > 0) {
    const eventTableData = order.eventTickets.map((ticket) => {
      const eventDate = ticket.event?.startDateTime
        ? formatDate(new Date(ticket.event.startDateTime).toISOString())
        : '';
      const eventInfo = ticket.event
        ? `${ticket.event.title}\n${eventDate} • ${ticket.event.venue}`
        : ticket.ticketNumber;

      return [
        eventInfo,
        '1',
        formatPrice(Number(ticket.price)),
        formatPrice(Number(ticket.price)),
      ];
    });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Event-Tickets', 20, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['Event', 'Anzahl', 'Preis', 'Gesamt']],
      body: eventTableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: '#FFFFFF',
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: grayColor,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Get Y position after tables
  const finalY = currentY;

  // Totals
  const totalsX = 120;
  let totalsY = finalY;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Zwischensumme:', totalsX, totalsY);
  doc.text(formatPrice(order.subtotal), 180, totalsY, { align: 'right' });

  totalsY += 7;
  doc.text('Versand:', totalsX, totalsY);
  doc.text(formatPrice(order.shippingCost), 180, totalsY, { align: 'right' });

  const giftWrapCost = order.items?.some(item => item.giftWrap) ? 5 : 0;
  if (giftWrapCost > 0) {
    totalsY += 7;
    doc.text('Geschenkverpackung:', totalsX, totalsY);
    doc.text(formatPrice(giftWrapCost), 180, totalsY, { align: 'right' });
  }

  totalsY += 7;
  doc.text(`MwSt. (${order.taxRate}%):`, totalsX, totalsY);
  doc.text(formatPrice(order.taxAmount), 180, totalsY, { align: 'right' });

  // Line
  totalsY += 5;
  doc.setDrawColor(grayColor);
  doc.line(totalsX, totalsY, 180, totalsY);

  // Total
  totalsY += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('Gesamtbetrag:', totalsX, totalsY);
  doc.text(formatPrice(order.total), 180, totalsY, { align: 'right' });

  // Gift Options & Notes
  const hasGiftOptions = order.items?.some(item => item.isGift || item.giftWrap) || order.customerNote;

  if (hasGiftOptions && totalsY + 30 < 260) {
    let giftY = totalsY + 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Geschenkoptionen:', 20, giftY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor);
    giftY += 6;

    if (order.items?.some(item => item.isGift)) {
      doc.text('✓ Dies ist ein Geschenk', 20, giftY);
      giftY += 5;
    }

    if (order.items?.some(item => item.giftWrap)) {
      doc.text('✓ Mit Geschenkverpackung', 20, giftY);
      giftY += 5;
    }

    if (order.customerNote) {
      doc.text('Grußkarte:', 20, giftY);
      giftY += 5;
      // Split long messages into multiple lines
      const maxWidth = 170;
      const lines = doc.splitTextToSize(`"${order.customerNote}"`, maxWidth);
      doc.setFont('helvetica', 'italic');
      doc.text(lines, 20, giftY);
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.setFont('helvetica', 'normal');
  const footerText = 'Vielen Dank für Ihren Einkauf!';
  doc.text(footerText, 105, 270, { align: 'center' });

  // Save PDF
  return doc;
}

export async function generateInvoicePDF(order: Order): Promise<void> {
  let logoBase64: string | undefined;
  try {
    const res = await fetch('/images/layout/logo_icon.png');
    if (res.ok) {
      const blob = await res.blob();
      const reader = new FileReader();
      logoBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn('Could not load logo in client PDF:', err);
  }

  const doc = await buildInvoiceDoc(order, logoBase64);
  doc.save(`Rechnung_${order.orderNumber}.pdf`);
}
