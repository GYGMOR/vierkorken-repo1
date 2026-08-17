'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate or retrieve persistent browser session ID
    let sessionId = localStorage.getItem('vk_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('vk_session_id', sessionId);
    }

    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            title: document.title,
            referrer: document.referrer || 'Direct',
            sessionId,
          }),
        });
      } catch (err) {
        // Silent catch
      }
    };

    trackVisit();

    // Heartbeat every 60s to maintain live status
    const interval = setInterval(trackVisit, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
