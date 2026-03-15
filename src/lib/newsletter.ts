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
  type?: string;
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

    newsletterSubscribers.forEach((sub: any) => {
      emailMap.set(sub.email, { email: sub.email, firstName: sub.firstName || undefined });
    });

    registeredUsers.forEach((user: any) => {
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

    // Send emails in small chunks (e.g. 5 at a time) to avoid memory issues and rate limits
    // while still being faster than pure sequential
    let successCount = 0;
    let failCount = 0;
    const chunkSize = 5;

    for (let i = 0; i < allSubscribers.length; i += chunkSize) {
      const chunk = allSubscribers.slice(i, i + chunkSize);
      
      const results = await Promise.all(
        chunk.map(async (subscriber) => {
          try {
            await sendNewsNotificationEmail(subscriber.email, newsItem, subscriber.firstName);
            return { success: true };
          } catch (error) {
            console.error(`❌ Failed to send to ${subscriber.email}:`, error);
            return { success: false };
          }
        })
      );
      
      successCount += results.filter(r => r.success).length;
      failCount += results.filter(r => !r.success).length;

      // Small delay between chunks (200ms)
      if (i + chunkSize < allSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
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
    ...newsletterSubscribers.map((s: any) => s.email),
    ...registeredUsers.map((u: any) => u.email),
  ]);

  return uniqueEmails.size;
}
