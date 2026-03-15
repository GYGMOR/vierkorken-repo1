-- Add profileImage column to user table
-- Run this on your production database server

USE vierkorken;

ALTER TABLE user ADD COLUMN profileImage VARCHAR(500) NULL AFTER phone;

-- Verify the column was added
DESCRIBE user;
