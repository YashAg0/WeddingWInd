-- CreateEnum
CREATE TYPE "WeddingSide" AS ENUM ('BRIDE_SIDE', 'GROOM_SIDE', 'OPEN');

-- CreateEnum
CREATE TYPE "SponsorshipRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable: Add attendanceSide to Booking
ALTER TABLE "Booking" ADD COLUMN "attendanceSide" "WeddingSide" NOT NULL DEFAULT 'OPEN';

-- CreateIndex for attendanceSide
CREATE INDEX "Booking_attendanceSide_idx" ON "Booking"("attendanceSide");

-- CreateTable: SponsorshipRequest
CREATE TABLE "SponsorshipRequest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "status" "SponsorshipRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "budget" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "adminNotes" TEXT,

    CONSTRAINT "SponsorshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for SponsorshipRequest
CREATE UNIQUE INDEX "SponsorshipRequest_weddingId_status_key" ON "SponsorshipRequest"("weddingId", "status");
CREATE INDEX "SponsorshipRequest_weddingId_idx" ON "SponsorshipRequest"("weddingId");
CREATE INDEX "SponsorshipRequest_status_idx" ON "SponsorshipRequest"("status");
CREATE INDEX "SponsorshipRequest_requestedAt_idx" ON "SponsorshipRequest"("requestedAt");

-- AddForeignKey
ALTER TABLE "SponsorshipRequest" ADD CONSTRAINT "SponsorshipRequest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
