import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
    sendInfoMail,
    sendOrderConfirmationEmail,
    sendNewOrderNotificationToAdmin,
    sendPasswordResetEmail,
    sendLaunchNotificationEmail
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
                    subject: '🧪 Vier Korken Wein-Boutique Test-E-Mail',
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

            case 'ORDER_SHIPPING':
            case 'ORDER_PICKUP':
            case 'ADMIN_ORDER':
                // Mock Order Data
                const isDebugPickup = type === 'ORDER_PICKUP';
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
                            totalPrice: 45.00,
                            giftWrap: true // Add gift wrap to test UI
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
                    shippingCost: isDebugPickup ? 0.00 : 15.00,
                    taxAmount: 13.50,
                    total: isDebugPickup ? 165.00 : 180.00,
                    paymentMethod: 'stripe',
                    deliveryMethod: isDebugPickup ? 'PICKUP' : 'SHIPPING'
                };

                if (type === 'ORDER_SHIPPING' || type === 'ORDER_PICKUP') {
                    await sendOrderConfirmationEmail(email, 'test-order-id', mockOrder);
                    result = { success: true, message: `Order confirmation (${isDebugPickup ? 'Pickup' : 'Shipping'}) sent to ` + email };
                } else {
                    await sendNewOrderNotificationToAdmin('test-order-id', mockOrder, email);
                    result = { success: true, message: 'Admin notification sent to ' + email };
                }
                break;

            case 'SHIPPED_SHIPPING':
            case 'SHIPPED_PICKUP':
                const isDebugShippedPickup = type === 'SHIPPED_PICKUP';
                const { sendOrderShippedEmail } = await import('@/lib/email');
                await sendOrderShippedEmail(
                    email,
                    `TEST-${Date.now().toString().slice(-4)}`,
                    'Max',
                    isDebugShippedPickup ? undefined : '99.00.123456.12345678',
                    isDebugShippedPickup ? 'PICKUP' : 'SHIPPING'
                );
                result = { success: true, message: `Status Update (${isDebugShippedPickup ? 'Pickup' : 'Shipping'}) sent to ` + email };
                break;

            case 'NEWS_TEST':
            case 'EVENT_TEST':
                const isEventTest = type === 'EVENT_TEST';
                
                // Fetch latest news post based on the requested type
                const latestNewsResult = await prisma.news.findFirst({
                    where: { 
                        status: 'PUBLISHED',
                        type: isEventTest ? 'EVENT' : 'NEWS'
                    },
                    orderBy: { publishedAt: 'desc' },
                });

                if (!latestNewsResult) {
                    return NextResponse.json({ success: false, error: `Keine veröffentlichten ${isEventTest ? 'Event' : 'News'}-Artikel gefunden` }, { status: 404 });
                }

                // Import dynamically since it depends on environment setup
                const { sendNewsNotificationEmail: sendNewsEmail } = await import('@/lib/email');

                // Uses the actual function we updated to send a perfect test email
                await sendNewsEmail(
                    email, 
                    {
                        title: latestNewsResult.title,
                        excerpt: latestNewsResult.excerpt || undefined,
                        slug: latestNewsResult.slug,
                        featuredImage: latestNewsResult.featuredImage || undefined,
                        content: latestNewsResult.content,
                        type: latestNewsResult.type,
                    },
                    'Max (Test-Name)'
                );

                result = { success: true, message: `Newsletter preview sent for: "${latestNewsResult.title}"` };
                break;

            case 'PASSWORD_RESET':
                await sendPasswordResetEmail(email, 'https://vierkorken.ch/auth/reset-password?token=test-token', 'Max');
                result = { success: true, message: 'Password reset sent' };
                break;

            case 'COMING_SOON':
                await sendLaunchNotificationEmail(email);
                result = { success: true, message: 'Coming Soon Notification sent to ' + email };
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
