-- AlterTable
ALTER TABLE "ReviewReply" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- DropIndex
DROP INDEX IF EXISTS "Review_bookingId_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_type_key" ON "Review"("bookingId", "type") WHERE "deletedAt" IS NULL;
