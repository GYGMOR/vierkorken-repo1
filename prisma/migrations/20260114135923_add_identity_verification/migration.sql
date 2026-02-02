-- AlterTable
ALTER TABLE `user` ADD COLUMN `identityVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `identityVerificationId` VARCHAR(191) NULL,
    ADD COLUMN `identityVerifiedAt` DATETIME(3) NULL;
