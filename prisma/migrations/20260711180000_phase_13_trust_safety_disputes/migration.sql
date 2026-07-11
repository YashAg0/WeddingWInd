-- CreateEnum
CREATE TYPE "CancellationActor" AS ENUM ('TRAVELER', 'HOST', 'ADMIN', 'SAFETY');

-- CreateEnum
CREATE TYPE "CancellationStatus" AS ENUM ('REQUESTED', 'AUTO_APPROVED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CancellationReasonCode" AS ENUM ('CHANGE_OF_PLANS', 'TRAVEL_ISSUE', 'VISA_ISSUE', 'MEDICAL_EMERGENCY', 'HOST_CANCELLED', 'EVENT_CANCELLED', 'SAFETY_CONCERN', 'MISREPRESENTATION', 'PAYMENT_ISSUE', 'FORCE_MAJEURE', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('SAFETY', 'HARASSMENT', 'MISREPRESENTATION', 'PAYMENT', 'REFUND', 'HOST_CONDUCT', 'TRAVELER_CONDUCT', 'AGENT_CONDUCT', 'DISCRIMINATION', 'PRIVACY', 'EVENT_ISSUE', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'TRIAGED', 'UNDER_INVESTIGATION', 'AWAITING_USER', 'AWAITING_ADMIN', 'ESCALATED', 'RESOLVED', 'CLOSED', 'APPEALED');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'UPHELD', 'OVERTURNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('LOGIN_RESTRICTED', 'BOOKING_RESTRICTED', 'HOSTING_RESTRICTED', 'MESSAGING_RESTRICTED', 'PAYOUT_RESTRICTED', 'AGENT_REFERRAL_RESTRICTED');

-- AlterTable
ALTER TABLE "Wedding" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "cancellationRequestId" TEXT;

-- CreateTable
CREATE TABLE "CancellationRequest" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "actorRole" "CancellationActor" NOT NULL,
    "reasonCode" "CancellationReasonCode" NOT NULL,
    "reasonText" TEXT,
    "status" "CancellationStatus" NOT NULL DEFAULT 'REQUESTED',
    "policySnapshot" TEXT,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "eligibleRefundAmount" DOUBLE PRECISION NOT NULL,
    "approvedRefundAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "type" "CaseType" NOT NULL,
    "severity" "CaseSeverity" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "bookingId" TEXT,
    "weddingId" TEXT,
    "reportedById" TEXT NOT NULL,
    "subjectUserId" TEXT,
    "assignedAdminId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolutionCode" TEXT,
    "resolutionNotes" TEXT,
    "financialHold" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseParticipant" (
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseParticipant_pkey" PRIMARY KEY ("caseId","userId")
);

-- CreateTable
CREATE TABLE "CaseEvidence" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseTimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "safeSummary" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAppeal" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "CaseAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRestriction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RestrictionType" NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "notes" TEXT,
    "caseId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CancellationRequest_bookingId_idx" ON "CancellationRequest"("bookingId");

-- CreateIndex
CREATE INDEX "CancellationRequest_requestedById_idx" ON "CancellationRequest"("requestedById");

-- CreateIndex
CREATE INDEX "CancellationRequest_reviewedById_idx" ON "CancellationRequest"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyCase_caseNumber_key" ON "SafetyCase"("caseNumber");

-- CreateIndex
CREATE INDEX "SafetyCase_bookingId_idx" ON "SafetyCase"("bookingId");

-- CreateIndex
CREATE INDEX "SafetyCase_weddingId_idx" ON "SafetyCase"("weddingId");

-- CreateIndex
CREATE INDEX "SafetyCase_reportedById_idx" ON "SafetyCase"("reportedById");

-- CreateIndex
CREATE INDEX "SafetyCase_subjectUserId_idx" ON "SafetyCase"("subjectUserId");

-- CreateIndex
CREATE INDEX "SafetyCase_assignedAdminId_idx" ON "SafetyCase"("assignedAdminId");

-- CreateIndex
CREATE INDEX "SafetyCase_status_idx" ON "SafetyCase"("status");

-- CreateIndex
CREATE INDEX "SafetyCase_severity_idx" ON "SafetyCase"("severity");

-- CreateIndex
CREATE INDEX "SafetyCase_type_idx" ON "SafetyCase"("type");

-- CreateIndex
CREATE INDEX "CaseParticipant_userId_idx" ON "CaseParticipant"("userId");

-- CreateIndex
CREATE INDEX "CaseEvidence_caseId_idx" ON "CaseEvidence"("caseId");

-- CreateIndex
CREATE INDEX "CaseEvidence_uploadedById_idx" ON "CaseEvidence"("uploadedById");

-- CreateIndex
CREATE INDEX "CaseTimelineEvent_caseId_idx" ON "CaseTimelineEvent"("caseId");

-- CreateIndex
CREATE INDEX "CaseTimelineEvent_actorId_idx" ON "CaseTimelineEvent"("actorId");

-- CreateIndex
CREATE INDEX "CaseTimelineEvent_caseId_createdAt_idx" ON "CaseTimelineEvent"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseAppeal_caseId_idx" ON "CaseAppeal"("caseId");

-- CreateIndex
CREATE INDEX "CaseAppeal_submittedById_idx" ON "CaseAppeal"("submittedById");

-- CreateIndex
CREATE INDEX "CaseAppeal_reviewedById_idx" ON "CaseAppeal"("reviewedById");

-- CreateIndex
CREATE INDEX "UserRestriction_userId_idx" ON "UserRestriction"("userId");

-- CreateIndex
CREATE INDEX "UserRestriction_type_idx" ON "UserRestriction"("type");

-- CreateIndex
CREATE INDEX "Refund_cancellationRequestId_idx" ON "Refund"("cancellationRequestId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_cancellationRequestId_fkey" FOREIGN KEY ("cancellationRequestId") REFERENCES "CancellationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyCase" ADD CONSTRAINT "SafetyCase_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyCase" ADD CONSTRAINT "SafetyCase_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyCase" ADD CONSTRAINT "SafetyCase_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyCase" ADD CONSTRAINT "SafetyCase_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyCase" ADD CONSTRAINT "SafetyCase_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseParticipant" ADD CONSTRAINT "CaseParticipant_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "SafetyCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseParticipant" ADD CONSTRAINT "CaseParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEvidence" ADD CONSTRAINT "CaseEvidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "SafetyCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEvidence" ADD CONSTRAINT "CaseEvidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineEvent" ADD CONSTRAINT "CaseTimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "SafetyCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineEvent" ADD CONSTRAINT "CaseTimelineEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAppeal" ADD CONSTRAINT "CaseAppeal_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "SafetyCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAppeal" ADD CONSTRAINT "CaseAppeal_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAppeal" ADD CONSTRAINT "CaseAppeal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRestriction" ADD CONSTRAINT "UserRestriction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRestriction" ADD CONSTRAINT "UserRestriction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRestriction" ADD CONSTRAINT "UserRestriction_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

