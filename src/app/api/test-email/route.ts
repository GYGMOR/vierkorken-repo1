import { NextResponse } from 'next/server';
import { sendLaunchNotificationEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Sending test email to info@vierkorken.ch');
    await sendLaunchNotificationEmail('info@vierkorken.ch');
    return NextResponse.json({ success: true, message: 'Test email sent!' });
  } catch (error) {
    console.error('Failed to send test email', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
