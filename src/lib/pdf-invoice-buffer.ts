import PDFDocument from 'pdfkit';

interface OrderItem {
  wineName: string;
  winery: string;
  vintage: number | null;
  bottleSize: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  taxRate: number;
  total: number;
}

/**
 * Generate PDF invoice as Buffer (for email attachments)
 */
export async function generateInvoicePDFBuffer(order: OrderForPDF): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Use bufferPages: true to avoid font loading issues in production
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        autoFirstPage: true,
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        reject(err);
      });

      // Company Header - use simple text without font switching
      doc
        .fontSize(24)
        .text('VIER KORKEN', 50, 50, { continued: false });

      doc
        .fontSize(10)
        .text('Premium Weinshop', 50, 80)
        .text('Steinbrunnengasse 3a', 50, 95)
        .text('5707 Seengen', 50, 110)
        .text('Tel: 062 390 04 04', 50, 125)
        .text('info@vierkorken.ch', 50, 140)
        .text('www.vierkorken.ch', 50, 155);

      // Invoice Title
      doc
        .fontSize(20)
        .text('RECHNUNG', 50, 220);

      // Invoice Info
      const dateStr = typeof order.date === 'string' ? order.date : order.date.toISOString().split('T')[0];
      doc
        .fontSize(10)
        .text(`Rechnungsnummer: ${order.orderNumber}`, 50, 250)
        .text(`Datum: ${formatDate(dateStr)}`, 50, 265);

      // Billing Address
      doc
        .fontSize(12)
        .text('Rechnungsadresse:', 350, 220);

      doc
        .fontSize(10);

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
      doc
        .fontSize(10)
        .font('Helvetica-Bold');

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
      doc.font('Helvetica');
      let yPosition = tableTop + 25;

      order.items.forEach((item) => {
        doc
          .text(
            `${item.wineName}\n${item.winery} • ${item.vintage || 'N/A'} • ${item.bottleSize}l`,
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
        .font('Helvetica-Bold')
        .text('Gesamtbetrag:', 350, yPosition)
        .text(formatPrice(order.total), 470, yPosition, { width: 80, align: 'right' });

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Zahlungsbedingungen: Innerhalb von 30 Tagen ohne Abzug.\nVielen Dank für Ihren Einkauf!',
          50,
          750,
          { align: 'center', width: 500 }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(price);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}
