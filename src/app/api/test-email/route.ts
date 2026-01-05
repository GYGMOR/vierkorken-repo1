import { NextRequest, NextResponse } from 'next/server';
import { sendInfoMail } from '@/lib/email';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const testResults: any = {
    timestamp: new Date().toISOString(),
    environment: {
      MS_TENANT_ID: process.env.MS_TENANT_ID ? '✅ Set' : '❌ Missing',
      MS_CLIENT_ID: process.env.MS_CLIENT_ID ? '✅ Set' : '❌ Missing',
      MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      MAIL_FROM_INFO: process.env.MAIL_FROM_INFO || '❌ Missing',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || '❌ Missing',
    },
    tests: [] as any[],
  };

  try {
    // Test 1: Check credentials
    console.log('🧪 Test 1: Checking Microsoft Graph API credentials...');
    if (!process.env.MS_TENANT_ID || !process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET) {
      throw new Error('Microsoft Graph API credentials are missing!');
    }
    testResults.tests.push({
      name: 'Credentials Check',
      status: '✅ PASS',
      message: 'All required credentials are set',
    });

    // Test 2: Test token acquisition
    console.log('🧪 Test 2: Testing token acquisition...');
    const credential = new ClientSecretCredential(
      process.env.MS_TENANT_ID,
      process.env.MS_CLIENT_ID,
      process.env.MS_CLIENT_SECRET
    );

    let accessToken;
    try {
      const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
      accessToken = tokenResponse?.token;
      if (!accessToken) {
        throw new Error('No access token received');
      }
      testResults.tests.push({
        name: 'Token Acquisition',
        status: '✅ PASS',
        message: 'Successfully acquired access token',
        tokenPrefix: accessToken.substring(0, 20) + '...',
      });
    } catch (tokenError: any) {
      testResults.tests.push({
        name: 'Token Acquisition',
        status: '❌ FAIL',
        error: tokenError.message,
        hint: 'Check if Azure App has correct permissions: Mail.Send or Mail.Send.Shared',
      });
      throw tokenError;
    }

    // Test 3: Check mailbox access
    console.log('🧪 Test 3: Checking mailbox access...');
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken || '',
      },
    });

    try {
      const mailboxInfo = await client
        .api(`/users/${process.env.MAIL_FROM_INFO}`)
        .select('displayName,mail,userPrincipalName')
        .get();

      testResults.tests.push({
        name: 'Mailbox Access',
        status: '✅ PASS',
        mailbox: {
          displayName: mailboxInfo.displayName,
          mail: mailboxInfo.mail,
          userPrincipalName: mailboxInfo.userPrincipalName,
        },
      });
    } catch (mailboxError: any) {
      testResults.tests.push({
        name: 'Mailbox Access',
        status: '❌ FAIL',
        error: mailboxError.message,
        hint: 'Make sure info@vierkorken.ch exists and the app has access to it',
      });
      throw mailboxError;
    }

    // Test 4: Send test email
    console.log('🧪 Test 4: Sending test email to regideh221@gmail.com...');
    const testEmail = req.nextUrl.searchParams.get('email') || 'regideh221@gmail.com';

    try {
      await sendInfoMail({
        to: testEmail,
        subject: '🧪 VIERKORKEN Test-E-Mail - Bitte ignorieren',
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <div style="background-color: #8B4513; color: white; padding: 20px; text-align: center;">
                <h1>VIERKORKEN</h1>
                <p>E-Mail System Test</p>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>✅ E-Mail-System funktioniert!</h2>
                <p>Diese Test-E-Mail wurde erfolgreich von <strong>${process.env.MAIL_FROM_INFO}</strong> gesendet.</p>
                <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-CH')}</p>
                <p><strong>Test-ID:</strong> ${Date.now()}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                  Falls Sie diese E-Mail nicht erwarten, können Sie sie ignorieren.
                  Dies ist eine automatische Test-E-Mail vom VIERKORKEN System.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `VIERKORKEN E-Mail System Test\n\n✅ Das E-Mail-System funktioniert!\n\nDiese Test-E-Mail wurde erfolgreich von ${process.env.MAIL_FROM_INFO} gesendet.\n\nZeitstempel: ${new Date().toLocaleString('de-CH')}\nTest-ID: ${Date.now()}`,
      });

      testResults.tests.push({
        name: 'Send Test Email',
        status: '✅ PASS',
        recipient: testEmail,
        message: 'Test email sent successfully! Check your inbox (and spam folder).',
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
    testResults.message = `Test email sent to ${testEmail}. Check inbox and spam folder!`;

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
