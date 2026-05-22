-- Migration: Add GiftActivation table for QR-based gift redemption
-- Run this on the production database before deploying

CREATE TABLE IF NOT EXISTS `giftactivation` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `giftId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `pointCost` INT NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `redeemedAt` DATETIME(3) NULL,
  `redeemedBy` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `giftactivation_token_key` (`token`),
  INDEX `giftactivation_userId_idx` (`userId`),
  INDEX `giftactivation_token_idx` (`token`),
  CONSTRAINT `giftactivation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `giftactivation_giftId_fkey` FOREIGN KEY (`giftId`) REFERENCES `levelgift`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
