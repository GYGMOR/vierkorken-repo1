import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const news = await prisma.news.findMany({
    orderBy: [
      { isPinned: 'desc' },
      { publishedAt: 'desc' }
    ],
    include: { event: true }
  });
  console.log(JSON.stringify(news, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
