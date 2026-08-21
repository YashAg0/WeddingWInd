-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('TRAVELER_TO_WEDDING', 'HOST_TO_TRAVELER', 'TRAVELER_TO_AGENT', 'SYSTEM_FEEDBACK');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'UNDER_REVIEW', 'HIDDEN', 'REMOVED', 'APPEALED');

-- CreateEnum
CREATE TYPE "ReviewReportReason" AS ENUM ('SPAM', 'FAKE_REVIEW', 'HARASSMENT', 'HATEFUL_CONTENT', 'PERSONAL_INFORMATION', 'RETALIATION', 'CONFLICT_OF_INTEREST', 'INCORRECT_EXPERIENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReputationEntityType" AS ENUM ('USER', 'WEDDING', 'AGENT', 'HOST', 'TRAVELER');

-- CreateEnum
CREATE TYPE "ReputationEventType" AS ENUM ('BOOKING_COMPLETED', 'HOST_CANCELLED', 'TRAVELER_CANCELLED', 'NO_SHOW', 'SUCCESSFUL_CHECK_IN', 'VERIFIED_REVIEW', 'REVIEW_REMOVED', 'SAFETY_CASE_OPENED', 'SAFETY_CASE_UPHELD', 'SAFETY_CASE_DISMISSED', 'REFUND_ISSUED', 'PAYOUT_COMPLETED', 'REFERRAL_CONVERTED', 'REFERRAL_FRAUD_CONFIRMED', 'VERIFICATION_APPROVED', 'MANUAL_ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "FraudSignalType" AS ENUM ('DUPLICATE_CONTENT', 'RAPID_REVIEW_BURST', 'ACCOUNT_LINK_SIGNAL', 'RETALIATION_PATTERN', 'RATING_OUTLIER', 'REPEATED_TEXT_PATTERN', 'UNVERIFIED_EXPERIENCE', 'SELF_REVIEW', 'CONFLICT_OF_INTEREST');

-- AlterEnum
ALTER TYPE "RestrictionType" ADD VALUE 'REVIEW_RESTRICTED';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "editCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "ratingCommunication" INTEGER,
ADD COLUMN     "ratingOrganization" INTEGER,
ADD COLUMN     "ratingValue" INTEGER,
ADD COLUMN     "type" "ReviewType" NOT NULL DEFAULT 'TRAVELER_TO_WEDDING',
ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE "ReviewHelpfulVote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewHelpfulVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReport" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "ReviewReportReason" NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewModerationAction" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewFraudSignal" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "type" "FraudSignalType" NOT NULL,
    "severity" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "ReviewFraudSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReputationProfile" (
    "id" TEXT NOT NULL,
    "entityType" "ReputationEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL DEFAULT 80,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "dimensionScores" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReputationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "entityType" "ReputationEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "type" "ReputationEventType" NOT NULL,
    "scoreEffect" DOUBLE PRECISION NOT NULL,
    "referenceId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustScoreSnapshot" (
    "id" TEXT NOT NULL,
    "entityType" "ReputationEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "dimensionScores" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "calculationVersion" TEXT NOT NULL DEFAULT 'v1',
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityBadge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entityType" "ReputationEntityType" NOT NULL,
    "icon" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "criteria" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QualityBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQualityBadge" (
    "id" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "UserQualityBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingQualityBadge" (
    "id" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "WeddingQualityBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewHelpfulVote_reviewId_userId_key" ON "ReviewHelpfulVote"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "ReviewHelpfulVote_reviewId_idx" ON "ReviewHelpfulVote"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewHelpfulVote_userId_idx" ON "ReviewHelpfulVote"("userId");

-- CreateIndex
CREATE INDEX "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReply_userId_idx" ON "ReviewReply"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReport_reviewId_reporterId_key" ON "ReviewReport"("reviewId", "reporterId");

-- CreateIndex
CREATE INDEX "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewReport_reporterId_idx" ON "ReviewReport"("reporterId");

-- CreateIndex
CREATE INDEX "ReviewModerationAction_reviewId_idx" ON "ReviewModerationAction"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewModerationAction_moderatorId_idx" ON "ReviewModerationAction"("moderatorId");

-- CreateIndex
CREATE INDEX "ReviewFraudSignal_reviewId_idx" ON "ReviewFraudSignal"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewFraudSignal_resolvedById_idx" ON "ReviewFraudSignal"("resolvedById");

-- CreateIndex
CREATE UNIQUE INDEX "ReputationProfile_entityType_entityId_key" ON "ReputationProfile"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ReputationProfile_entityType_entityId_idx" ON "ReputationProfile"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ReputationEvent_idempotencyKey_key" ON "ReputationEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ReputationEvent_entityType_entityId_idx" ON "ReputationEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "TrustScoreSnapshot_entityType_entityId_idx" ON "TrustScoreSnapshot"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "QualityBadge_key_key" ON "QualityBadge"("key");

-- CreateIndex
CREATE INDEX "UserQualityBadge_userId_idx" ON "UserQualityBadge"("userId");

-- CreateIndex
CREATE INDEX "UserQualityBadge_badgeId_idx" ON "UserQualityBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQualityBadge_userId_badgeId_key" ON "UserQualityBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "WeddingQualityBadge_weddingId_idx" ON "WeddingQualityBadge"("weddingId");

-- CreateIndex
CREATE INDEX "WeddingQualityBadge_badgeId_idx" ON "WeddingQualityBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingQualityBadge_weddingId_badgeId_key" ON "WeddingQualityBadge"("weddingId", "badgeId");

-- AddForeignKey
ALTER TABLE "ReviewHelpfulVote" ADD CONSTRAINT "ReviewHelpfulVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHelpfulVote" ADD CONSTRAINT "ReviewHelpfulVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewModerationAction" ADD CONSTRAINT "ReviewModerationAction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewModerationAction" ADD CONSTRAINT "ReviewModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFraudSignal" ADD CONSTRAINT "ReviewFraudSignal_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFraudSignal" ADD CONSTRAINT "ReviewFraudSignal_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQualityBadge" ADD CONSTRAINT "UserQualityBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "QualityBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQualityBadge" ADD CONSTRAINT "UserQualityBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingQualityBadge" ADD CONSTRAINT "WeddingQualityBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "QualityBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingQualityBadge" ADD CONSTRAINT "WeddingQualityBadge_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
