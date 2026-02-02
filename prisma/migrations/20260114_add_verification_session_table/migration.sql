-- CreateTable
CREATE TABLE IF NOT EXISTS `verification_session` (
    `id` VARCHAR(191) NOT NULL,
    `stateToken` VARCHAR(191) NOT NULL,
    `verificationSessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `verification_session_stateToken_key`(`stateToken`),
    INDEX `verification_session_stateToken_idx`(`stateToken`),
    INDEX `verification_session_verificationSessionId_idx`(`verificationSessionId`),
    INDEX `verification_session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
