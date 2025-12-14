/**
 * Newsletter Utility Functions
 * Handles newsletter subscriber management and news notifications
 */

import { prisma } from './prisma';
import { sendNewsNotificationEmail } from './email';

interface NewsItem {
  title: string;
  excerpt?: string;
  slug: string;
  featuredImage?: string;
  content: string;
}

/**
 * Send news notification to all newsletter subscribers
 * Combines standalone newsletter subscribers and registered users with newsletter enabled
 */
export async function notifyNewsletterSubscribers(newsItem: NewsItem) {
  try {
    // Get all active newsletter subscribers
    const [newsletterSubscribers, registeredUsers] = await Promise.all([
      // Standalone newsletter subscribers
      prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true, firstName: true },
      }),
      // Registered users with newsletter enabled
      prisma.user.findMany({
        where: { newsletterSubscribed: true },
        select: { email: true, firstName: true },
      }),
    ]);

    // Combine and deduplicate by email
    const emailMap = new Map<string, { email: string; firstName?: string }>();

    newsletterSubscribers.forEach(sub => {
      emailMap.set(sub.email, { email: sub.email, firstName: sub.firstName || undefined });
    });

    registeredUsers.forEach(user => {
      if (!emailMap.has(user.email)) {
        emailMap.set(user.email, { email: user.email, firstName: user.firstName || undefined });
      }
    });

    const allSubscribers = Array.from(emailMap.values());

    console.log(`📧 Sending news notification to ${allSubscribers.length} subscribers for: ${newsItem.title}`);

    if (allSubscribers.length === 0) {
      console.log('⚠️  No active newsletter subscribers found');
      return { success: 0, failed: 0, total: 0 };
    }

    // Send emails with delay to avoid rate limits
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of allSubscribers) {
      try {
        await sendNewsNotificationEmail(subscriber.email, newsItem);
        successCount++;

        // Small delay between emails (100ms = 10 emails/second)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Failed to send to ${subscriber.email}:`, error);
        failCount++;
      }
    }

    console.log(`✅ Newsletter sent: ${successCount} success, ${failCount} failed, ${allSubscribers.length} total`);

    return {
      success: successCount,
      failed: failCount,
      total: allSubscribers.length,
    };
  } catch (error) {
    console.error('❌ Error in notifyNewsletterSubscribers:', error);
    throw error;
  }
}

/**
 * Get count of active newsletter subscribers
 */
export async function getNewsletterSubscriberCount(): Promise<number> {
  const [newsletterCount, userCount] = await Promise.all([
    prisma.newsletterSubscriber.count({
      where: { isActive: true },
    }),
    prisma.user.count({
      where: { newsletterSubscribed: true },
    }),
  ]);

  // Get unique count (some users might have both records)
  const [newsletterSubscribers, registeredUsers] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true },
    }),
    prisma.user.findMany({
      where: { newsletterSubscribed: true },
      select: { email: true },
    }),
  ]);

  const uniqueEmails = new Set([
    ...newsletterSubscribers.map(s => s.email),
    ...registeredUsers.map(u => u.email),
  ]);

  return uniqueEmails.size;
}
