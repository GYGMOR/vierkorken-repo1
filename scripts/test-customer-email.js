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
      const value = match[2].trim().replace(/^[\"']|[\"']$/g, '');
      process.env[key] = value;
    }
  });
}

async function testCustomerEmail() {
  // Get email from command line argument
  const customerEmail = process.argv[2];

  if (!customerEmail) {
    console.log('\n❌ Bitte geben Sie eine Test-Email-Adresse an:');
    console.log('   node scripts/test-customer-email.js ihre-email@example.com\n');
    process.exit(1);
  }

  console.log('\n🧪 Testing Customer Order Confirmation Email\n');
  console.log('📧 Configuration:');
  console.log(`   SMTP Host: ${process.env.EMAIL_HOST}`);
  console.log(`   SMTP Port: ${process.env.EMAIL_PORT}`);
  console.log(`   Sender: ${process.env.EMAIL_USER}`);
  console.log(`   Customer Email (Empfänger): ${customerEmail}`);
  console.log(`   Admin Email: ${process.env.EMAIL_USER}\n`);

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

    // Simulate order data
    const orderData = {
      orderNumber: 'VK-TEST-12345',
      customerFirstName: 'Test',
      customerLastName: 'Kunde',
      customerEmail: customerEmail,
      createdAt: new Date(),
      items: [
        {
          quantity: 2,
          wineName: 'Château Margaux',
          winery: 'Bordeaux',
          vintage: '2015',
          bottleSize: 0.75,
          totalPrice: 89.90
        },
        {
          quantity: 1,
          wineName: 'Sassicaia',
          winery: 'Toskana',
          vintage: '2018',
          bottleSize: 0.75,
          totalPrice: 145.00
        }
      ],
      subtotal: 234.90,
      shippingCost: 9.90,
      taxAmount: 19.83,
      total: 264.63,
      billingAddress: {
        firstName: 'Test',
        lastName: 'Kunde',
        street: 'Teststrasse',
        streetNumber: '123',
        postalCode: '8000',
        city: 'Zürich',
        country: 'Schweiz'
      },
      shippingAddress: {
        firstName: 'Test',
        lastName: 'Kunde',
        street: 'Teststrasse',
        streetNumber: '123',
        postalCode: '8000',
        city: 'Zürich',
        country: 'Schweiz'
      }
    };

    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.wineName} (${item.winery}, ${item.vintage}, ${item.bottleSize}l) - CHF ${Number(item.totalPrice).toFixed(2)}`)
      .join('\n');

    const formatPrice = (price) => `CHF ${Number(price).toFixed(2)}`;

    // Send customer confirmation email
    console.log(`📨 Sending CUSTOMER confirmation to: ${customerEmail}...`);
    const customerInfo = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: `Test - Bestellbestätigung ${orderData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Bestellbestätigung</title></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #8B4513; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: 2px;">VIERKORKEN</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333;">Vielen Dank für Ihre Bestellung!</h2>
              <p>Hallo ${orderData.customerFirstName},</p>
              <p>Dies ist eine <strong>TEST-EMAIL</strong>. Ihre Bestellung wurde erfolgreich aufgegeben.</p>

              <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #8B4513; margin-top: 0;">Bestellnummer: ${orderData.orderNumber}</h3>
                <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date().toLocaleDateString('de-CH')}</p>
              </div>

              <h3>Bestellte Artikel:</h3>
              <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="white-space: pre-line; margin: 0;">${itemsList}</p>
              </div>

              <div style="background-color: #fff; padding: 15px; border-radius: 8px;">
                <p>Zwischensumme: ${formatPrice(orderData.subtotal)}</p>
                <p>Versand: ${formatPrice(orderData.shippingCost)}</p>
                <p>MwSt.: ${formatPrice(orderData.taxAmount)}</p>
                <p style="font-size: 18px; font-weight: bold; color: #8B4513;">Gesamt: ${formatPrice(orderData.total)}</p>
              </div>

              <hr style="margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} VIERKORKEN - Dies ist eine Test-Email
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ CUSTOMER email sent successfully!`);
    console.log(`   Message ID: ${customerInfo.messageId}\n`);

    // Send admin notification
    console.log(`📨 Sending ADMIN notification to: ${process.env.EMAIL_USER}...`);
    const adminInfo = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: `🔔 Test - Neue Bestellung von ${orderData.customerEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Admin Benachrichtigung</title></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1a472a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0;">🔔 Neue Bestellung</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p><strong>Dies ist eine TEST-EMAIL</strong></p>

              <h3>Bestellnummer: ${orderData.orderNumber}</h3>
              <p><strong>Kunde:</strong> ${orderData.customerFirstName} ${orderData.customerLastName}</p>
              <p><strong>Email:</strong> ${orderData.customerEmail}</p>
              <p><strong>Gesamtbetrag:</strong> ${formatPrice(orderData.total)}</p>

              <h3>Bestellte Artikel:</h3>
              <div style="background-color: #fff; padding: 15px; border-radius: 8px;">
                <p style="white-space: pre-line;">${itemsList}</p>
              </div>

              <hr style="margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">Test durchgeführt am ${new Date().toLocaleString('de-CH')}</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ ADMIN email sent successfully!`);
    console.log(`   Message ID: ${adminInfo.messageId}\n`);

    console.log('🎉 ERFOLG - Beide Emails wurden versendet!\n');
    console.log('📬 Bitte überprüfen Sie:');
    console.log(`   1. Postfach von ${customerEmail} (Kunde)`);
    console.log(`   2. Postfach von ${process.env.EMAIL_USER} (Admin)`);
    console.log(`   3. Spam-Ordner beider Email-Konten\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Gmail Authentifizierung fehlgeschlagen:');
      console.log('   - Prüfen Sie EMAIL_PASSWORD in .env.local');
      console.log('   - Verwenden Sie ein App-Passwort (nicht normales Passwort)');
    } else if (error.message.includes('recipient')) {
      console.log('\n💡 Empfänger-Adresse Problem:');
      console.log('   - Prüfen Sie ob die Email-Adresse gültig ist');
      console.log('   - Einige Provider blockieren bestimmte Empfänger');
    }
  }
}

testCustomerEmail();
