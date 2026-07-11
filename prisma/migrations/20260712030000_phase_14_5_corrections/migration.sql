-- DropIndex
DROP INDEX IF EXISTS "Review_bookingId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_type_key" ON "Review"("bookingId", "type");

-- CreateTable
CREATE TABLE "ReviewAppeal" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewAppeal_reviewId_idx" ON "ReviewAppeal"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewAppeal_submittedById_idx" ON "ReviewAppeal"("submittedById");

-- CreateIndex
CREATE INDEX "ReviewAppeal_reviewedById_idx" ON "ReviewAppeal"("reviewedById");

-- AddForeignKey
ALTER TABLE "ReviewAppeal" ADD CONSTRAINT "ReviewAppeal_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAppeal" ADD CONSTRAINT "ReviewAppeal_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAppeal" ADD CONSTRAINT "ReviewAppeal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
