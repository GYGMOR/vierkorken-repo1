import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
    sendInfoMail,
    sendOrderConfirmationEmail,
    sendNewOrderNotificationToAdmin,
    sendPasswordResetEmail
} from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        // 1. Check Admin Auth
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { email, type } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        let result;

        switch (type) {
            case 'INFO':
                result = await sendInfoMail({
                    to: email,
                    subject: '🧪 VIER KORKEN Test-E-Mail',
                    html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #8B4513;">Test Erfolgreich</h1>
              <p>Dies ist eine einfache Test-E-Mail vom Admin-Panel.</p>
              <p>Gesendet an: <strong>${email}</strong></p>
              <p>Zeitpunkt: ${new Date().toLocaleString('de-CH')}</p>
            </div>
          `,
                    text: `Test Erfolgreich. Dies ist eine einfache Test-E-Mail vom Admin-Panel. Gesendet an: ${email}`,
                });
                break;

            case 'ORDER':
            case 'ADMIN_ORDER':
                // Mock Order Data
                const mockOrder = {
                    orderNumber: `TEST-${Date.now().toString().slice(-4)}`,
                    createdAt: new Date(),
                    customerFirstName: 'Max',
                    customerLastName: 'Mustermann',
                    customerEmail: email,
                    customerPhone: '079 123 45 67',
                    billingAddress: {
                        firstName: 'Max',
                        lastName: 'Mustermann',
                        street: 'Teststrasse',
                        streetNumber: '123',
                        postalCode: '8000',
                        city: 'Zürich',
                        country: 'Schweiz'
                    },
                    shippingAddress: {
                        firstName: 'Max',
                        lastName: 'Mustermann',
                        street: 'Teststrasse',
                        streetNumber: '123',
                        postalCode: '8000',
                        city: 'Zürich',
                        country: 'Schweiz'
                    },
                    items: [
                        {
                            quantity: 2,
                            wineName: 'Pinot Noir Reserve',
                            winery: 'Weingut Test',
                            vintage: '2020',
                            bottleSize: '0.75',
                            totalPrice: 45.00
                        },
                        {
                            quantity: 6,
                            wineName: 'Chardonnay Classic',
                            winery: 'Domaine Test',
                            vintage: '2021',
                            bottleSize: '0.75',
                            totalPrice: 120.00
                        }
                    ],
                    subtotal: 165.00,
                    shippingCost: 15.00,
                    taxAmount: 13.50,
                    total: 180.00,
                    paymentMethod: 'stripe',
                    deliveryMethod: 'SHIPPING'
                };

                if (type === 'ORDER') {
                    await sendOrderConfirmationEmail(email, 'test-order-id', mockOrder);
                    result = { success: true, message: 'Order confirmation sent to ' + email };
                } else {
                    await sendNewOrderNotificationToAdmin('test-order-id', mockOrder, email);
                    result = { success: true, message: 'Admin notification sent to ' + email };
                }
                break;

            case 'NEWS':
                // Fetch latest blog post
                const latestPost = await prisma.blogPost.findFirst({
                    where: { status: 'PUBLISHED' },
                    orderBy: { publishedAt: 'desc' },
                });

                if (!latestPost) {
                    return NextResponse.json({ success: false, error: 'Keine veröffentlichten News-Artikel gefunden' }, { status: 404 });
                }

                // Construct full image URL
                let imageUrl = latestPost.featuredImage || '';
                if (imageUrl && !imageUrl.startsWith('http')) {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch';
                    imageUrl = `${baseUrl}${imageUrl}`;
                }

                const newsHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${latestPost.title}</title>
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
                        
                        <!-- Header -->
                        <div style="background-color: #8B4513; padding: 20px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">VIER KORKEN</h1>
                        <p style="color: #e0e0e0; margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Newsletter</p>
                        </div>

                        <!-- Hero Image -->
                        ${imageUrl ? `
                        <div style="width: 100%; max-height: 300px; overflow: hidden;">
                            <img src="${imageUrl}" alt="${latestPost.title}" style="width: 100%; height: auto; display: block;" />
                        </div>
                        ` : ''}

                        <!-- Content -->
                        <div style="padding: 30px 20px; background-color: #fff;">
                        <p style="color: #8B4513; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                            Neu im Blog
                        </p>
                        <h2 style="color: #333; margin: 0 0 15px; font-size: 24px; font-family: Georgia, serif;">
                            ${latestPost.title}
                        </h2>
                        
                        <div style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                            ${latestPost.excerpt || latestPost.content.substring(0, 150) + '...'}
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch'}/blog/${latestPost.slug}" 
                            style="background-color: #8B4513; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
                            Ganzen Artikel lesen
                            </a>
                        </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
                        <p style="margin: 0 0 10px;">
                            © ${new Date().getFullYear()} VIER KORKEN - Premium Weinshop<br>
                            Steinbrunnengasse 3a, 5707 Seengen
                        </p>
                        <p style="margin: 0;">
                            <a href="#" style="color: #8B4513; text-decoration: none;">Abmelden</a>
                        </p>
                        </div>
                    </body>
                    </html>
                `;

                // Uses sendInfoMail which sends from info@vierkorken.ch
                await sendInfoMail({
                    to: email,
                    subject: `📰 Neu bei VIER KORKEN: ${latestPost.title}`,
                    html: newsHtml,
                    text: `${latestPost.title}\n\n${latestPost.excerpt}\n\nLesen Sie mehr unter: ${process.env.NEXT_PUBLIC_APP_URL || 'https://vierkorken.ch'}/blog/${latestPost.slug}`,
                });

                result = { success: true, message: `Newsletter sent for article: "${latestPost.title}"` };
                break;

            case 'PASSWORD_RESET':
                await sendPasswordResetEmail(email, 'https://vierkorken.ch/auth/reset-password?token=test-token', 'Max');
                result = { success: true, message: 'Password reset sent' };
                break;

            default:
                return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('Debug Email API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
