import { NextResponse } from 'next/server';
import { sendLaunchNotificationEmail } from '@/lib/email';
import { isAdmin } from '@/lib/action-auth';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
  }

  try {
    console.log('Sending test email to info@vierkorken.ch');
    await sendLaunchNotificationEmail('info@vierkorken.ch');
    return NextResponse.json({ success: true, message: 'Test email sent!' });
  } catch (error) {
    console.error('Failed to send test email', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
