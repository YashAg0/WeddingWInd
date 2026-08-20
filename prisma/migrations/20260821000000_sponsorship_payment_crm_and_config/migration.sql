-- AlterTable: Add CRM, contact tracking, external payment methods, checklist, and proof fields to SponsorshipRequest
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'HOST_REQUEST';
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "contactMethod" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "contactDate" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "contactNotes" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "agreementNotes" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'UPI';
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentProofUploadedAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentSubmittedAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentVerifiedAt" TIMESTAMP(3);
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentVerifiedBy" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "paymentNotes" TEXT;
ALTER TABLE "SponsorshipRequest" ADD COLUMN IF NOT EXISTS "checklist" JSONB;

-- CreateTable: SponsorshipPaymentConfig for persistent admin payment instructions
CREATE TABLE IF NOT EXISTS "SponsorshipPaymentConfig" (
    "id" TEXT NOT NULL,
    "upiId" TEXT DEFAULT 'namaste@okhdfcbank',
    "upiName" TEXT DEFAULT 'WeddingWithIndia',
    "upiQrImageUrl" TEXT,
    "upiPaymentLink" TEXT,
    "upiInstructions" TEXT DEFAULT 'Scan the QR code or pay to the UPI ID. Enter the 12-digit UTR/Reference number below.',
    "paypalPaymentLink" TEXT DEFAULT 'https://paypal.me/weddingwithindia',
    "paypalDisplayName" TEXT DEFAULT 'WeddingWithIndia',
    "paypalInstructions" TEXT DEFAULT 'Click the secure PayPal link to complete payment, then submit your transaction ID.',
    "bankTransferInstructions" TEXT DEFAULT 'Transfer to: WeddingWithIndia Experiences Pvt Ltd, HDFC Bank, A/C: 50200012345678, IFSC: HDFC0000123',
    "otherPaymentInstructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "SponsorshipPaymentConfig_pkey" PRIMARY KEY ("id")
);

-- Seed default payment configuration row
INSERT INTO "SponsorshipPaymentConfig" ("id", "upiId", "upiName", "upiInstructions", "paypalPaymentLink", "paypalDisplayName", "paypalInstructions", "bankTransferInstructions", "updatedAt")
VALUES (
    'default',
    'namaste@okhdfcbank',
    'WeddingWithIndia',
    'Scan the QR code or pay to the UPI ID. Enter the 12-digit UTR/Reference number below.',
    'https://paypal.me/weddingwithindia',
    'WeddingWithIndia',
    'Click the secure PayPal link to complete payment, then submit your transaction ID.',
    'Transfer to: WeddingWithIndia Experiences Pvt Ltd, HDFC Bank, A/C: 50200012345678, IFSC: HDFC0000123',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Index on source for CRM filtering
CREATE INDEX IF NOT EXISTS "SponsorshipRequest_source_idx" ON "SponsorshipRequest"("source");
