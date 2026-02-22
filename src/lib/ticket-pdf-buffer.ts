import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

interface EventTicketData {
  ticketNumber: string;
  qrCode: string;
  holderFirstName: string;
  holderLastName: string;
  holderEmail: string;
  price: number;
  event: {
    title: string;
    subtitle?: string;
    venue: string;
    startDateTime: string;
    duration?: number;
  };
}

/**
 * Generate Event Ticket PDF as Buffer (for email attachments)
 * Uses pdf-lib which works in serverless environments
 */
export async function generateTicketPDFBuffer(ticket: EventTicketData): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed standard fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add a page (A4 size)
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Colors
  const burgundy = rgb(0.42, 0.11, 0.16); // #6B1B29
  const gold = rgb(0.83, 0.69, 0.22); // #D4AF37
  const gray = rgb(0.29, 0.29, 0.29); // #4A4A4A
  const white = rgb(1, 1, 1);
  const lightGray = rgb(0.96, 0.96, 0.96); // #F5F5F5

  // Generate QR code as PNG buffer
  const qrCodeBuffer = await QRCode.toBuffer(ticket.qrCode, {
    width: 200,
    margin: 1,
    color: {
      dark: '#6B1B29',
      light: '#FFFFFF',
    },
  });

  // Embed QR code image
  const qrImage = await pdfDoc.embedPng(qrCodeBuffer);

  // Format date and time
  const eventDateTime = new Date(ticket.event.startDateTime);
  const eventDate = new Intl.DateTimeFormat('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(eventDateTime);

  const eventTime = new Intl.DateTimeFormat('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(eventDateTime);

  const formatPrice = (price: number): string => `CHF ${price.toFixed(2)}`;

  // ===== HEADER BAR =====
  page.drawRectangle({
    x: 0,
    y: height - 113, // 40mm from top
    width: width,
    height: 113,
    color: burgundy,
  });

  // Header text
  page.drawText('VIER KORKEN Weinboutique', {
    x: width / 2 - helveticaBold.widthOfTextAtSize('VIER KORKEN Weinboutique', 32) / 2,
    y: height - 60,
    size: 32,
    font: helveticaBold,
    color: white,
  });

  page.drawText('Event-Ticket', {
    x: width / 2 - helvetica.widthOfTextAtSize('Event-Ticket', 12) / 2,
    y: height - 80,
    size: 12,
    font: helvetica,
    color: white,
  });

  // Gold accent line
  page.drawLine({
    start: { x: 57, y: height - 113 },
    end: { x: 538, y: height - 113 },
    thickness: 3,
    color: gold,
  });

  // ===== EVENT TITLE =====
  let y = height - 150;

  const titleWidth = helveticaBold.widthOfTextAtSize(ticket.event.title, 24);
  page.drawText(ticket.event.title, {
    x: Math.min(width / 2 - titleWidth / 2, 50),
    y: y,
    size: 24,
    font: helveticaBold,
    color: gray,
    maxWidth: 480,
  });

  if (ticket.event.subtitle) {
    y -= 25;
    page.drawText(ticket.event.subtitle, {
      x: 50,
      y: y,
      size: 14,
      font: helvetica,
      color: gray,
    });
  }

  // ===== TICKET NUMBER BOX =====
  y -= 40;
  page.drawRectangle({
    x: 50,
    y: y - 30,
    width: 495,
    height: 40,
    color: lightGray,
    borderColor: burgundy,
    borderWidth: 0.5,
  });

  page.drawText('Ticket-Nummer:', {
    x: 60,
    y: y - 5,
    size: 10,
    font: helvetica,
    color: gray,
  });

  page.drawText(ticket.ticketNumber, {
    x: 60,
    y: y - 22,
    size: 14,
    font: helveticaBold,
    color: burgundy,
  });

  // ===== EVENT DETAILS & QR CODE =====
  y -= 70;
  const boxHeight = 170;

  // Left box - Event details
  page.drawRectangle({
    x: 50,
    y: y - boxHeight,
    width: 230,
    height: boxHeight,
    borderColor: burgundy,
    borderWidth: 1,
  });

  page.drawText('EVENT-DETAILS', {
    x: 60,
    y: y - 20,
    size: 11,
    font: helveticaBold,
    color: burgundy,
  });

  let detailY = y - 45;

  // Date
  page.drawText('Datum:', { x: 60, y: detailY, size: 9, font: helveticaBold, color: gray });
  page.drawText(eventDate, { x: 60, y: detailY - 12, size: 9, font: helvetica, color: gray });
  detailY -= 35;

  // Time
  page.drawText('Uhrzeit:', { x: 60, y: detailY, size: 9, font: helveticaBold, color: gray });
  page.drawText(eventTime + ' Uhr', { x: 60, y: detailY - 12, size: 9, font: helvetica, color: gray });
  detailY -= 35;

  // Duration
  if (ticket.event.duration) {
    page.drawText('Dauer:', { x: 60, y: detailY, size: 9, font: helveticaBold, color: gray });
    page.drawText(`ca. ${ticket.event.duration} Minuten`, { x: 60, y: detailY - 12, size: 9, font: helvetica, color: gray });
    detailY -= 35;
  }

  // Venue
  page.drawText('Ort:', { x: 60, y: detailY, size: 9, font: helveticaBold, color: gray });
  page.drawText(ticket.event.venue, { x: 60, y: detailY - 12, size: 9, font: helvetica, color: gray });

  // Right box - QR Code
  page.drawRectangle({
    x: 300,
    y: y - boxHeight,
    width: 245,
    height: boxHeight,
    borderColor: burgundy,
    borderWidth: 1,
  });

  page.drawText('CHECK-IN QR-CODE', {
    x: 422 - helveticaBold.widthOfTextAtSize('CHECK-IN QR-CODE', 11) / 2,
    y: y - 20,
    size: 11,
    font: helveticaBold,
    color: burgundy,
  });

  // QR Code
  const qrSize = 120;
  page.drawImage(qrImage, {
    x: 422 - qrSize / 2,
    y: y - boxHeight + 20,
    width: qrSize,
    height: qrSize,
  });

  // ===== TICKET HOLDER BOX =====
  y -= boxHeight + 20;
  page.drawRectangle({
    x: 50,
    y: y - 60,
    width: 495,
    height: 60,
    color: lightGray,
  });

  page.drawText('TICKET-INHABER', {
    x: 60,
    y: y - 18,
    size: 10,
    font: helveticaBold,
    color: burgundy,
  });

  page.drawText(`${ticket.holderFirstName} ${ticket.holderLastName}`, {
    x: 60,
    y: y - 35,
    size: 12,
    font: helveticaBold,
    color: gray,
  });

  page.drawText(ticket.holderEmail, {
    x: 60,
    y: y - 50,
    size: 9,
    font: helvetica,
    color: gray,
  });

  page.drawText(formatPrice(ticket.price), {
    x: 500,
    y: y - 35,
    size: 12,
    font: helveticaBold,
    color: burgundy,
  });

  // ===== IMPORTANT INFO BOX =====
  y -= 90;
  page.drawRectangle({
    x: 50,
    y: y - 85,
    width: 495,
    height: 85,
    color: rgb(1, 0.98, 0.94), // Light yellow
    borderColor: gold,
    borderWidth: 1,
  });

  page.drawText('WICHTIGE HINWEISE', {
    x: 60,
    y: y - 18,
    size: 10,
    font: helveticaBold,
    color: burgundy,
  });

  const instructions = [
    'Bitte bringen Sie dieses Ticket ausgedruckt oder digital auf Ihrem Smartphone mit',
    'Der QR-Code wird beim Check-in gescannt',
    'Einlass beginnt 15 Minuten vor Veranstaltungsbeginn',
    'Dieses Ticket ist nicht uebertragbar und nur fuer den genannten Inhaber gueltig',
  ];

  let instructionY = y - 35;
  for (const instruction of instructions) {
    page.drawText('- ' + instruction, {
      x: 60,
      y: instructionY,
      size: 8,
      font: helvetica,
      color: gray,
    });
    instructionY -= 13;
  }

  // ===== FOOTER =====
  page.drawLine({
    start: { x: 50, y: 90 },
    end: { x: 545, y: 90 },
    thickness: 0.5,
    color: burgundy,
  });

  page.drawText('VIER KORKEN Weinboutique Wein-Boutique', {
    x: width / 2 - helvetica.widthOfTextAtSize('VIER KORKEN Weinboutique Wein-Boutique', 8) / 2,
    y: 75,
    size: 8,
    font: helvetica,
    color: gray,
  });

  page.drawText('Steinbrunnengasse 3a, 5707 Seengen | Tel: 062 390 04 04 | info@vierkorken.ch', {
    x: width / 2 - helvetica.widthOfTextAtSize('Steinbrunnengasse 3a, 5707 Seengen | Tel: 062 390 04 04 | info@vierkorken.ch', 8) / 2,
    y: 62,
    size: 8,
    font: helvetica,
    color: gray,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
}

/**
 * Generate multiple ticket PDFs and return as array of buffers
 */
export async function generateMultipleTicketPDFs(tickets: EventTicketData[]): Promise<Array<{ filename: string; content: Buffer }>> {
  const pdfs: Array<{ filename: string; content: Buffer }> = [];

  for (const ticket of tickets) {
    const pdfBuffer = await generateTicketPDFBuffer(ticket);
    pdfs.push({
      filename: `Ticket-${ticket.ticketNumber}.pdf`,
      content: pdfBuffer,
    });
  }

  return pdfs;
}
