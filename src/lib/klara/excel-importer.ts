/**
 * KLARA Excel Importer
 * Moderne TypeScript-Implementation zum Import von KLARA Produktdaten
 */

import * as XLSX from 'xlsx';
import { PrismaClient, WineType } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface KlaraProduct {
  artikelNummer: string;
  name: string;
  kategorie?: string;
  preis: number;
  bestand: number;
  beschreibung?: string;
  produzent?: string;
  region?: string;
  jahrgang?: number;
  alkoholgehalt?: number;
  volumen?: number;
}

/**
 * Parse Excel file and extract product data
 */
export async function parseKlaraExcel(filePath: string): Promise<KlaraProduct[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

  const products: KlaraProduct[] = [];

  for (const row of rawData) {
    // Map Excel columns to our structure
    // Adjust column names based on actual Excel structure
    const product: KlaraProduct = {
      artikelNummer: row['Artikelnummer'] || row['SKU'] || row['Artikel-Nr.'] || '',
      name: row['Name'] || row['Produktname'] || row['Bezeichnung'] || '',
      kategorie: row['Kategorie'] || row['Warengruppe'],
      preis: parseFloat(row['Preis'] || row['VK-Preis'] || row['Verkaufspreis'] || '0'),
      bestand: parseInt(row['Bestand'] || row['Lagerbestand'] || row['Stock'] || '0'),
      beschreibung: row['Beschreibung'] || row['Description'],
      produzent: row['Produzent'] || row['Hersteller'] || row['Lieferant'],
      region: row['Region'] || row['Herkunft'],
      jahrgang: parseInt(row['Jahrgang'] || row['Vintage'] || '0') || undefined,
      alkoholgehalt: parseFloat(row['Alkoholgehalt'] || row['Alk.%'] || '0') || undefined,
      volumen: parseFloat(row['Volumen'] || row['Inhalt'] || '750') || 750,
    };

    if (product.artikelNummer && product.name) {
      products.push(product);
    }
  }

  return products;
}

/**
 * Determine wine type from category or name
 */
function determineWineType(product: KlaraProduct): WineType {
  const name = product.name.toLowerCase();
  const kategorie = (product.kategorie || '').toLowerCase();

  const text = `${name} ${kategorie}`;

  // Schaumwein / Sparkling
  if (text.match(/schaum|champagner|prosecco|sekt|crémant|spumante|brut|pétillant|sparkling/i)) {
    return WineType.SPARKLING;
  }

  // Rosé
  if (text.match(/rosé|rosato|blauburgunder rosé/i)) {
    return WineType.ROSE;
  }

  // Rotwein
  if (text.match(/rot|rouge|red|merlot|cabernet|pinot noir|syrah|nero|barolo|barbera/i)) {
    return WineType.RED;
  }

  // Weißwein
  if (text.match(/weiss|blanc|white|chardonnay|sauvignon|riesling|chasselas|johannisberg|pinot gris/i)) {
    return WineType.WHITE;
  }

  // Dessertwein
  if (text.match(/dessert|süss|süß|dolce|moelleux|eiswein|portwein|sherry/i)) {
    return WineType.DESSERT;
  }

  // Default: White
  return WineType.WHITE;
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(name: string, vintage?: number): string {
  let slug = name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (vintage) {
    slug += `-${vintage}`;
  }

  return slug;
}

/**
 * Import products to database
 */
export async function importProductsToDatabase(
  products: KlaraProduct[]
): Promise<{ created: number; updated: number; errors: number }> {
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const wineType = determineWineType(product);
      const slug = generateSlug(product.name, product.jahrgang);

      // Check if wine already exists (by klaraId)
      const existing = await prisma.wine.findFirst({
        where: { klaraId: product.artikelNummer },
      });

      if (existing) {
        // Update existing wine
        await prisma.wine.update({
          where: { id: existing.id },
          data: {
            name: product.name,
            winery: product.produzent || 'Unknown',
            region: product.region || 'Switzerland',
            vintage: product.jahrgang,
            alcoholContent: product.alkoholgehalt,
            description: product.beschreibung,
            wineType: wineType,
            updatedAt: new Date(),
          },
        });

        // Update variant
        const variant = await prisma.wineVariant.findFirst({
          where: { wineId: existing.id },
        });

        if (variant) {
          await prisma.wineVariant.update({
            where: { id: variant.id },
            data: {
              price: product.preis,
              stockQuantity: product.bestand,
              isAvailable: product.bestand > 0,
            },
          });
        }

        updated++;
      } else {
        // Create new wine
        const wine = await prisma.wine.create({
          data: {
            name: product.name,
            slug: slug,
            klaraId: product.artikelNummer,
            winery: product.produzent || 'Unknown',
            region: product.region || 'Switzerland',
            country: 'CH',
            vintage: product.jahrgang,
            wineType: wineType,
            alcoholContent: product.alkoholgehalt,
            description: product.beschreibung,
            isActive: product.bestand > 0,
            grapeVarieties: [],
            aromaProfile: [],
            foodPairings: [],
            certifications: [],
            allergens: ['sulfites'],
          },
        });

        // Create variant
        await prisma.wineVariant.create({
          data: {
            wineId: wine.id,
            sku: product.artikelNummer,
            bottleSize: product.volumen ? product.volumen / 1000 : 0.75, // Convert ml to liters, default to 0.75L
            vintage: product.jahrgang,
            price: product.preis,
            stockQuantity: product.bestand,
            isAvailable: product.bestand > 0,
          },
        });

        created++;
      }
    } catch (error: any) {
      console.error(`Error importing ${product.name}:`, error.message);
      errors++;
    }
  }

  return { created, updated, errors };
}

/**
 * Main import function
 */
export async function importFromKlaraExcel(): Promise<{
  success: boolean;
  message: string;
  stats: { created: number; updated: number; errors: number; total: number };
}> {
  try {
    const excelPath = path.join(
      process.cwd(),
      'vierkorken-claude',
      'vierkorken-claude',
      'database',
      'Artikel_Export.xlsx'
    );

    console.log('📄 Reading Excel file:', excelPath);
    const products = await parseKlaraExcel(excelPath);

    console.log(`✅ Parsed ${products.length} products from Excel`);

    console.log('💾 Importing to database...');
    const stats = await importProductsToDatabase(products);

    await prisma.$disconnect();

    return {
      success: true,
      message: 'Import completed successfully',
      stats: {
        ...stats,
        total: products.length,
      },
    };
  } catch (error: any) {
    await prisma.$disconnect();

    return {
      success: false,
      message: error.message,
      stats: { created: 0, updated: 0, errors: 0, total: 0 },
    };
  }
}
