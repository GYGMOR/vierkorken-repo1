import fs from 'fs';
import path from 'path';
import { buildInvoiceDoc } from './pdf-generator';

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
export async function generateInvoicePDFBuffer(order: any): Promise<Buffer> {
  let logoBase64: string | undefined;

  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'layout', 'logo_icon.png');
    if (fs.existsSync(logoPath)) {
      const ext = path.extname(logoPath).substring(1);
      const base64 = fs.readFileSync(logoPath).toString('base64');
      logoBase64 = `data:image/${ext};base64,${base64}`;
    }
  } catch (err) {
    console.warn("Could not load logo for node PDF:", err);
  }

  // Ensure compatibility with the Order interface expected by buildInvoiceDoc
  const adaptedOrder = {
    ...order,
    eventTickets: order.eventTickets || order.tickets, // email.ts might pass tickets as eventTickets or tickets
  };

  const doc = await buildInvoiceDoc(adaptedOrder, logoBase64);

  // output('arraybuffer') returns an ArrayBuffer which we convert to a Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

function formatPrice(price: number): string {
  return `CHF ${Number(price).toFixed(2)} `;
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
