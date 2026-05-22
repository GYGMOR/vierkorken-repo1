-- Migration: Loyalty system — run ONCE on production before deploying
-- Covers: pointCost on levelgift, giftactivation table, redeemCode column, memberdeal table

-- Step 1: Add pointCost column to existing levelgift table
ALTER TABLE `levelgift`
  ADD COLUMN IF NOT EXISTS `pointCost` INT NOT NULL DEFAULT 0;

-- Step 2: Create GiftActivation table (QR-based gift redemption)
CREATE TABLE IF NOT EXISTS `giftactivation` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `giftId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `redeemCode` VARCHAR(191) NOT NULL,
  `pointCost` INT NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `redeemedAt` DATETIME(3) NULL,
  `redeemedBy` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `giftactivation_token_key` (`token`),
  UNIQUE INDEX `giftactivation_redeemCode_key` (`redeemCode`),
  INDEX `giftactivation_userId_idx` (`userId`),
  INDEX `giftactivation_token_idx` (`token`),
  CONSTRAINT `giftactivation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `giftactivation_giftId_fkey` FOREIGN KEY (`giftId`) REFERENCES `levelgift`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2b: Add redeemCode if table already exists from a previous migration
ALTER TABLE `giftactivation`
  ADD COLUMN IF NOT EXISTS `redeemCode` VARCHAR(191) NOT NULL DEFAULT '';

-- Make redeemCode unique (ignore error if index already exists)
CREATE UNIQUE INDEX IF NOT EXISTS `giftactivation_redeemCode_key` ON `giftactivation` (`redeemCode`);

-- Step 3: Create MemberDeal table (exclusive deals for logged-in members)
CREATE TABLE IF NOT EXISTS `memberdeal` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(191) NULL,
  `originalPrice` DECIMAL(10,2) NOT NULL,
  `dealPrice` DECIMAL(10,2) NOT NULL,
  `dealLabel` VARCHAR(191) NOT NULL DEFAULT 'Mitglieder-Angebot',
  `variantId` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `validUntil` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
