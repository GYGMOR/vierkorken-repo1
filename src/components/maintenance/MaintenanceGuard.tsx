'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * MaintenanceGuard
 * Checks maintenance mode status and redirects non-admin users to coming-soon page
 * This runs on the client side to work around Edge Runtime limitations
 */
export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip check for certain paths
    const skipPaths = [
      '/coming-soon',
      '/api/',
      '/_next/',
    ];

    if (skipPaths.some(path => pathname.startsWith(path))) {
      return;
    }

    // Check maintenance status
    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/maintenance/status');
        const data = await res.json();

        if (data.enabled) {
          // Check if user is admin
          const isAdmin = session?.user?.role === 'ADMIN';

          if (!isAdmin) {
            router.replace('/coming-soon');
          }
        }
      } catch (error) {
        // On error, don't block - let users through
        console.error('MaintenanceGuard check failed:', error);
      }
    };

    // Only check after session is loaded (or confirmed not logged in)
    if (status !== 'loading') {
      checkMaintenance();
    }
  }, [pathname, session, status, router]);

  return <>{children}</>;
}
