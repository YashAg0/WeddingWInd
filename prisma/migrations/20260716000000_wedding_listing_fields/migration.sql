-- AlterTable
ALTER TABLE "Wedding" ADD COLUMN "requiredGuests" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Wedding" ADD COLUMN "theme" TEXT;
ALTER TABLE "Wedding" ADD COLUMN "dressCode" TEXT;
ALTER TABLE "Wedding" ADD COLUMN "ethnicity" TEXT;
