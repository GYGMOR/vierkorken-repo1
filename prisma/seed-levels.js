const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LOYALTY_LEVELS = [
    {
        level: 1,
        name: 'Novize',
        minPoints: 0,
        maxPoints: 499,
        benefits: ['Einstieg in die Weinwelt'],
    },
    {
        level: 2,
        name: 'Kellerfreund',
        minPoints: 500,
        maxPoints: 1499,
        benefits: ['Willkommensgeschenk (Level 2)', 'Persönliche Weinvorschläge'],
    },
    {
        level: 3,
        name: 'Kenner',
        minPoints: 1500,
        maxPoints: 4999,
        benefits: ['Willkommensgeschenk (Level 3)', 'Vorverkaufszugang zu neuen Weinen'],
    },
    {
        level: 4,
        name: 'Sommelier-Kreis',
        minPoints: 5000,
        maxPoints: 11999,
        benefits: ['Willkommensgeschenk (Level 4)', 'Exklusive Probierpakete'],
    },
    {
        level: 5,
        name: 'Weinguts-Partner',
        minPoints: 12000,
        maxPoints: 24999,
        benefits: ['Willkommensgeschenk (Level 5)', 'Zugang zu Winzer-Events'],
    },
    {
        level: 6,
        name: 'Connaisseur-Elite',
        minPoints: 25000,
        maxPoints: 59999,
        benefits: ['Willkommensgeschenk (Level 6)', 'Reservierungen & persönliche Beratung'],
    },
    {
        level: 7,
        name: 'Grand-Cru Ehrenmitglied',
        minPoints: 60000,
        maxPoints: null,
        benefits: ['Willkommensgeschenk (Level 7)', 'Private Tastings', 'Zugang zu Raritäten', 'VIP-Status'],
    },
];

async function main() {
    console.log('Start seeding Loyalty Levels...');

    for (const level of LOYALTY_LEVELS) {
        await prisma.loyaltyLevel.upsert({
            where: { level: level.level },
            update: {
                name: level.name,
                minPoints: level.minPoints,
                maxPoints: level.maxPoints,
                benefits: level.benefits,
            },
            create: {
                level: level.level,
                name: level.name,
                minPoints: level.minPoints,
                maxPoints: level.maxPoints,
                benefits: level.benefits,
            },
        });
        console.log(`Upserted Level ${level.level}: ${level.name}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
