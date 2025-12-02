const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get the most recent order with event tickets
  const order = await prisma.order.findFirst({
    where: {
      eventTickets: {
        some: {},
      },
    },
    include: {
      items: true,
      eventTickets: {
        include: {
          event: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!order) {
    console.log('❌ No orders with event tickets found');
    return;
  }

  console.log('\n📦 Order Summary:');
  console.log('==================');
  console.log(`Order Number: ${order.orderNumber}`);
  console.log(`Order ID: ${order.id}`);
  console.log(`Status: ${order.status}`);
  console.log(`Payment Status: ${order.paymentStatus}`);
  console.log(`Total: CHF ${order.total}`);
  console.log(`Points Earned: ${order.pointsEarned}`);

  console.log('\n🍷 Wine Items: ' + order.items.length);
  order.items.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.wineName} (${item.quantity}x CHF ${item.unitPrice})`);
  });

  console.log('\n🎫 Event Tickets: ' + order.eventTickets.length);
  order.eventTickets.forEach((ticket, i) => {
    console.log(`  ${i + 1}. ${ticket.event?.title || 'Unknown Event'}`);
    console.log(`     Ticket #: ${ticket.ticketNumber}`);
    console.log(`     Price: CHF ${ticket.price}`);
    console.log(`     Status: ${ticket.status}`);
  });

  console.log('\n✅ Order has both wine items and event tickets!');
  console.log(`\n🔗 View order at: http://localhost:3000/konto/bestellung/${order.id}`);

  await prisma.$disconnect();
}

main();
