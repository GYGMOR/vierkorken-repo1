import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Send contact email to admin
    await sendContactEmail(name, email, subject, message);

    return NextResponse.json(
      {
        success: true,
        message: 'Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error in contact form API:', error);
    return NextResponse.json(
      { error: 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}
