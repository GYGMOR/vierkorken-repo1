import { buildTicketDoc } from './ticket-pdf-generator';

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
 */
export async function generateTicketPDFBuffer(ticket: EventTicketData): Promise<Buffer> {
  const doc = await buildTicketDoc(ticket);
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
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
