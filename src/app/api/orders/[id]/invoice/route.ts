import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    // Fetch real order from database
    const dbOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
        tickets: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!dbOrder) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Parse JSON addresses
    const shippingAddress = dbOrder.shippingAddress as any;
    const billingAddress = dbOrder.billingAddress as any;

    // Transform to format expected by PDF generator
    const order = {
      id: dbOrder.id,
      orderNumber: dbOrder.orderNumber,
      date: dbOrder.createdAt.toISOString().split('T')[0],

      customerFirstName: dbOrder.customerFirstName,
      customerLastName: dbOrder.customerLastName,
      customerEmail: dbOrder.customerEmail,

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

      shippingAddress: {
        company: shippingAddress?.company || '',
        firstName: shippingAddress?.firstName || dbOrder.customerFirstName,
        lastName: shippingAddress?.lastName || dbOrder.customerLastName,
        street: shippingAddress?.street || '',
        streetNumber: shippingAddress?.streetNumber || '',
        postalCode: shippingAddress?.postalCode || '',
        city: shippingAddress?.city || '',
        country: shippingAddress?.country || 'Schweiz',
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
      taxRate: 8.1, // Swiss VAT
      total: Number(dbOrder.total),
    };

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Company Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('VIER KORKEN', 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Premium Weinshop', 50, 80)
      .text('Steinbrunnengasse 3a', 50, 95)
      .text('5707 Seengen', 50, 110)
      .text('Tel: 062 390 04 04', 50, 125)
      .text('info@vierkorken.ch', 50, 140)
      .text('www.vierkorken.ch', 50, 155);

    // Invoice Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('RECHNUNG', 50, 220);

    // Invoice Info
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Rechnungsnummer: ${order.orderNumber}`, 50, 250)
      .text(`Datum: ${formatDate(order.date)}`, 50, 265);

    // Billing Address
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Rechnungsadresse:', 350, 220);

    doc
      .fontSize(10)
      .font('Helvetica');

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

    // Wait for PDF to be generated
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rechnung_${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
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
