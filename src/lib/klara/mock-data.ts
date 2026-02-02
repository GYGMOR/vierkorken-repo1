/**
 * Mock Data für KLARA API
 * Wird verwendet wenn USE_MOCK_KLARA=true in .env.local
 */

import { KlaraArticle, KlaraCategory, ParsedArticle } from './api-client';

// Mock Kategorien
export const mockCategories: KlaraCategory[] = [
  { id: 'cat-rotwein', nameDE: 'Rotwein' },
  { id: 'cat-weisswein', nameDE: 'Weisswein' },
  { id: 'cat-rosewein', nameDE: 'Roséwein' },
  { id: 'cat-schaumwein', nameDE: 'Schaumwein' },
  { id: 'cat-bio', nameDE: 'Bio-Weine' },
  { id: 'cat-schweiz', nameDE: 'Schweizer Weine' },
];

// Mock Artikel (Weine)
export const mockArticles: ParsedArticle[] = [
  // Rotweine
  {
    id: 'wine-001',
    articleNumber: 'RW-001',
    name: 'Château Margaux 2015',
    price: 450.00,
    description: 'Ein herausragender Bordeaux aus dem legendären Weingut Château Margaux. Komplex, elegant und langlebig.',
    categories: ['cat-rotwein'],
    stock: 15,
  },
  {
    id: 'wine-002',
    articleNumber: 'RW-002',
    name: 'Barolo Riserva DOCG 2016',
    price: 89.50,
    description: 'Kraftvoller italienischer Rotwein aus der Nebbiolo-Traube. Perfekt zu Fleischgerichten.',
    categories: ['cat-rotwein'],
    stock: 24,
  },
  {
    id: 'wine-003',
    articleNumber: 'RW-003',
    name: 'Pinot Noir Reserve Graubünden',
    price: 45.00,
    description: 'Eleganter Schweizer Pinot Noir aus den Bündner Bergen. Samtig und aromatisch.',
    categories: ['cat-rotwein', 'cat-schweiz'],
    stock: 32,
  },
  {
    id: 'wine-004',
    articleNumber: 'RW-004',
    name: 'Merlot Ticino DOC',
    price: 38.50,
    description: 'Weicher Tessiner Merlot mit fruchtigen Noten. Ein Klassiker aus der Schweiz.',
    categories: ['cat-rotwein', 'cat-schweiz'],
    stock: 28,
  },
  {
    id: 'wine-005',
    articleNumber: 'RW-005',
    name: 'Amarone della Valpolicella',
    price: 65.00,
    description: 'Vollmundiger italienischer Rotwein mit intensiven Aromen von Rosinen und Gewürzen.',
    categories: ['cat-rotwein'],
    stock: 18,
  },
  {
    id: 'wine-006',
    articleNumber: 'RW-006',
    name: 'Cabernet Sauvignon Napa Valley',
    price: 125.00,
    description: 'Kraftvoller kalifornischer Cabernet mit Noten von Cassis und Zedernholz.',
    categories: ['cat-rotwein'],
    stock: 12,
  },

  // Weissweine
  {
    id: 'wine-007',
    articleNumber: 'WW-001',
    name: 'Chasselas Lavaux AOC',
    price: 28.50,
    description: 'Frischer Schweizer Weisswein aus dem Lavaux. Mineralisch mit floralen Noten.',
    categories: ['cat-weisswein', 'cat-schweiz'],
    stock: 45,
  },
  {
    id: 'wine-008',
    articleNumber: 'WW-002',
    name: 'Chablis Premier Cru',
    price: 55.00,
    description: 'Eleganter französischer Chardonnay mit ausgeprägter Mineralität.',
    categories: ['cat-weisswein'],
    stock: 22,
  },
  {
    id: 'wine-009',
    articleNumber: 'WW-003',
    name: 'Sauvignon Blanc Marlborough',
    price: 32.00,
    description: 'Lebhafter neuseeländischer Weisswein mit Aromen von Stachelbeere und Grapefruit.',
    categories: ['cat-weisswein'],
    stock: 38,
  },
  {
    id: 'wine-010',
    articleNumber: 'WW-004',
    name: 'Riesling Mosel Kabinett',
    price: 24.50,
    description: 'Deutscher Riesling mit feiner Säure und fruchtigen Noten von Pfirsich und Apfel.',
    categories: ['cat-weisswein'],
    stock: 42,
  },
  {
    id: 'wine-011',
    articleNumber: 'WW-005',
    name: 'Grüner Veltliner Wachau',
    price: 29.00,
    description: 'Österreichischer Klassiker mit würzigen und pfeffrigen Noten.',
    categories: ['cat-weisswein'],
    stock: 35,
  },

  // Roséweine
  {
    id: 'wine-012',
    articleNumber: 'ROS-001',
    name: 'Provence Rosé AOC',
    price: 22.50,
    description: 'Eleganter französischer Rosé mit Aromen von roten Beeren und Zitrus.',
    categories: ['cat-rosewein'],
    stock: 50,
  },
  {
    id: 'wine-013',
    articleNumber: 'ROS-002',
    name: 'Pinot Noir Rosé Schweiz',
    price: 26.00,
    description: 'Frischer Schweizer Rosé aus Pinot Noir. Perfekt für Sommerabende.',
    categories: ['cat-rosewein', 'cat-schweiz'],
    stock: 40,
  },

  // Schaumweine
  {
    id: 'wine-014',
    articleNumber: 'SCH-001',
    name: 'Champagne Brut',
    price: 78.00,
    description: 'Klassischer französischer Champagner mit feinen Bläschen und eleganter Frucht.',
    categories: ['cat-schaumwein'],
    stock: 25,
  },
  {
    id: 'wine-015',
    articleNumber: 'SCH-002',
    name: 'Prosecco DOC Extra Dry',
    price: 18.50,
    description: 'Italienischer Prosecco mit frischen Aromen von Birne und Apfel.',
    categories: ['cat-schaumwein'],
    stock: 60,
  },
  {
    id: 'wine-016',
    articleNumber: 'SCH-003',
    name: 'Crémant de Bourgogne',
    price: 32.00,
    description: 'Eleganter französischer Schaumwein nach Champagner-Methode.',
    categories: ['cat-schaumwein'],
    stock: 30,
  },

  // Bio-Weine
  {
    id: 'wine-017',
    articleNumber: 'BIO-001',
    name: 'Merlot Bio Tessin',
    price: 42.00,
    description: 'Biologisch angebauter Tessiner Merlot. Nachhaltig und geschmackvoll.',
    categories: ['cat-rotwein', 'cat-bio', 'cat-schweiz'],
    stock: 20,
  },
  {
    id: 'wine-018',
    articleNumber: 'BIO-002',
    name: 'Chardonnay Bio Burgund',
    price: 48.50,
    description: 'Biodynamischer Chardonnay aus Burgund. Rein und authentisch.',
    categories: ['cat-weisswein', 'cat-bio'],
    stock: 18,
  },
];

/**
 * Get mock articles with optional filtering
 */
export function getMockArticles(categoryId?: string, search?: string): ParsedArticle[] {
  let filtered = [...mockArticles];

  // Apply category filter
  if (categoryId) {
    filtered = filtered.filter(article => article.categories.includes(categoryId));
  }

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(article =>
      article.name.toLowerCase().includes(searchLower) ||
      article.articleNumber.toLowerCase().includes(searchLower) ||
      article.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Get mock categories
 */
export function getMockCategories(): KlaraCategory[] {
  return [...mockCategories];
}
