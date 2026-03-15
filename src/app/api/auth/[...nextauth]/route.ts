import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

