/**
 * Public Review API - Submit and fetch reviews for wines
 * 🔒 SECURITY: Rate limiting + Input validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

  applyRateLimit,
  requireAuth,
  validateReviewInput,
  sanitizeString,
  logSecurityEvent,
} from '@/lib/security';

/**
 * GET - Fetch reviews for a specific wine
 * 🔒 SECURITY: Rate limited to prevent abuse
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting: 200 requests per minute
  const rateLimitResponse = await applyRateLimit(request, 200, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = request.nextUrl;
  const wineId = searchParams.get('wineId');

  if (!wineId) {
    return NextResponse.json(
      { success: false, error: 'wineId is required' },
      { status: 400 }
    );
  }

  // Sanitize input
  const sanitizedWineId = sanitizeString(wineId, 100);

  try {
    // Find the wine first (could be by id or klaraId)
    const wine = await prisma.wine.findFirst({
      where: {
        OR: [
          { id: sanitizedWineId },
          { klaraId: sanitizedWineId },
        ],
      },
    });

    if (!wine) {
      return NextResponse.json({
        success: true,
        data: [], // Return empty array if wine not found
      });
    }

    // Now fetch reviews using the actual wine database ID
    const reviews = await prisma.review.findMany({
      where: {
        wineId: wine.id, // Use the actual database ID
        isApproved: true, // Only show approved reviews to public
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      rating: review.rating,
      title: review.title,
      reviewText: review.comment,
      createdAt: review.createdAt.toISOString(),
      isVerifiedPurchase: review.isVerifiedPurchase,
    }));

    return NextResponse.json({
      success: true,
      data: formattedReviews,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Submit a new review (requires authentication)
 * 🔒 SECURITY: Rate limited + Input validation + Authentication required
 */
export async function POST(request: NextRequest) {
  // Apply stricter rate limiting for POST: 20 reviews per hour
  const rateLimitResponse = await applyRateLimit(request, 20, 60 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  // Require authentication
  const session = await requireAuth(request);
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();

    // Validate input using security helper
    const { valid, errors } = validateReviewInput(body);
    if (!valid) {
      logSecurityEvent('Invalid review input', { errors, email: session.user.email }, 'low');
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const { wineId, rating, title, comment } = body;

    // Sanitize text inputs
    const sanitizedTitle = title ? sanitizeString(title, 200) : null;
    const sanitizedComment = comment ? sanitizeString(comment, 2000) : null;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if wine exists in database (by id or klaraId)
    let wine = await prisma.wine.findFirst({
      where: {
        OR: [
          { id: wineId },
          { klaraId: wineId }, // Check if it's a KLARA product
        ],
      },
      include: {
        variants: true, // Include variants for verified purchase check
      },
    });

    // If wine doesn't exist, create it automatically for KLARA products
    if (!wine) {
      try {
        console.log('🔍 Wine not found in database, creating entry for KLARA product:', wineId);

        // Fetch from KLARA API directly using the correct import
        const { fetchKlaraArticles } = await import('@/lib/klara/api-client');
        const klaraArticles = await fetchKlaraArticles();

        // Find the specific product
        const klaraProduct = klaraArticles.find((p: any) => p.id === wineId);

        if (klaraProduct) {
          console.log('✅ Found KLARA product:', klaraProduct.name);

          // Create wine entry in database for KLARA product
          wine = await prisma.wine.create({
            data: {
              klaraId: klaraProduct.id,
              name: klaraProduct.name,
              slug: `klara-${klaraProduct.id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`, // Safe slug
              winery: 'KLARA Sortiment',
              region: 'Schweiz',
              country: 'Schweiz',
              grapeVarieties: [],
              wineType: 'RED', // Default, will be shown from KLARA data
              description: klaraProduct.description || klaraProduct.name,
              aromaProfile: [],
              foodPairings: [],
              certifications: [],
              allergens: ['sulfites'], // Standard wine allergen
              isActive: true,
            },
            include: {
              variants: true,
            },
          });

          console.log('✅ Created Wine entry for KLARA product:', wine.id, wine.name);
        } else {
          console.error('❌ KLARA product not found:', wineId);
        }
      } catch (error) {
        console.error('❌ Error fetching/creating KLARA wine:', error);
        // Log detailed error for debugging
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      }
    }

    if (!wine) {
      console.error('❌ Final check: Wine still not found after creation attempt. wineId:', wineId);
      return NextResponse.json(
        { success: false, error: 'Produkt konnte nicht gefunden werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this wine
    // Use wine.id (the actual database ID), not wineId
    const existingReview = await prisma.review.findUnique({
      where: {
        wineId_userId: {
          wineId: wine.id, // Use the actual Wine database ID
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Du hast diesen Wein bereits bewertet' },
        { status: 400 }
      );
    }

    // Check if user has purchased this wine (verified purchase)
    // For KLARA products, we skip this check since OrderItems don't have wineId
    let hasPurchased = false;

    // Only check for wines that have variants (non-KLARA products)
    if (wine.variants && wine.variants.length > 0) {
      const variantIds = wine.variants.map((v: any) => v.id);
      hasPurchased = !!(await prisma.orderItem.findFirst({
        where: {
          variantId: { in: variantIds },
          order: {
            userId: user.id,
            status: {
              in: ['CONFIRMED', 'DELIVERED'],
            },
          },
        },
      }));
    }

    // Create review (automatically approved)
    // Use wine.id (the actual database ID), not wineId (which could be KLARA ID)
    // Use sanitized inputs to prevent XSS
    const review = await prisma.review.create({
      data: {
        wineId: wine.id, // Use the actual Wine database ID
        userId: user.id,
        rating,
        title: sanitizedTitle,
        comment: sanitizedComment,
        isApproved: true, // Auto-approve all reviews
        isVerifiedPurchase: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bewertung erfolgreich veröffentlicht!',
      data: {
        id: review.id,
        userName: `${review.user.firstName} ${review.user.lastName}`,
        rating: review.rating,
        title: review.title,
        reviewText: review.comment,
        createdAt: review.createdAt.toISOString(),
        isVerifiedPurchase: review.isVerifiedPurchase,
      },
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
