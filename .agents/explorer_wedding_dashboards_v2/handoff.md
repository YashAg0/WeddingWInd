# Handoff Report: Wedding Lifecycle & Dashboards Audit (Requirement R5)

## 1. Observation
- **Root Cause of Document Type Error**:
  - `lib/storage/index.ts` lines 47-69 & 98-120: UploadThing middleware for `verificationDocument` and `passport` endpoints queries `prisma.verification.findUnique({ where: { userId: session.userId } })`. If no `Verification` record exists or `status === "APPROVED"` / `"UNDER_REVIEW"`, it throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` or `UNAUTHORIZED_VERIFICATION_LOCKED`.
  - `lib/validation/index.ts` lines 201-230: `verificationSchema` validates document URLs with `z.string().url().nullable().optional()`. Submitting empty strings `""` for optional URL fields (e.g. `panUrl: ""`) fails URL format validation.
  - `lib/actions/index.ts` lines 265-275: `createWedding` / `editWedding` enforces the KYC gate (`SEC-001`), silently downgrading status from `PUBLISHED` to `DRAFT` if the host's `Verification.status !== "APPROVED"`.
- **Wedding Creation Flows**:
  - `/list-wedding` page -> `POST /api/host-application` -> creates `CoupleProfile`, `Wedding` (`status: "DRAFT"`), and `Verification` (`status: "PENDING"`).
  - `/dashboard/listings` page -> `createWedding` / `editWedding` Server Action in `lib/actions/index.ts`.
  - `/dashboard/admin/weddings` page -> `adminCreateWeddingAction` / `adminUpdateWeddingAction` in `lib/actions/admin.ts`.
- **Lifecycle State Transitions & Rejection Workflow**:
  - State transitions: `DRAFT` -> `SUBMITTED/PENDING` -> `Admin Review` -> `APPROVED/REJECTED` -> `PUBLISHED` (public via `getWeddings()`).
  - Rejection workflow: Admin calls `adminReviewVerificationAction` -> updates `Verification.notes` & `status` (`REJECTED` / `NEED_MORE_DOCUMENTS`) -> sends DB `Notification` & `sendVerificationRejectedEmail` -> Host views exact rejection reason banner on `/dashboard/verification` -> Host re-uploads documents -> `submitVerificationAction` resets status to `PENDING`.
  - `WeddingStatus` enum in Prisma contains `DRAFT`, `PUBLISHED`, `COMPLETED`. Rejection status is stored on the linked `Verification` model.
- **Dashboards & Admin Portal Audit**:
  - Host, Traveler, Agent, Coordinator, and Admin dashboards (`app/dashboard/*`, `app/dashboard/admin/*`) use real database queries via Server Actions (`admin.ts`, `index.ts`, `admin-dashboards.ts`, `discovery.ts`, `messages.ts`, `referrals.ts`).
  - Routing bug identified: `/dashboard/listings` line 377 links edit button to `/dashboard/celebrations?action=edit&id=${w.id}`, but `/dashboard/celebrations/page.tsx` redirects server-side to `/dashboard/listings`, stripping query parameters.

## 2. Logic Chain
1. **Observation**: Unrequested KYC uploads fail in UploadThing with `UNAUTHORIZED_NO_VERIFICATION_REQUEST`. Empty string URL fields fail Zod URL parsing. Unverified host listing publish requests default to `DRAFT`.
   - **Reasoning**: UploadThing middleware blocks document upload presigned URLs unless an Admin has explicitly initialized/requested verification for that user ID (`Verification` row in `PENDING` or `NEED_MORE_DOCUMENTS` status).
2. **Observation**: `adminReviewVerificationAction` saves rejection rationale into `Verification.notes`, sends alert notification and email, and updates `Verification.status` to `REJECTED` or `NEED_MORE_DOCUMENTS`.
   - **Reasoning**: `VerificationForm.tsx` reads `initialVerification.notes` directly to display a rejection banner to the host and enables re-upload buttons for resubmission.
3. **Observation**: All 19 Admin portal sub-routes (`users`, `weddings`, `verifications`, `bookings`, `finance`, `payments`, `reviews`, `safety`, `messages`, `agents`, `events`, `operations`, `cms`, `growth`, `analytics`, `founder`, `settings`, `support`) fetch real PostgreSQL database state via Prisma queries.
   - **Reasoning**: No mock data stores or synthetic fallbacks are used in production admin portal paths; all mutations call server-authorized actions in `lib/actions/admin.ts` and `lib/actions/admin-dashboards.ts`.

## 3. Caveats
- Read-only investigation: No source code modifications were performed during this audit turn.
- Runtime browser manual test execution was not executed in this subagent turn; verification was conducted via strict code tracing, AST/file analysis, and schema inspection.

## 4. Conclusion
Requirement R5 (Wedding Lifecycle & Dashboards) is structurally well-architected with real database integration, server-authoritative RBAC, and secure verification gating.
Three minor non-blocking fixes are recommended for implementers:
1. Fix host listing edit link in `app/dashboard/listings/page.tsx` line 377 to point to `/dashboard/listings?action=edit&id=...` instead of `/dashboard/celebrations`.
2. Convert empty strings `""` for optional URL fields in `VerificationForm.tsx` to `null`/`undefined` before submitting.
3. Dynamicize the 2 static overview cards in Agent View (`/app/dashboard/page.tsx`).

## 5. Verification Method
- **Code Inspection**:
  - Inspect `lib/storage/index.ts` lines 47-69 & 98-120 to verify UploadThing middleware gating.
  - Inspect `lib/actions/admin.ts` lines 415-529 for `adminReviewVerificationAction` rejection persistence.
  - Inspect `app/dashboard/listings/page.tsx` line 377 for edit route link.
- **Type-Check & Build**:
  - `npm run type-check`
  - `npm run build`
