import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in CHF
 */
export function formatPrice(amount: number | string, currency: string = 'CHF'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(numericAmount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'long'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat('de-CH', formats[format]).format(dateObj);
}

/**
 * Create URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Calculate loyalty points from amount
 * 1 CHF = 1 Point
 */
export function calculateLoyaltyPoints(amount: number): number {
  return Math.floor(amount);
}

/**
 * Get loyalty level from points
 */
export function getLoyaltyLevel(points: number): number {
  if (points < 500) return 1;
  if (points < 1500) return 2;
  if (points < 5000) return 3;
  if (points < 12000) return 4;
  if (points < 25000) return 5;
  if (points < 60000) return 6;
  return 7;
}

/**
 * Get loyalty level name
 */
export function getLoyaltyLevelName(level: number): string {
  const names = {
    1: 'Novize',
    2: 'Kellerfreund',
    3: 'Kenner',
    4: 'Sommelier-Kreis',
    5: 'Weinguts-Partner',
    6: 'Connaisseur-Elite',
    7: 'Grand-Cru Ehrenmitglied',
  };

  return names[level as keyof typeof names] || 'Unbekannt';
}

/**
 * Get cashback percentage for loyalty level
 * @deprecated Cashback system replaced by Gift system
 */
export function getCashbackPercentage(level: number): number {
  return 0;
}

/**
 * Calculate cashback amount
 * @deprecated Cashback system replaced by Gift system
 */
export function calculateCashback(amount: number, level: number): number {
  return 0;
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `VK-${timestamp}-${random}`;
}

/**
 * Get wine type display name
 */
export function getWineTypeName(type: string): string {
  const types: Record<string, string> = {
    RED: 'Rotwein',
    WHITE: 'Weißwein',
    ROSE: 'Roséwein',
    SPARKLING: 'Schaumwein',
    DESSERT: 'Dessertwein',
    FORTIFIED: 'Verstärkter Wein',
  };

  return types[type] || type;
}

/**
 * Format bottle size for display
 */
export function formatBottleSize(liters: number): string {
  if (liters < 1) {
    return `${(liters * 1000).toFixed(0)} ml`;
  }
  return `${liters.toFixed(2)} l`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if value is within range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
