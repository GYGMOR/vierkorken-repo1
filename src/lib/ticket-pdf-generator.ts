import { jsPDF } from 'jspdf';
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

export async function buildTicketDoc(ticket: EventTicketData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const burgundy = '#6B1B29';
  const gold = '#D4AF37';
  const gray = '#4A4A4A';
  const lightGray = '#F5F5F5';

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(ticket.qrCode, {
    width: 400,
    margin: 1,
    color: {
      dark: burgundy,
      light: '#FFFFFF',
    },
  });

  // Format date
  const eventDate = new Intl.DateTimeFormat('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(ticket.event.startDateTime));

  const eventTime = new Intl.DateTimeFormat('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ticket.event.startDateTime));

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price);
  };

  // Background decorative element
  doc.setFillColor(burgundy);
  doc.rect(0, 0, 210, 40, 'F');

  // VIER KORKEN Logo/Header
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Vier Korken Wein-Boutique', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Event-Ticket', 105, 28, { align: 'center' });

  // Gold accent line
  doc.setDrawColor(gold);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);

  // Event Title
  doc.setTextColor(gray);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.event.title, 105, 55, { align: 'center', maxWidth: 170 });

  if (ticket.event.subtitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.event.subtitle, 105, 65, { align: 'center', maxWidth: 170 });
  }

  // Ticket Number (prominent)
  const startY = ticket.event.subtitle ? 80 : 70;
  doc.setFillColor(lightGray);
  doc.roundedRect(20, startY, 170, 15, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.text('Ticket-Nummer:', 25, startY + 6);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.ticketNumber, 25, startY + 11);

  // Event Details Box
  const detailsY = startY + 25;
  doc.setDrawColor(burgundy);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, detailsY, 85, 60, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(burgundy);
  doc.text('EVENT-DETAILS', 25, detailsY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(gray);

  let currentY = detailsY + 16;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Datum:', 25, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(eventDate, 25, currentY + 5, { maxWidth: 75 });
  currentY += 15;

  // Time
  doc.setFont('helvetica', 'bold');
  doc.text('Uhrzeit:', 25, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(eventTime + ' Uhr', 25, currentY + 5);
  currentY += 10;

  // Duration
  if (ticket.event.duration) {
    doc.setFont('helvetica', 'bold');
    doc.text('Dauer:', 25, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`ca. ${ticket.event.duration} Minuten`, 25, currentY + 5);
    currentY += 10;
  }

  // Venue
  doc.setFont('helvetica', 'bold');
  doc.text('Veranstaltungsort:', 25, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(ticket.event.venue, 25, currentY + 5, { maxWidth: 75 });

  // QR Code Box
  doc.setDrawColor(burgundy);
  doc.roundedRect(110, detailsY, 80, 60, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(burgundy);
  doc.text('CHECK-IN QR-CODE', 150, detailsY + 8, { align: 'center' });

  // QR Code
  doc.addImage(qrDataUrl, 'PNG', 125, detailsY + 12, 45, 45);

  // Ticket Holder Box
  const holderY = detailsY + 70;
  doc.setFillColor(lightGray);
  doc.roundedRect(20, holderY, 170, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(burgundy);
  doc.text('TICKET-INHABER', 25, holderY + 7);

  doc.setFontSize(11);
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'bold');
  doc.text(`${ticket.holderFirstName} ${ticket.holderLastName}`, 25, holderY + 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(ticket.holderEmail, 25, holderY + 20);

  doc.setFont('helvetica', 'bold');
  doc.text(formatPrice(ticket.price), 185, holderY + 14, { align: 'right' });

  // Important Information Box
  const infoY = holderY + 35;
  doc.setDrawColor(gold);
  doc.setFillColor(255, 250, 240); // Light yellow
  doc.setLineWidth(0.5);
  doc.roundedRect(20, infoY, 170, 35, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(burgundy);
  doc.text('WICHTIGE HINWEISE', 25, infoY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gray);
  const instructions = [
    '• Bitte bringen Sie dieses Ticket ausgedruckt oder digital auf Ihrem Smartphone mit',
    '• Der QR-Code wird beim Check-in gescannt',
    '• Einlass beginnt 15 Minuten vor Veranstaltungsbeginn',
    '• Dieses Ticket ist nicht übertragbar und nur für den genannten Inhaber gültig',
  ];

  let instructionY = infoY + 13;
  instructions.forEach((instruction) => {
    doc.text(instruction, 25, instructionY, { maxWidth: 160 });
    instructionY += 5;
  });

  // Footer
  doc.setDrawColor(burgundy);
  doc.setLineWidth(0.5);
  doc.line(20, 270, 190, 270);

  doc.setFontSize(8);
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  doc.text('Vier Korken Wein-Boutique Wein-Boutique', 105, 275, { align: 'center' });
  doc.text('Steinbrunnengasse 3a, 5707 Seengen | Tel: 062 390 04 04 | info@vierkorken.ch', 105, 280, { align: 'center' });

  // Watermark
  doc.setFontSize(60);
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'bold');
  doc.text('TICKET', 105, 150, { align: 'center', angle: 45 });

  // Return document instead of saving
  return doc;
}

export async function generateTicketPDF(ticket: EventTicketData): Promise<void> {
  const doc = await buildTicketDoc(ticket);
  // Save PDF
  doc.save(`Vier-Korken-Wein-Boutique-Ticket-${ticket.ticketNumber}.pdf`);
}
