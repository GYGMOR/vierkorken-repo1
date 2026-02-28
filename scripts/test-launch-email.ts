import { sendLaunchNotificationEmail } from '../src/lib/email';
import { prisma } from '../src/lib/prisma';

async function main() {
    const email = 'info@vierkorken.ch';
    console.log(`Sending test launch email to ${email}...`);
    try {
        await sendLaunchNotificationEmail(email);
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
