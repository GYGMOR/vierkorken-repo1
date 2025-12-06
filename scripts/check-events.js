const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEvents() {
  console.log('\n🔍 Checking Events in Database...\n');

  try {
    // Get all events
    const allEvents = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        startDateTime: true,
        featuredImage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Total Events in DB: ${allEvents.length}\n`);

    if (allEvents.length === 0) {
      console.log('❌ No events found in database!');
      console.log('💡 Create events in the Admin Panel first.\n');
      return;
    }

    // Show all events
    console.log('📋 All Events:');
    allEvents.forEach((event, i) => {
      console.log(`\n${i + 1}. ${event.title}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start: ${event.startDateTime}`);
      console.log(`   Image: ${event.featuredImage || '❌ No image'}`);
      console.log(`   Is Future: ${new Date(event.startDateTime) >= new Date() ? '✅' : '❌ Past event'}`);
      console.log(`   Is Published: ${event.status === 'PUBLISHED' ? '✅' : '❌'}`);
    });

    // Check what API would return
    const publishedFutureEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startDateTime: {
          gte: new Date(),
        },
      },
    });

    console.log(`\n\n📡 Events that API would return: ${publishedFutureEvents.length}`);

    if (publishedFutureEvents.length === 0) {
      console.log('\n⚠️  No PUBLISHED events with future dates found!');
      console.log('💡 Make sure to:');
      console.log('   1. Set event status to PUBLISHED in Admin Panel');
      console.log('   2. Set startDateTime to a future date');
    } else {
      console.log('\n✅ These events will show on website:');
      publishedFutureEvents.forEach((event) => {
        console.log(`   - ${event.title}`);
        console.log(`     Image: ${event.featuredImage || '❌ No image'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvents();
