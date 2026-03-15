import { NextResponse } from 'next/server';
import { sendInfoMail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { productTitle, quantity, name, email } = await req.json();

        if (!productTitle || !quantity || !name || !email) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'info@vierkorken.ch';
        const subject = `Neue Mietanfrage: ${productTitle}`;

        const html = `
      <h2>Neue Mietanfrage</h2>
      <p>Sie haben eine neue Mietanfrage für <strong>${productTitle}</strong> erhalten.</p>
      <br />
      <h3>Details:</h3>
      <ul>
        <li><strong>Produkt:</strong> ${productTitle}</li>
        <li><strong>Stückzahl:</strong> ${quantity}</li>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
      </ul>
      <br />
      <p>Bitte kontaktieren Sie den Kunden unter ${email}, um die Anfrage zu bestätigen.</p>
    `;

        const text = `Neue Mietanfrage für ${productTitle}\n\nStückzahl: ${quantity}\nName: ${name}\nEmail: ${email}`;

        await sendInfoMail({
            to: adminEmail,
            subject,
            html,
            text,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending rental inquiry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send inquiry' },
            { status: 500 }
        );
    }
}
