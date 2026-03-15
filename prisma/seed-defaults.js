const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.knowledgeCategory.count();
    if (count > 0) {
        console.log('Categories already exist, skipping seed.');
        return;
    }

    const defaults = [
        {
            title: 'Rebsorten',
            description: 'Lernen Sie die Unterschiede zwischen Rotwein, Weisswein, Rosé und Schaumwein kennen.',
            icon: 'grape',
            sortOrder: 1,
        },
        {
            title: 'Weinregionen',
            description: 'Entdecken Sie die bedeutendsten Weinregionen der Welt und ihre Besonderheiten.',
            icon: 'storage',
            sortOrder: 2,
        },
        {
            title: 'Verkostung',
            description: 'Die Kunst der Weinverkostung: Sehen, Riechen, Schmecken.',
            icon: 'nose',
            sortOrder: 3,
        },
        {
            title: 'Food Pairing',
            description: 'Welcher Wein passt zu welchem Essen? Wir verraten es Ihnen.',
            icon: 'food',
            sortOrder: 4,
        },
    ];

    for (const cat of defaults) {
        await prisma.knowledgeCategory.create({
            data: cat,
        });
    }
    console.log('Categories seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
