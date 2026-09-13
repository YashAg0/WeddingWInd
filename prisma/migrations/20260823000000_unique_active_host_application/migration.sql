-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HostApplication_active_userId_key"
ON "HostApplication"("userId")
WHERE status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'VERIFIED', 'APPROVED_FOR_LISTING');
