-- ============================================================
-- VIERKORKEN PostgreSQL Database Schema
-- Generated from Prisma Schema for render.com deployment
-- ============================================================

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS "mediaasset" CASCADE;
DROP TABLE IF EXISTS "klaraproductoverride" CASCADE;
DROP TABLE IF EXISTS "klarasync" CASCADE;
DROP TABLE IF EXISTS "blogpost" CASCADE;
DROP TABLE IF EXISTS "eventticket" CASCADE;
DROP TABLE IF EXISTS "event" CASCADE;
DROP TABLE IF EXISTS "review" CASCADE;
DROP TABLE IF EXISTS "orderitem" CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS "coupon" CASCADE;
DROP TABLE IF EXISTS "wishlistitem" CASCADE;
DROP TABLE IF EXISTS "cartitem" CASCADE;
DROP TABLE IF EXISTS "cart" CASCADE;
DROP TABLE IF EXISTS "wineimage" CASCADE;
DROP TABLE IF EXISTS "winevariant" CASCADE;
DROP TABLE IF EXISTS "wine" CASCADE;
DROP TABLE IF EXISTS "userbadge" CASCADE;
DROP TABLE IF EXISTS "badge" CASCADE;
DROP TABLE IF EXISTS "loyaltytransaction" CASCADE;
DROP TABLE IF EXISTS "loyaltylevel" CASCADE;
DROP TABLE IF EXISTS "address" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Create ENUM types
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SOMMELIER');
CREATE TYPE "WineType" AS ENUM ('RED', 'WHITE', 'ROSE', 'SPARKLING', 'DESSERT', 'FORTIFIED');
CREATE TYPE "ImageType" AS ENUM ('PRODUCT', 'LABEL', 'WINERY', 'GALLERY', 'LIFESTYLE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "DeliveryMethod" AS ENUM ('SHIPPING', 'PICKUP');
CREATE TYPE "EventType" AS ENUM ('TASTING', 'WINE_DINNER', 'MASTERCLASS', 'WINERY_VISIT', 'FESTIVAL', 'PRIVATE');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED');
CREATE TYPE "TicketStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'CHECKED_IN', 'REFUNDED');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'GIFT_CARD');

-- ============================================================
-- USER & AUTHENTICATION
-- ============================================================

CREATE TABLE "user" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "loyaltyLevel" INTEGER NOT NULL DEFAULT 1,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "emailVerified" TIMESTAMP,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "lastLoginAt" TIMESTAMP
);

CREATE TABLE "address" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'CH',
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isBilling" BOOLEAN NOT NULL DEFAULT false,
    "isShipping" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- ============================================================
-- LOYALTY & GAMIFICATION
-- ============================================================

CREATE TABLE "loyaltylevel" (
    "id" SERIAL PRIMARY KEY,
    "level" INTEGER UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "minPoints" INTEGER NOT NULL,
    "maxPoints" INTEGER,
    "cashbackPercent" DECIMAL(4,2) NOT NULL,
    "benefits" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "loyaltytransaction" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceId" TEXT,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "badge" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconType" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "userbadge" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
    FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE CASCADE,
    UNIQUE("userId", "badgeId")
);

-- ============================================================
-- PRODUCTS & WINE DATA
-- ============================================================

CREATE TABLE "wine" (
    "id" TEXT PRIMARY KEY,
    "klaraId" TEXT UNIQUE,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "winery" TEXT NOT NULL,
    "winerySlug" TEXT,
    "region" TEXT NOT NULL,
    "subRegion" TEXT,
    "country" TEXT NOT NULL,
    "grapeVarieties" JSONB NOT NULL,
    "vintage" INTEGER,
    "wineType" "WineType" NOT NULL,
    "category" TEXT,
    "classification" TEXT,
    "alcoholContent" DECIMAL(4,2),
    "residualSugar" DECIMAL(6,2),
    "acidity" DECIMAL(4,2),
    "dryness" INTEGER,
    "body" INTEGER,
    "acidityLevel" INTEGER,
    "tanninLevel" INTEGER,
    "tastingNotes" TEXT,
    "aromaProfile" JSONB NOT NULL,
    "foodPairings" JSONB NOT NULL,
    "drinkingWindow" TEXT,
    "servingTemp" TEXT,
    "decanting" TEXT,
    "storagePotential" TEXT,
    "description" TEXT,
    "winemaker" TEXT,
    "vinification" TEXT,
    "terroir" TEXT,
    "awards" JSONB,
    "isBio" BOOLEAN NOT NULL DEFAULT false,
    "isDemeter" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "certifications" JSONB NOT NULL,
    "allergens" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "availableFrom" TIMESTAMP,
    "availableUntil" TIMESTAMP,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "winevariant" (
    "id" TEXT PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "klaraVariantId" TEXT UNIQUE,
    "sku" TEXT UNIQUE NOT NULL,
    "bottleSize" DECIMAL(6,3) NOT NULL,
    "vintage" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "costPrice" DECIMAL(10,2),
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "preOrder" BOOLEAN NOT NULL DEFAULT false,
    "estimatedRestock" TIMESTAMP,
    "weight" DECIMAL(8,3),
    "barcode" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("wineId") REFERENCES "wine"("id") ON DELETE CASCADE
);

CREATE TABLE "wineimage" (
    "id" TEXT PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "title" TEXT,
    "imageType" "ImageType" NOT NULL DEFAULT 'PRODUCT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("wineId") REFERENCES "wine"("id") ON DELETE CASCADE
);

-- ============================================================
-- CART & WISHLIST
-- ============================================================

CREATE TABLE "cart" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT UNIQUE,
    "userId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMP
);

CREATE TABLE "cartitem" (
    "id" TEXT PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isGift" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "giftWrap" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "winevariant"("id"),
    UNIQUE("cartId", "variantId")
);

CREATE TABLE "wishlistitem" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "winevariant"("id") ON DELETE CASCADE,
    UNIQUE("userId", "variantId")
);

-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE "coupon" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT UNIQUE NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minOrderAmount" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "validFrom" TIMESTAMP NOT NULL,
    "validUntil" TIMESTAMP,
    "maxUses" INTEGER,
    "maxUsesPerUser" INTEGER DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS & CHECKOUT
-- ============================================================

CREATE TABLE "order" (
    "id" TEXT PRIMARY KEY,
    "orderNumber" TEXT UNIQUE NOT NULL,
    "userId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "couponId" TEXT,
    "couponCode" TEXT,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "cashbackAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP,
    "paymentIntentId" TEXT UNIQUE,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'SHIPPING',
    "shippingMethod" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    "customerNote" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "cancelledAt" TIMESTAMP,
    "cancellationReason" TEXT,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL,
    FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE SET NULL
);

CREATE TABLE "orderitem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT,
    "wineName" TEXT NOT NULL,
    "winery" TEXT NOT NULL,
    "vintage" INTEGER,
    "bottleSize" DECIMAL(6,3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "isGift" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "giftWrap" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "winevariant"("id")
);

-- ============================================================
-- REVIEWS & RATINGS
-- ============================================================

CREATE TABLE "review" (
    "id" TEXT PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("wineId") REFERENCES "wine"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
    UNIQUE("wineId", "userId")
);

-- ============================================================
-- EVENTS & TICKETING
-- ============================================================

CREATE TABLE "event" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "venue" TEXT NOT NULL,
    "venueAddress" JSONB NOT NULL,
    "startDateTime" TIMESTAMP NOT NULL,
    "endDateTime" TIMESTAMP NOT NULL,
    "duration" INTEGER,
    "maxCapacity" INTEGER NOT NULL,
    "currentCapacity" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "memberPrice" DECIMAL(10,2),
    "featuredImage" TEXT,
    "galleryImages" JSONB NOT NULL,
    "featuredWines" JSONB,
    "minLoyaltyLevel" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "followUpOffer" JSONB,
    "followUpDuration" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "eventticket" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketNumber" TEXT UNIQUE NOT NULL,
    "qrCode" TEXT UNIQUE NOT NULL,
    "holderFirstName" TEXT,
    "holderLastName" TEXT,
    "holderEmail" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "checkedInAt" TIMESTAMP,
    "checkedInBy" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
    FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE SET NULL
);

-- ============================================================
-- CONTENT & SEO
-- ============================================================

CREATE TABLE "blogpost" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "category" TEXT,
    "tags" JSONB NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP,
    "authorId" TEXT,
    "authorName" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- KLARA INTEGRATION
-- ============================================================

CREATE TABLE "klarasync" (
    "id" TEXT PRIMARY KEY,
    "syncType" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorLog" JSONB,
    "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completedAt" TIMESTAMP
);

CREATE TABLE "klaraproductoverride" (
    "id" TEXT PRIMARY KEY,
    "klaraArticleId" TEXT UNIQUE NOT NULL,
    "customName" TEXT,
    "customDescription" TEXT,
    "customPrice" DECIMAL(10,2),
    "customImages" JSONB NOT NULL,
    "customData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDIA ASSET MANAGEMENT
-- ============================================================

CREATE TABLE "mediaasset" (
    "id" TEXT PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT UNIQUE NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "category" TEXT,
    "tags" JSONB NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "description" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX "idx_user_email" ON "user"("email");
CREATE INDEX "idx_user_loyaltyLevel" ON "user"("loyaltyLevel");
CREATE INDEX "idx_address_userId" ON "address"("userId");
CREATE INDEX "idx_loyaltytransaction_userId" ON "loyaltytransaction"("userId");
CREATE INDEX "idx_loyaltytransaction_createdAt" ON "loyaltytransaction"("createdAt");
CREATE INDEX "idx_badge_slug" ON "badge"("slug");
CREATE INDEX "idx_userbadge_userId" ON "userbadge"("userId");
CREATE INDEX "idx_wine_slug" ON "wine"("slug");
CREATE INDEX "idx_wine_wineType" ON "wine"("wineType");
CREATE INDEX "idx_wine_country_region" ON "wine"("country", "region");
CREATE INDEX "idx_wine_isFeatured" ON "wine"("isFeatured");
CREATE INDEX "idx_wine_isActive" ON "wine"("isActive");
CREATE INDEX "idx_winevariant_wineId" ON "winevariant"("wineId");
CREATE INDEX "idx_winevariant_sku" ON "winevariant"("sku");
CREATE INDEX "idx_winevariant_isAvailable" ON "winevariant"("isAvailable");
CREATE INDEX "idx_wineimage_wineId" ON "wineimage"("wineId");
CREATE INDEX "idx_cart_userId" ON "cart"("userId");
CREATE INDEX "idx_cart_sessionId" ON "cart"("sessionId");
CREATE INDEX "idx_cartitem_cartId" ON "cartitem"("cartId");
CREATE INDEX "idx_wishlistitem_userId" ON "wishlistitem"("userId");
CREATE INDEX "idx_coupon_code" ON "coupon"("code");
CREATE INDEX "idx_coupon_isActive" ON "coupon"("isActive");
CREATE INDEX "idx_order_userId" ON "order"("userId");
CREATE INDEX "idx_order_couponId" ON "order"("couponId");
CREATE INDEX "idx_order_orderNumber" ON "order"("orderNumber");
CREATE INDEX "idx_order_status" ON "order"("status");
CREATE INDEX "idx_order_paymentStatus" ON "order"("paymentStatus");
CREATE INDEX "idx_order_createdAt" ON "order"("createdAt");
CREATE INDEX "idx_orderitem_orderId" ON "orderitem"("orderId");
CREATE INDEX "idx_review_wineId" ON "review"("wineId");
CREATE INDEX "idx_review_userId" ON "review"("userId");
CREATE INDEX "idx_review_isApproved" ON "review"("isApproved");
CREATE INDEX "idx_event_slug" ON "event"("slug");
CREATE INDEX "idx_event_status" ON "event"("status");
CREATE INDEX "idx_event_startDateTime" ON "event"("startDateTime");
CREATE INDEX "idx_eventticket_eventId" ON "eventticket"("eventId");
CREATE INDEX "idx_eventticket_userId" ON "eventticket"("userId");
CREATE INDEX "idx_eventticket_orderId" ON "eventticket"("orderId");
CREATE INDEX "idx_eventticket_ticketNumber" ON "eventticket"("ticketNumber");
CREATE INDEX "idx_eventticket_qrCode" ON "eventticket"("qrCode");
CREATE INDEX "idx_blogpost_slug" ON "blogpost"("slug");
CREATE INDEX "idx_blogpost_status" ON "blogpost"("status");
CREATE INDEX "idx_blogpost_publishedAt" ON "blogpost"("publishedAt");
CREATE INDEX "idx_klarasync_syncType" ON "klarasync"("syncType");
CREATE INDEX "idx_klarasync_status" ON "klarasync"("status");
CREATE INDEX "idx_klarasync_startedAt" ON "klarasync"("startedAt");
CREATE INDEX "idx_klaraproductoverride_klaraArticleId" ON "klaraproductoverride"("klaraArticleId");
CREATE INDEX "idx_mediaasset_category" ON "mediaasset"("category");
CREATE INDEX "idx_mediaasset_mimeType" ON "mediaasset"("mimeType");

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT 'Database schema created successfully!' AS status;
