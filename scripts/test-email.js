const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function testEmail() {
  console.log('\n🔧 Testing Email Configuration...\n');

  console.log('📧 Configuration:');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM}`);
  console.log(`   App URL: ${process.env.NEXT_PUBLIC_APP_URL}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Verify connection
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'VIERKORKEN Test Email - IP Update Successful!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: 2px;">VIERKORKEN</h1>
            </div>

            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333;">✅ Email-Konfiguration erfolgreich!</h2>

              <p>Diese Test-Email bestätigt, dass Ihre Email-Konfiguration korrekt funktioniert.</p>

              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Konfigurationsdetails:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</li>
                  <li><strong>Port:</strong> ${process.env.EMAIL_PORT}</li>
                  <li><strong>Email-Adresse:</strong> ${process.env.EMAIL_USER}</li>
                  <li><strong>App URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}</li>
                </ul>
              </div>

              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">📋 Was funktioniert jetzt:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                  <li>✅ Passwort-Zurücksetzen E-Mails</li>
                  <li>✅ Bestellbestätigungen an Kunden</li>
                  <li>✅ Kontaktformular-Anfragen an ${process.env.EMAIL_USER}</li>
                </ul>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} VIERKORKEN - Premium Weinshop<br>
                Diese Email wurde automatisch vom Test-Script generiert.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}\n`);
    console.log('🎉 Check your inbox at:', process.env.EMAIL_USER);
    console.log('\n✨ All email features are working correctly!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check if EMAIL_PASSWORD is correct (App Password for Gmail)');
      console.log('   2. Make sure 2-Factor Authentication is enabled');
      console.log('   3. Create new App Password: https://myaccount.google.com/apppasswords\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check if SMTP host and port are correct');
      console.log('   2. Check your internet connection');
      console.log('   3. Check if firewall is blocking the connection\n');
    }
  }
}

testEmail();
