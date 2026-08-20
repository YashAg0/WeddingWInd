-- AlterEnum: Add full lifecycle states to SponsorshipRequestStatus
ALTER TYPE "SponsorshipRequestStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE "SponsorshipRequestStatus" ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE "SponsorshipRequestStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "SponsorshipRequestStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
ALTER TYPE "SponsorshipRequestStatus" ADD VALUE IF NOT EXISTS 'REVOKED';

-- AlterTable: Add pricing, duration, timeframes, payment verification, and lifecycle tracking to SponsorshipRequest
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "requestedDurationDays" INTEGER DEFAULT 7;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "durationDays" INTEGER DEFAULT 7;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentRequired" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentLink" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "activatedAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "revokedBy" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "revocationReason" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Enforce ON DELETE RESTRICT to protect financial/sponsorship history from accidental deletion
ALTER TABLE "SponsorshipRequest" DROP CONSTRAINT IF EXISTS "SponsorshipRequest_weddingId_fkey";
ALTER TABLE "SponsorshipRequest" ADD CONSTRAINT "SponsorshipRequest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create Indexes for fast discovery queries and state lookup
CREATE INDEX IF NOT EXISTS "SponsorshipRequest_weddingId_status_idx" ON "SponsorshipRequest"("weddingId", "status");
CREATE INDEX IF NOT EXISTS "SponsorshipRequest_startsAt_endsAt_idx" ON "SponsorshipRequest"("startsAt", "endsAt");
CREATE INDEX IF NOT EXISTS "SponsorshipRequest_coupleId_idx" ON "SponsorshipRequest"("coupleId");
CREATE INDEX IF NOT EXISTS "SponsorshipRequest_paymentStatus_idx" ON "SponsorshipRequest"("paymentStatus");
