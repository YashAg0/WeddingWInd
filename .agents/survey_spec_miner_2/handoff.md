# Specification Mining Report: Verification Lifecycle, Storage Security, PII Protection & Contact Moderation (Requirements R2 & R5)

## 1. Observation
- **DB Schema (`prisma/schema.prisma`)**: Verified full data models for `User` (lines 111-166), `TravelerProfile` (lines 168-191), `CoupleProfile` (lines 193-216), `AgentProfile` (lines 218-243), `Wedding` (lines 245-290), `Booking` (lines 335-370), `Verification` (lines 628-690), `Message` (lines 849-866), `Conversation` (lines 822-834), `CaseEvidence` (lines 1282-1296), `EmergencyContact` (lines 1046-1057), and `TravelDetail` (lines 1060-1074).
- **UploadThing Core (`app/api/uploadthing/route.ts` & `lib/storage/index.ts`)**: Route handler maps `ourFileRouter`. In `lib/storage/index.ts`, `.middleware()` guards enforce session check (`getSession()`) for all endpoints. Endpoints `verificationDocument` (lines 47-69) and `passport` (lines 98-120) execute DB checks verifying that a `Verification` record exists for `session.userId`. If no record exists, it throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST`. If status is `APPROVED` or `UNDER_REVIEW`, it throws `UNAUTHORIZED_VERIFICATION_LOCKED`.
- **Verification Server Actions (`lib/actions/admin.ts` & `lib/actions/index.ts`)**:
  - `adminRequestVerificationAction` (`lib/actions/admin.ts:340-410`): Only `ADMIN` role can execute. Creates or updates `Verification` record setting `status = PENDING` or `NEED_MORE_DOCUMENTS` and logs audit entry.
  - `submitVerificationAction` (`lib/actions/index.ts:891-942`): Explicitly checks `!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED`. Throws `VERIFICATION_NOT_REQUESTED` if unrequested. Uses `.update` (never `.upsert`).
  - `reviewVerificationAction` (`lib/actions/index.ts:944-1010`): Gated to `ADMIN`. On approval, updates `Verification.status = APPROVED`, `User.status = ACTIVE`, sets `expiryDate` (+365 days), and emits audit logs & emails.
- **Evidence Access Security (`app/api/safety/evidence/[evidenceId]/route.ts`)**: Enforces RBAC on evidence retrieval. Access is restricted to `ADMIN`, evidence uploader, case reporter, case subject, or case participants. Returns 403 Forbidden for unauthorized requests.
- **Contact Moderation Service (`lib/services/contact-moderation.ts`)**:
  - Function `detectProhibitedContactInfo(text: string)` applies `normalizeForModeration(text)` before matching patterns.
  - Normalizer strips zero-width and invisible Unicode characters (`\u200B-\u200D\uFEFF`, etc.), executes `NFKD` normalization, strips combining diacritic marks, and collapses whitespace variants.
  - Pattern matching detects emails (standard and `[at]`/`(dot)` obfuscated), phone numbers (standard and spelled-out words), WhatsApp/Telegram/Instagram/social keywords and CTA phrases.
  - `sendMessage` and `editMessage` in `lib/actions/messages.ts` (lines 227 & 340) invoke `detectProhibitedContactInfo` and throw errors when prohibited contact is detected, logging `CONTACT_INFO_BLOCKED` audits.

## 2. Logic Chain
1. **Verification Gating Logic**: A user cannot upload verification documents or submit verification unless an Admin has initiated a verification request (`adminRequestVerificationAction`). Unrequested uploads are blocked at:
   - UI (`VerificationForm.tsx` status checks & component render)
   - Server Action (`submitVerificationAction` throws `VERIFICATION_NOT_REQUESTED`)
   - UploadThing endpoint (`verificationDocument` & `passport` middleware query DB and throw `UNAUTHORIZED_NO_VERIFICATION_REQUEST`)
   - DB Schema & Query level (`submitVerificationAction` calls `prisma.verification.update`, requiring a pre-existing row).
2. **PII Data Minimization Logic**: Sensitive credentials (PAN, Aadhaar, Passport, Bank Account/IFSC, Medical Declarations) are restricted to the `Verification`, `EmergencyContact`, and `TravelDetail` models. Public endpoints return sanitized DTOs without PII. Admin portals and evidence routes enforce strict server-side authorization.
3. **Contact Moderation Obfuscation Defense**: Attackers attempt to bypass contact filters using zero-width spaces, Cyrillic/Greek homoglyphs, diacritics, or spelled-out words (`[at]`, `zero nine...`). The normalizer converts input to clean ASCII prior to regex evaluation, ensuring all evasion techniques are neutralized before message insertion into the DB.

## 3. Caveats
- No caveats. Code inspection across all DB schemas, API routes, UploadThing middleware, Server Actions, and moderation services was completed cleanly without ambiguity.

## 4. Conclusion
The implementation of Requirement R2 (Verification Lifecycle & Storage Security) and Requirement R5 (Privacy & Contact Moderation) is fully architected and enforced across all 4 defense tiers (UI, Server Action, UploadThing Endpoint, and DB Schema). Contact moderation features multi-stage Unicode normalization and regex detection covering emails, phones, social handles, and spelled-out numbers.

## 5. Verification Method
- **Unit & Integration Tests**: Run `npm test -- --no-coverage` to execute test suites including `__tests__/lib/contact-moderation.test.ts` and `__tests__/lib/security-regression.test.ts`.
- **Type Checking**: Run `npm run type-check`.
- **Code Inspection Paths**:
  - `lib/storage/index.ts`
  - `lib/actions/index.ts`
  - `lib/actions/admin.ts`
  - `lib/services/contact-moderation.ts`
  - `lib/actions/messages.ts`
  - `app/api/safety/evidence/[evidenceId]/route.ts`

---

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | DB Schema | User & Profile Models | Core user account and role-specific profiles for Traveler, Couple (Host), and Agent | User registration payload | Prisma User & Profile records | Unique constraint violation on email/clerkUserId | `prisma/schema.prisma` |
| 2 | DB Schema | Verification Model | Verification data store covering traveler passport/selfie, host PAN/Aadhaar/bank, and agent GST/reg docs | User ID & document metadata | Verification record | Unique constraint on `userId` | `prisma/schema.prisma` |
| 3 | Verification | Admin Request Verification | Admin initiates verification requirement for a user before user can upload | `userId`, `requiredDocuments`, `adminNotes` | Updated Verification record (`PENDING`), user notification | 403 Forbidden for non-admins; error if admin acts on self | `lib/actions/admin.ts:340` |
| 4 | Verification | User Submit Verification | User uploads documents and submits verification payload | Document URLs, PAN/Aadhaar/Passport data | Verification record updated (`PENDING`), email sent | Throws `VERIFICATION_NOT_REQUESTED` if unrequested | `lib/actions/index.ts:891` |
| 5 | Verification | Admin Review Verification | Admin approves, rejects, or requests changes on user verification | `verificationId`, `status`, `notes` | Verification (`APPROVED`/`REJECTED`), User status (`ACTIVE`/`ONBOARDING`), audit log | Throws 403 Forbidden for non-admins | `lib/actions/index.ts:944` |
| 6 | Storage Security | UploadThing Middleware Guard | UploadThing route authorization checking session and DB verification state | File stream & session | Presigned upload URL | Throws `UNAUTHORIZED`, `UNAUTHORIZED_NO_VERIFICATION_REQUEST`, or `UNAUTHORIZED_VERIFICATION_LOCKED` | `lib/storage/index.ts:47` |
| 7 | Storage Security | Evidence API Proxy Guard | Secure evidence document proxy endpoint enforcing case participant authorization | `evidenceId` | Redirect to presigned file URL | Throws 403 Forbidden for non-participants | `app/api/safety/evidence/[evidenceId]/route.ts` |
| 8 | Contact Moderation | Text Normalizer (`normalizeForModeration`) | Strips zero-width chars, applies NFKD, removes diacritics, collapses spaces | Raw message string | Clean normalized ASCII string | Returns empty string for empty input | `lib/services/contact-moderation.ts:34` |
| 9 | Contact Moderation | Prohibited Contact Detector | Evaluates normalized text against regex for email, phone, WhatsApp/social links | Message text | `ContactDetectionResult` (`hasProhibitedContact`, `detectedTypes`, `reason`) | N/A (pure detection function) | `lib/services/contact-moderation.ts:62` |
| 10 | Contact Moderation | Message Send/Edit Interceptor | Intercepts `sendMessage` and `editMessage` actions to block off-platform contact sharing | Message text & conversation ID | DB Message record created/updated | Throws prohibited contact error & logs audit | `lib/actions/messages.ts:227` |

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | UploadThing Verification Guard | User without Admin request calls `verificationDocument` upload | Middleware queries DB, finds no Verification record, throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` |
| 2 | UploadThing Verification Guard | User with `APPROVED` verification attempts re-upload | Middleware checks status, detects `APPROVED`, throws `UNAUTHORIZED_VERIFICATION_LOCKED` |
| 3 | Verification Action | User calls `submitVerificationAction` without pre-existing record | Server Action throws `VERIFICATION_NOT_REQUESTED` error |
| 4 | Admin Request Action | Admin attempts to trigger verification request for themselves | Server Action throws "Forbidden: Admins cannot request verification on themselves." |
| 5 | Contact Moderation | Zero-width space inserted in email (`traveler\u200B@example.com`) | `normalizeForModeration` strips `\u200B`, regex detects `EMAIL_ADDRESS`, message is blocked |
| 6 | Contact Moderation | Diacritics used in email local part (`jöhn@example.com`) | NFKD decomposition + diacritic strip reduces to `john@example.com`, regex detects email |
| 7 | Contact Moderation | Obfuscated email syntax (`user [at] domain [dot] com`) | `EMAIL_REGEX` matches `[at]` and `[dot]` patterns, message is blocked |
| 8 | Contact Moderation | Spelled-out phone number (`nine eight seven six...`) | `SPAL_PHONE_REGEX` matches spelled-out digit sequences, message is blocked |
| 9 | Evidence API | Non-participant user requests `/api/safety/evidence/[evidenceId]` | Route checks case participants & uploader ID, returns HTTP 403 Forbidden |

---

## Detailed Technical Analysis

### Section 1: DB Schema & Models
1. **`User` Model (`prisma/schema.prisma:111`)**:
   - Primary identifier: `id` (UUID), `clerkUserId` (unique), `email` (unique).
   - Core roles: `UserRole` enum (`TRAVELER`, `COUPLE`, `AGENT`, `ADMIN`).
   - Core status: `UserStatus` enum (`ACTIVE`, `ONBOARDING`, `BANNED`).
   - One-to-one profile relations: `TravelerProfile`, `CoupleProfile`, `AgentProfile`, `Verification`.
   - Relations: `Booking`, `Message`, `ConversationParticipant`, `SafetyCase`, `UserRestriction`, `ReviewHelpfulVote`, `UserQualityBadge`.
2. **`TravelerProfile` Model (`prisma/schema.prisma:168`)**:
   - Fields: `userId`, `fullName`, `country`, `language`, `interests`, `budget`, `preferences`, `foodPreferences`, `accessibility`, `deletedAt`.
3. **`CoupleProfile` (Host) Model (`prisma/schema.prisma:193`)**:
   - Fields: `userId`, `weddingDate`, `weddingLocation`, `expectedGuests`, `traditions`, `languagesSpoken`, `photographyRules`, `familyBio`, `stripeAccountId`, `stripeOnboardingComplete`, `deletedAt`.
4. **`AgentProfile` Model (`prisma/schema.prisma:218`)**:
   - Fields: `userId`, `organization`, `country`, `experienceYears`, `targetAudience`, `verifiedChecks`, `referralCode` (unique), `stripeAccountId`, `stripeOnboardingComplete`, `deletedAt`.
5. **`Verification` Model (`prisma/schema.prisma:628`)**:
   - Status: `VerificationStatus` enum (`NOT_SUBMITTED`, `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `NEED_MORE_DOCUMENTS`, `EXPIRED`).
   - Common fields: `govtIdUrl`, `phoneVerified`, `emailVerified`.
   - Traveler fields: `passportUrl`, `selfieUrl`, `emergencyContact`, `nationality`, `visaStatus`, `travelInsuranceUrl`, `medicalDeclaration`.
   - Host fields: `panNumber`, `panUrl`, `aadhaarNumber`, `aadhaarUrl`, `addressProofUrl`, `weddingProofUrl`, `venueConfirmUrl`, `invitationUrl`, `bankName`, `bankAccountNo`, `bankIfsc`, `bankVerificationUrl`, `socialLinks`.
   - Agent fields: `gstNumber`, `gstUrl`, `orgDetails`, `businessRegUrl`, `linkedinUrl`, `portfolioUrl`, `experienceYears`, `references`.
   - Audit fields: `submissionDate`, `notes`, `expiryDate`, `reviewedBy`.
6. **`Messaging` Models (`prisma/schema.prisma:812-878`)**:
   - `Conversation`: `id`, `title`, `bookingId`, `archived`.
   - `ConversationParticipant`: `conversationId`, `userId`, `lastReadAt`, `muted`, `pinned`.
   - `Message`: `id`, `conversationId`, `senderId`, `type` (`TEXT`, `IMAGE`, `FILE`, `SYSTEM`, `BOOKING`, `PAYMENT`, `VERIFICATION`), `text`, `image`, `attachment`, `editedAt`, `deletedAt`.
7. **`Booking` Model (`prisma/schema.prisma:335`)**:
   - Fields: `id`, `travelerId`, `weddingId`, `date`, `guestsCount`, `pricePerGuest`, `totalAmount`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `AWAITING_PAYMENT`, `PAID`, `CONFIRMED`, `READY_FOR_EVENT`, `CHECKED_IN`, `ATTENDED`, `COMPLETED`, `CANCELLED`, `REFUNDED`, `NO_SHOW`).
   - Relations: `BookingGuest`, `Payment`, `Review`, `Conversation`, `Commission`, `GuestPass`, `TravelerPreparation`, `EmergencyContact`, `TravelDetail`.

### Section 2: Verification Lifecycle
- **Flow Overview**:
  1. **Signup / Basic Info**: User creates account. `UserStatus = ONBOARDING`. No verification record exists or status is `NOT_SUBMITTED`.
  2. **Admin Requests Verification**: Admin opens `/dashboard/admin/verifications` or user table and invokes `adminRequestVerificationAction(userId, requiredDocuments, adminNotes)`.
     - Validates admin role (`UserRole.ADMIN`).
     - Prevents self-request.
     - Creates or updates `Verification` record with `status = PENDING` (or `NEED_MORE_DOCUMENTS`) and audit note `[VERIFICATION REQUESTED]`.
     - Triggers system notification (`type = REQUEST`) to user.
  3. **User Uploads**: User opens `/dashboard/verification`. UI loads `VerificationForm.tsx`.
     - Uploads files using UploadThing buttons connected to `verificationDocument` and `passport` endpoints.
     - Submits form calling `submitVerificationAction(formData)`.
     - `submitVerificationAction` checks `existingVerification.status !== NOT_SUBMITTED`. Updates `Verification` record, sets `submissionDate = new Date()`, sends `submitVerification` email, and notifies trust team.
  4. **Admin Approval**: Admin reviews docs in Admin Control Center and calls `reviewVerificationAction(verificationId, status, notes)`.
     - Sets `Verification.status = APPROVED`, `expiryDate = now + 365 days`, `reviewedBy = admin.name`.
     - Sets `User.status = ACTIVE`.
     - Triggers approval notification, email, and reputation badge event (`VERIFICATION_APPROVED`).

### Section 3: Storage Security
- **Defense in Depth Matrix**:
  1. **UI Layer (`VerificationForm.tsx`)**: Form badge renders status. If unrequested, submit button/upload elements inform user.
  2. **Server Action Layer (`submitVerificationAction`)**: Line 912 checks `!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED` and throws `VERIFICATION_NOT_REQUESTED`.
  3. **UploadThing Endpoint Layer (`lib/storage/index.ts:47, 98`)**: In `.middleware()`, checks session and queries `prisma.verification.findUnique({ where: { userId } })`. Throws `UNAUTHORIZED_NO_VERIFICATION_REQUEST` if missing, or `UNAUTHORIZED_VERIFICATION_LOCKED` if already approved/under review.
  4. **DB & Query Layer**: `submitVerificationAction` calls `prisma.verification.update` (not `.upsert`), ensuring non-existent records cannot be created by client calls. `Verification.userId` is `@unique`.
  5. **Evidence Access Privacy (`app/api/safety/evidence/[evidenceId]/route.ts`)**: Gated route verifying session ID matches uploader, reporter, subject, participant, or ADMIN before serving presigned URL redirect.

### Section 4: PII Protection & Data Minimization
- **Role-Based Minimization**:
  - Verification fields (PAN, Aadhaar, Passport, Bank IFSC/Account, Insurance) are excluded from all public API queries and user DTOs.
  - Public wedding and host APIs return sanitized user objects (`name`, `avatar`, `role`).
  - Sensitive booking details (`EmergencyContact`, `TravelDetail.medicalNotes`) are isolated in dedicated tables and queried strictly within authenticated booking context routes.
  - `EventContact` records include a `visibleToGuests` boolean flag to suppress private phone/WhatsApp details until guest registration is confirmed.

### Section 5: Contact Moderation Mechanics
- **Normalizer Engine (`lib/services/contact-moderation.ts:34`)**:
  - `replace(/[\u200B-\u200D\uFEFF...]/g, "")`: Removes zero-width spaces (U+200B), zero-width non-joiners (U+200C), soft hyphens, and hidden control chars.
  - `normalize("NFKD")`: Decomposes full-width Unicode characters, ligatures, and homoglyphs into base characters.
  - `replace(/[\u0300-\u036F...]/g, "")`: Strips combining diacritic marks.
  - `replace(/[\s\u00A0...]+/g, " ")`: Normalizes non-breaking spaces (U+00A0), em-spaces, and multi-spaces into a single space.
- **Pattern Matching (`detectProhibitedContactInfo`)**:
  - `EMAIL_REGEX`: Matches standard emails and obfuscations such as `user [at] domain [dot] com`, `user(at)domain(dot)com`, `user AT domain DOT com`.
  - `PHONE_REGEX`: Matches international formats (`+91 9876543210`, `(022) 2345 6789`).
  - `SPAL_PHONE_REGEX`: Matches spelled-out digits (`nine eight seven six...`).
  - `SOCIAL_WHATSAPP_REGEX`: Detects handles/links for WhatsApp (`wa.me`, `whatsapp`, `wsp`), Telegram (`t.me`, `telegram`), Instagram, Facebook, Twitter, LinkedIn, Snapchat, TikTok, Discord, and phrase triggers (`dm me`, `message me`, `call me`, `reach me`).
- **Enforcement (`lib/actions/messages.ts`)**:
  - Called inside `sendMessage` (line 227) and `editMessage` (line 340).
  - On match, invokes `logMessageAudit("CONTACT_INFO_BLOCKED", ...)` and throws `contactCheck.reason` to halt execution.

### Section 6: Feature Inventory
1. **Verification Request Action**: `lib/actions/admin.ts:340` (`adminRequestVerificationAction`)
2. **Verification Submit Action**: `lib/actions/index.ts:891` (`submitVerificationAction`)
3. **Verification Review Action**: `lib/actions/index.ts:944` (`reviewVerificationAction`)
4. **UploadThing FileRouter**: `lib/storage/index.ts:11` (`ourFileRouter`)
5. **UploadThing API Route**: `app/api/uploadthing/route.ts:14`
6. **Safety Evidence Access Route**: `app/api/safety/evidence/[evidenceId]/route.ts:8`
7. **Contact Moderation Service**: `lib/services/contact-moderation.ts:62` (`detectProhibitedContactInfo`)
8. **Message Sending Interceptor**: `lib/actions/messages.ts:227` (`sendMessage`)
9. **Message Editing Interceptor**: `lib/actions/messages.ts:340` (`editMessage`)
10. **Verification Form UI Component**: `components/dashboard/VerificationForm.tsx:28`
11. **User Verification Dashboard Page**: `app/dashboard/verification/page.tsx:7`
12. **Admin Verifications Management Page**: `app/dashboard/admin/verifications/page.tsx`
