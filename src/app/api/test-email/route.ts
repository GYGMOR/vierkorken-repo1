import { NextRequest, NextResponse } from 'next/server';
import { sendInfoMail } from '@/lib/email';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const testResults: any = {
    timestamp: new Date().toISOString(),
    environment: {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
      MAIL_FROM_INFO: process.env.MAIL_FROM_INFO || '❌ Missing',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || '❌ Missing',
    },
    tests: [] as any[],
  };

  try {
    // Test 1: Check credentials
    console.log('🧪 Test 1: Checking Resend API credentials...');
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Resend API key is missing!');
    }
    testResults.tests.push({
      name: 'Credentials Check',
      status: '✅ PASS',
      message: 'Resend API key is set',
    });

    // Test 2: Send test email
    console.log('🧪 Test 2: Sending test email...');
    const testEmail = req.nextUrl.searchParams.get('email') || 'regideh221@gmail.com';

    try {
      const result = await sendInfoMail({
        to: testEmail,
        subject: '🧪 VIER KORKEN Weinboutique Test-E-Mail via Resend.com',
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <div style="background-color: #8B4513; color: white; padding: 20px; text-align: center;">
                <h1>VIER KORKEN Weinboutique</h1>
                <p>E-Mail System Test (Resend.com)</p>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>✅ E-Mail-System funktioniert!</h2>
                <p>Diese Test-E-Mail wurde erfolgreich über <strong>Resend.com</strong> von <strong>${process.env.MAIL_FROM_INFO}</strong> gesendet.</p>
                <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-CH')}</p>
                <p><strong>Test-ID:</strong> ${Date.now()}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                  Falls Sie diese E-Mail nicht erwarten, können Sie sie ignorieren.
                  Dies ist eine automatische Test-E-Mail vom VIER KORKEN Weinboutique System.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `VIER KORKEN Weinboutique E-Mail System Test (Resend.com)\n\n✅ Das E-Mail-System funktioniert!\n\nDiese Test-E-Mail wurde erfolgreich über Resend.com von ${process.env.MAIL_FROM_INFO} gesendet.\n\nZeitstempel: ${new Date().toLocaleString('de-CH')}\nTest-ID: ${Date.now()}`,
      });

      testResults.tests.push({
        name: 'Send Test Email',
        status: '✅ PASS',
        recipient: testEmail,
        emailId: result.data?.id,
        message: 'Test email sent successfully via Resend.com! Check your inbox (and spam folder).',
      });
    } catch (emailError: any) {
      testResults.tests.push({
        name: 'Send Test Email',
        status: '❌ FAIL',
        error: emailError.message,
        recipient: testEmail,
      });
      throw emailError;
    }

    testResults.overallStatus = '✅ ALL TESTS PASSED';
    testResults.message = `Test email sent to ${testEmail} via Resend.com. Check inbox and spam folder!`;

    return NextResponse.json(testResults, { status: 200 });
  } catch (error: any) {
    testResults.overallStatus = '❌ TESTS FAILED';
    testResults.finalError = {
      message: error.message,
      stack: error.stack,
    };

    console.error('❌ Email test failed:', error);

    return NextResponse.json(testResults, { status: 500 });
  }
}
