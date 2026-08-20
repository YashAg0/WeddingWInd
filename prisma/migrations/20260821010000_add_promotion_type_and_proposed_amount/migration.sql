-- AlterTable: Add promotionType and proposedAmount to SponsorshipRequest
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "promotionType" TEXT DEFAULT 'SPONSORED';
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "proposedAmount" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SponsorshipRequest_promotionType_idx" ON "SponsorshipRequest"("promotionType");
