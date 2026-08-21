-- CreateEnum
CREATE TYPE "HostApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "HostApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coupleProfileId" TEXT,
    "weddingId" TEXT,
    "status" "HostApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "hostName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "brideName" TEXT,
    "groomName" TEXT,
    "coupleNames" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "venueName" TEXT,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 3,
    "tradition" TEXT NOT NULL DEFAULT 'Traditional / Cultural',
    "weddingScale" TEXT NOT NULL DEFAULT 'MEDIUM',
    "expectedTotalGuests" INTEGER NOT NULL DEFAULT 200,
    "expectedInternationalGuests" INTEGER NOT NULL DEFAULT 20,
    "requestedTier" TEXT NOT NULL DEFAULT 'SIGNATURE_ROYAL',
    "verifiedTier" TEXT,
    "verifiedDurationDays" INTEGER,
    "story" TEXT,
    "adminNotesInternal" TEXT,
    "adminNotesHostFacing" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostApplicationDay" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "expectedInternationalGuests" INTEGER NOT NULL DEFAULT 20,
    "guestExperience" TEXT,
    "foodExperience" TEXT,
    "dressCode" TEXT,
    "specialActivities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostApplicationDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostApplicationEvent" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '17:00',
    "endTime" TEXT NOT NULL DEFAULT '22:00',
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostDocumentRequest" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostDocumentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostDocument" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminFeedback" TEXT,

    CONSTRAINT "HostDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostApplicationAuditLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostApplicationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HostApplication_userId_idx" ON "HostApplication"("userId");
CREATE INDEX "HostApplication_coupleProfileId_idx" ON "HostApplication"("coupleProfileId");
CREATE INDEX "HostApplication_weddingId_idx" ON "HostApplication"("weddingId");
CREATE INDEX "HostApplication_status_idx" ON "HostApplication"("status");
CREATE INDEX "HostApplication_weddingDate_idx" ON "HostApplication"("weddingDate");
CREATE INDEX "HostApplication_createdAt_idx" ON "HostApplication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HostApplicationDay_applicationId_dayNumber_key" ON "HostApplicationDay"("applicationId", "dayNumber");
CREATE INDEX "HostApplicationDay_applicationId_idx" ON "HostApplicationDay"("applicationId");

-- CreateIndex
CREATE INDEX "HostApplicationEvent_dayId_idx" ON "HostApplicationEvent"("dayId");

-- CreateIndex
CREATE INDEX "HostDocumentRequest_applicationId_idx" ON "HostDocumentRequest"("applicationId");
CREATE INDEX "HostDocumentRequest_userId_idx" ON "HostDocumentRequest"("userId");
CREATE INDEX "HostDocumentRequest_status_idx" ON "HostDocumentRequest"("status");

-- CreateIndex
CREATE INDEX "HostDocument_requestId_idx" ON "HostDocument"("requestId");
CREATE INDEX "HostDocument_applicationId_idx" ON "HostDocument"("applicationId");
CREATE INDEX "HostDocument_userId_idx" ON "HostDocument"("userId");

-- CreateIndex
CREATE INDEX "HostApplicationAuditLog_applicationId_createdAt_idx" ON "HostApplicationAuditLog"("applicationId", "createdAt");
CREATE INDEX "HostApplicationAuditLog_actorId_idx" ON "HostApplicationAuditLog"("actorId");

-- AddForeignKey
ALTER TABLE "HostApplication" ADD CONSTRAINT "HostApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HostApplication" ADD CONSTRAINT "HostApplication_coupleProfileId_fkey" FOREIGN KEY ("coupleProfileId") REFERENCES "CoupleProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HostApplication" ADD CONSTRAINT "HostApplication_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostApplicationDay" ADD CONSTRAINT "HostApplicationDay_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "HostApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostApplicationEvent" ADD CONSTRAINT "HostApplicationEvent_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "HostApplicationDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostDocumentRequest" ADD CONSTRAINT "HostDocumentRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "HostApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HostDocumentRequest" ADD CONSTRAINT "HostDocumentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostDocument" ADD CONSTRAINT "HostDocument_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "HostDocumentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HostDocument" ADD CONSTRAINT "HostDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "HostApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HostDocument" ADD CONSTRAINT "HostDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostApplicationAuditLog" ADD CONSTRAINT "HostApplicationAuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "HostApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
