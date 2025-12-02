const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EVENTS = [
  {
    slug: 'burgundy-tasting-november',
    title: 'Burgunderweine Verkostung',
    subtitle: 'Eine Reise durch die Côte d\'Or',
    description: 'Entdecken Sie die Finesse und Eleganz burgundischer Weine. In dieser exklusiven Verkostung führen wir Sie durch die verschiedenen Appellationen der Côte d\'Or und verkosten gemeinsam 8 ausgewählte Weine.',
    eventType: 'TASTING',
    venue: 'VIERKORKEN Weinlounge',
    venueAddress: {
      street: 'Musterstrasse 1',
      city: 'Zürich',
      postalCode: '8000',
      country: 'Schweiz',
    },
    startDateTime: new Date('2024-11-25T18:00:00'),
    endDateTime: new Date('2024-11-25T21:00:00'),
    duration: 180,
    maxCapacity: 20,
    currentCapacity: 14,
    price: 95.00,
    memberPrice: 85.00,
    status: 'PUBLISHED',
    publishedAt: new Date(),
    featuredImage: '/events/burgundy.jpg',
    galleryImages: [],
  },
  {
    slug: 'italian-wine-dinner',
    title: 'Italienisches Weindinner',
    subtitle: '5-Gang Menü mit toskanischen Weinen',
    description: 'Genießen Sie ein exquisites italienisches Menü mit perfekt abgestimmten Weinen aus der Toskana. Jeder Gang wird von unserem Sommelier begleitet und die Weine werden ausführlich vorgestellt.',
    eventType: 'WINE_DINNER',
    venue: 'Ristorante Castello',
    venueAddress: {
      street: 'Via Roma 10',
      city: 'Zürich',
      postalCode: '8001',
      country: 'Schweiz',
    },
    startDateTime: new Date('2024-12-08T19:00:00'),
    endDateTime: new Date('2024-12-08T23:00:00'),
    duration: 240,
    maxCapacity: 24,
    currentCapacity: 18,
    price: 145.00,
    memberPrice: 130.00,
    minLoyaltyLevel: 2,
    status: 'PUBLISHED',
    publishedAt: new Date(),
    featuredImage: '/events/italian-dinner.jpg',
    galleryImages: [],
  },
  {
    slug: 'champagne-masterclass',
    title: 'Champagner Masterclass',
    subtitle: 'Die Kunst der Flaschengärung',
    description: 'Lernen Sie die Geschichte und Herstellung von Champagner kennen. Diese Masterclass führt Sie durch die verschiedenen Produktionsmethoden und wir verkosten 6 verschiedene Champagner.',
    eventType: 'MASTERCLASS',
    venue: 'VIERKORKEN Weinlounge',
    venueAddress: {
      street: 'Musterstrasse 1',
      city: 'Zürich',
      postalCode: '8000',
      country: 'Schweiz',
    },
    startDateTime: new Date('2024-12-15T15:00:00'),
    endDateTime: new Date('2024-12-15T17:30:00'),
    duration: 150,
    maxCapacity: 16,
    currentCapacity: 8,
    price: 125.00,
    memberPrice: 110.00,
    minLoyaltyLevel: 3,
    status: 'PUBLISHED',
    publishedAt: new Date(),
    featuredImage: '/events/champagne.jpg',
    galleryImages: [],
  },
];

async function main() {
  console.log('🌱 Seeding events...\n');

  for (const eventData of EVENTS) {
    const existing = await prisma.event.findUnique({
      where: { slug: eventData.slug },
    });

    if (existing) {
      console.log(`⏭️  Event "${eventData.title}" already exists, skipping...`);
      continue;
    }

    const event = await prisma.event.create({
      data: eventData,
    });

    console.log(`✅ Created event: ${event.title} (${event.slug})`);
  }

  console.log('\n✨ Done seeding events!');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Error seeding events:', e);
    process.exit(1);
  });
