/**
 * Loyalty System Business Logic
 * Handles point calculation, level management, and badge triggers
 */

export interface LoyaltyLevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
}

export const LOYALTY_LEVELS: LoyaltyLevel[] = [
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
    benefits: ['Willkommensgeschenk', 'Persönliche Weinvorschläge'],
  },
  {
    level: 3,
    name: 'Kenner',
    minPoints: 1500,
    maxPoints: 4999,
    benefits: ['Exklusives Geschenk', 'Vorverkaufszugang zu neuen Weinen'],
  },
  {
    level: 4,
    name: 'Sommelier-Kreis',
    minPoints: 5000,
    maxPoints: 11999,
    benefits: ['Premium Geschenk', 'Exklusive Probierpakete'],
  },
  {
    level: 5,
    name: 'Weinguts-Partner',
    minPoints: 12000,
    maxPoints: 24999,
    benefits: ['Luxus Geschenk', 'Zugang zu Winzer-Events'],
  },
  {
    level: 6,
    name: 'Connaisseur-Elite',
    minPoints: 25000,
    maxPoints: 59999,
    benefits: ['Elite Geschenk', 'Reservierungen & persönliche Beratung'],
  },
  {
    level: 7,
    name: 'Grand-Cru Ehrenmitglied',
    minPoints: 60000,
    maxPoints: null,
    benefits: [
      'Grand-Cru Geschenk',
      'Private Tastings',
      'Zugang zu Raritäten',
      'VIP-Status',
    ],
  },
];

/**
 * Calculate loyalty points from purchase amount
 * 1 CHF = X points (fetched from DB, default 1.0)
 */
export async function calculatePointsFromAmount(amount: number, prisma: any): Promise<number> {
  try {
    const rule = await prisma.loyaltyProgramRule.findUnique({
      where: { identifier: 'purchase' }
    });
    const pointsRatio = rule ? parseFloat(rule.points) : 1.0;
    return Math.floor(amount * pointsRatio);
  } catch (error) {
    console.error('Error calculating points from amount:', error);
    return Math.floor(amount * 1.0); // Fallback
  }
}

/**
 * Get loyalty level from points
 */
export function getLevelFromPoints(points: number): LoyaltyLevel {
  for (let i = LOYALTY_LEVELS.length - 1; i >= 0; i--) {
    const level = LOYALTY_LEVELS[i];
    if (points >= level.minPoints) {
      return level;
    }
  }
  return LOYALTY_LEVELS[0];
}

/**
 * Get next loyalty level
 */
export function getNextLevel(currentLevel: number): LoyaltyLevel | null {
  return LOYALTY_LEVELS.find((l) => l.level === currentLevel + 1) || null;
}

/**
 * Calculate points needed for next level
 */
export function getPointsToNextLevel(currentPoints: number): number {
  const currentLevel = getLevelFromPoints(currentPoints);
  const nextLevel = getNextLevel(currentLevel.level);

  if (!nextLevel) return 0; // Already at max level

  return nextLevel.minPoints - currentPoints;
}

/**
 * Badge trigger types and their conditions
 */
export interface BadgeTrigger {
  type: string;
  checkCondition: (data: any) => boolean;
}

export const BADGE_TRIGGERS: Record<string, BadgeTrigger> = {
  // Time-based purchase badges
  purchase_time_night: {
    type: 'purchase_time',
    checkCondition: (orderTime: any) => {
      const hour = orderTime.getHours();
      return hour >= 0 && hour < 3;
    },
  },
  purchase_time_morning: {
    type: 'purchase_time',
    checkCondition: (orderTime: any) => {
      const hour = orderTime.getHours();
      return hour >= 5 && hour < 10;
    },
  },

  // Region diversity
  regions_explorer: {
    type: 'regions',
    checkCondition: (uniqueRegions: any) => uniqueRegions >= 6,
  },

  // Vintage collection
  vintage_collector: {
    type: 'vintages',
    checkCondition: (uniqueVintages: any) => uniqueVintages >= 8,
  },

  // Event participation
  event_guest: {
    type: 'event',
    checkCondition: (eventAttended: any) => eventAttended,
  },

  // Tenure/loyalty
  loyal_customer: {
    type: 'tenure',
    checkCondition: (monthsActive: any) => monthsActive >= 12,
  },
};

/**
 * Point rewards for different actions
 */
export const POINT_REWARDS = {
  REVIEW: 40,
  EVENT_ATTENDANCE: 100, // Changed from 150
  REFERRAL: 25, // Changed from 250
  NEWSLETTER_SIGNUP: 50,
};

/**
 * Check if user should receive a badge
 */
export async function checkBadgeEligibility(
  userId: string,
  badgeSlug: string,
  data: any
): Promise<boolean> {
  const trigger = BADGE_TRIGGERS[badgeSlug as keyof typeof BADGE_TRIGGERS];
  if (!trigger) return false;

  return trigger.checkCondition(data);
}

/**
 * Update user's loyalty level based on their current points
 * Returns true if level changed
 */
export async function updateUserLoyaltyLevel(
  userId: string,
  prisma: any
): Promise<{ levelChanged: boolean; oldLevel: number; newLevel: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true, loyaltyLevel: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const correctLevel = getLevelFromPoints(user.loyaltyPoints);

  if (correctLevel.level !== user.loyaltyLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyLevel: correctLevel.level },
    });

    console.log(`🎉 User ${userId} leveled up! ${user.loyaltyLevel} → ${correctLevel.level} (${correctLevel.name})`);

    return {
      levelChanged: true,
      oldLevel: user.loyaltyLevel,
      newLevel: correctLevel.level,
    };
  }

  return {
    levelChanged: false,
    oldLevel: user.loyaltyLevel,
    newLevel: user.loyaltyLevel,
  };
}
