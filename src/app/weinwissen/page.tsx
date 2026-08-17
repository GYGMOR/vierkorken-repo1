import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { WeinwissenClient } from '@/components/weinwissen/WeinwissenClient';

export default async function WeinwissenPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  let isAdmin = false;

  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { role: true },
    });
    if (dbUser && dbUser.role === 'ADMIN') {
      isAdmin = true;
    }
  }

  return <WeinwissenClient isAdmin={isAdmin} />;
}
