# ADMIN_OPERATIONS_GUIDE — Platform Administration & Governance Operations

> **Platform**: WeddingWithIndia  
> **Target Audience**: System Administrators, Platform Operators, Trust & Safety Team, Finance Ops  
> **Primary Admin Email**: `founder@weddingwithindia.com`  
> **Document Status**: Production Complete & Verified  

---

## 1. Safe Admin Elevation & Bootstrapping Protocol

### 1.1 Overview & Security Model
Administrative privileges in WeddingWithIndia are strictly server-authoritative and database-backed. Users cannot register directly as an Administrator via client forms, nor can existing users promote themselves during onboarding or profile editing. 

Initial admin access and subsequent operator elevation are executed exclusively through the server-side CLI bootstrap script.

### 1.2 Step-by-Step Admin Elevation Guide

#### Step 1: User Signup via Clerk
The target administrator (e.g. `founder@weddingwithindia.com`) must first create a standard user account via the public signup flow (`/signup`). This establishes the Clerk user session and creates a corresponding record in the PostgreSQL database with default role `TRAVELER` and status `ONBOARDING`.

#### Step 2: Run Bootstrap Command
An operator with direct CLI access to the server infrastructure or deployment container executes the bootstrap script:

```bash
node scripts/bootstrap-admin.js founder@weddingwithindia.com
```

#### Step 3: Script Execution Mechanics
The script executes the following database mutation using Prisma ORM (`scripts/bootstrap-admin.js`):

```javascript
// 1. Resolves user by target email
const user = await prisma.user.findUnique({
  where: { email: targetEmail }
});

// 2. Safely elevates user role and status
const updated = await prisma.user.update({
  where: { id: user.id },
  data: { 
    role: "ADMIN", 
    status: "ACTIVE" 
  }
});
```

#### Step 4: Verification of Admin Elevation
Upon successful script completion, log in to the platform with `founder@weddingwithindia.com`. Access to the Admin Control Center at `/dashboard/admin` will be unlocked immediately.

---

## 2. Server Authorization & Middleware Security Architecture

### 2.1 Multi-Layered Protection Matrix

```
+---------------------------------------------------------------------------------------------------------+
|                                    ADMIN SECURITY DEFENSE MATRIX                                       |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   1. EDGE PROXY MIDDLEWARE (`proxy.ts`)                                                                  |
|      - Matches `/dashboard/admin/*` and `/api/admin/*`                                                  |
|      - Invokes `clerkMiddleware()` auth protection before edge routing                                  |
|                                                                                                         |
|   2. SERVER COMPONENT / PAGE GUARDS (`lib/auth.ts`)                                                     |
|      - `requireRole([UserRole.ADMIN])` checks DB record for authenticated Clerk session                 |
|      - Throws HTTP 403 / redirects unauthorized users to `/login` or `/dashboard`                      |
|                                                                                                         |
|   3. SERVER ACTION MUTATION GUARDS (`lib/actions/admin.ts`, `lib/actions/founder.ts`)                  |
|      - Every Server Action performs `await requireRole([UserRole.ADMIN])` at entry                       |
|      - Writes immutable audit log entries to `AdminAuditLog` table                                       |
|                                                                                                         |
|   4. SELF-ELEVATION BLOCK (`lib/actions/index.ts`)                                                      |
|      - `updateUserRoleAction` explicitly checks `if (role === UserRole.ADMIN) throw new Error(...)`     |
|      - Blocks malicious client payloads requesting role escalation during onboarding                     |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### 2.2 Server Action Enforcement Example
Every administrative mutation function in `lib/actions/admin.ts` incorporates authoritative role checking:

```typescript
export async function adminReviewVerificationAction(input: AdminReviewVerificationInput) {
  // 1. Authoritative DB Role Check
  const admin = await requireRole([UserRole.ADMIN]);
  
  // 2. Perform Mutation
  // ...
  
  // 3. Write Immutable Audit Log
  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: "VERIFICATION_REVIEW",
      targetId: input.verificationId,
      details: JSON.stringify(input)
    }
  });
}
```

---

## 3. Admin Portal Feature Operations & Workflows

### 3.1 User Management & Role Control (`/dashboard/admin/users`)

#### Operations:
- **User Search & Filter**: Search users by name, email, role (`TRAVELER`, `COUPLE`, `AGENT`, `ADMIN`), or account status (`ACTIVE`, `ONBOARDING`, `BANNED`).
- **Account Status Mutation**: Suspend or reactivate user accounts using `adminUpdateUserStatusAction`.
- **User Restrictions**: Impose targeted restrictions (e.g. `BLOCK_MESSAGING`, `BLOCK_BOOKING`, `BLOCK_LISTING`) to isolate suspicious accounts without banning them entirely.

#### Operating Procedure:
1. Navigate to `/dashboard/admin/users`.
2. Locate user via search input or role filter pill.
3. Click **Manage User** to open the user detail drawer.
4. Select desired status (`ACTIVE` / `BANNED`) or check specific restriction flags.
5. Provide compulsory mandatory audit note explaining the action.
6. Click **Save Changes**.

---

### 3.2 KYC Verification Reviews & Document Audits (`/dashboard/admin/verifications`)

#### Security Rule (Requirement R2 Enforcement):
Users cannot upload sensitive KYC documents (Passport, PAN, Aadhaar) until an Administrator explicitly issues a verification request. Unrequested uploads are blocked at the UploadThing storage gate and Server Action layer.

#### Operating Procedure:

```
+---------------------------------------------------------------------------------------------------------+
|                                    KYC VERIFICATION REVIEW WORKFLOW                                     |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [Step 1: Request] Admin clicks "Request Verification" on user profile                                  |
|                    ---> System creates `Verification` record with status `NOT_SUBMITTED` / `PENDING`     |
|                    ---> Unlocks upload capability for user                                             |
|                                                                                                         |
|  [Step 2: Submit]  User uploads required documents via `/dashboard/verification`                          |
|                    ---> Verification status transitions to `PENDING`                                    |
|                                                                                                         |
|  [Step 3: Audit]   Admin opens `/dashboard/admin/verifications`                                         |
|                    ---> Inspects Document Previews (Passport, PAN, Aadhaar, Bank Details)               |
|                                                                                                         |
|  [Step 4: Decision] Admin selects action:                                                               |
|                    - APPROVE           -> Status: APPROVED, User status: ACTIVE, Badge awarded          |
|                    - REJECT            -> Status: REJECTED, Reason logged                               |
|                    - NEED_MORE_DOCS    -> Status: NEED_MORE_DOCUMENTS, Feedback sent                     |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

### 3.3 Listing Publishing Approvals & Wedding Oversight (`/dashboard/admin/weddings`)

#### Security Rule (Requirement R3 Enforcement):
Host couples cannot publish wedding experience listings without verified KYC status. Attempts by unverified hosts to set `status = PUBLISHED` are automatically downgraded to `DRAFT` by the server.

#### Operating Procedure:
1. Navigate to `/dashboard/admin/weddings`.
2. Filter queue by `Pending Approval`.
3. Click **Review Experience** to inspect wedding itinerary, host profile, pricing per guest, venue location, capacity limits, and photo gallery.
4. Verify host's verification badge (`VerificationStatus === APPROVED`).
5. Click **Approve & Publish** to make listing live on marketplace, or click **Reject** with feedback for host.

---

### 3.4 Safety Triage, Incident Queue & Financial Holds (`/dashboard/admin/safety`)

#### Operations:
- **Incident Triage**: Review user-submitted safety reports and system-flagged incidents.
- **Severity Classification**: Assign severity tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Private Evidence Inspection**: Access attached evidence files via secure proxy endpoint (`/api/safety/evidence/[evidenceId]`). The proxy verifies admin role before redirecting to presigned file streams.
- **Financial Hold**: Place host earnings on hold (`payoutStatus = HELD`) during active safety disputes.

#### Operating Procedure:
1. Open `/dashboard/admin/safety`.
2. Select target case from active queue to open detail view at `/dashboard/admin/safety/[caseId]`.
3. Review case timeline, involved parties (Traveler, Host, Coordinator), and uploaded evidence.
4. Click **Place Payout Hold** if safety dispute involves financial claims.
5. Resolve case with appropriate resolution type (`DISMISSED`, `WARNING_ISSUED`, `PARTIAL_REFUND`, `FULL_REFUND`, `USER_BANNED`).

---

### 3.5 Finance, Refund & Stripe Payment Operations (`/dashboard/admin/payments` & `/dashboard/admin/finance`)

#### Financial Integrity Guards:
- **Server Pricing Authority**: All transaction totals are computed from database fields (`pricePerGuest * guestsCount`). Client-supplied amounts are ignored.
- **Cumulative Partial Refund Guard**: Partial refund requests (`processPartialRefundAction`) query previous `Refund` records to ensure `(sum(previousPartialRefunds) + newPartialRefund) <= totalPayment`.
- **Webhook Idempotency**: All Stripe webhooks are deduplicated against `StripeWebhookEvent` table.

#### Operating Procedure for Refunds:
1. Navigate to `/dashboard/admin/payments`.
2. Locate target transaction by Booking ID, Payment ID, or Guest Email.
3. Click **Issue Refund**.
4. Choose **Full Refund** or **Partial Refund**.
5. For Partial Refund, enter amount in USD/INR. System verifies cumulative total.
6. Enter mandatory administrative reason.
7. Click **Confirm Refund**. Transaction executes via Stripe API (`stripe.refunds.create`) with unique idempotency key.

---

### 3.6 Agent Partner Management & Commission Controls (`/dashboard/admin/agents`)

#### Operations:
- **Agent Application Review**: Approve or reject partner applications.
- **Referral Code Generation**: Auto-assign custom referral code (`WWI-XXXX`) upon agent onboarding.
- **Commission Split Control**: Configure base referral budget and tier rates (Tier 1: 5%, Tier 2: 7.5%, Tier 3: 10%).
- **Payout Approvals**: Review and release agent withdrawal requests (`PayoutRequest`).

#### Operating Procedure:
1. Navigate to `/dashboard/admin/agents`.
2. Review pending applications under `Pending Approval` tab.
3. Inspect organization credentials, portfolio URL, and target audience.
4. Click **Approve Agent**. System sets `AgentProfile.verifiedChecks = true` and updates user status to `ACTIVE`.

---

### 3.7 CMS & System Configuration (`/dashboard/admin/cms`, `/dashboard/admin/settings`, `/dashboard/admin/founder`)

#### Operations:
- **CMS Management (`/dashboard/admin/cms`)**: Update homepage hero banners, curated cultural category listings, featured wedding spotlights, SEO metadata, and legal policy pages.
- **Platform Settings (`/dashboard/admin/settings`)**: Configure platform fee split percentage (default 22%), tax withholding rates, tax registration numbers, and operational thresholds.
- **Founder Control Panel (`/dashboard/admin/founder`)**: Generate promotional discount coupons (`$0 Bypass` authorized), trigger platform maintenance modes, and inspect raw system telemetry logs.

---

## 4. Emergency Incident Response & Escalation Runbook

| Incident Type | Severity | Immediate Action | Secondary Action |
|---|---|---|---|
| Malicious Admin Self-Elevation Attempt | HIGH | System auto-blocks attempt (`updateUserRoleAction`). Review server logs for user ID. | Issue security audit alert; suspend user account via `/dashboard/admin/users`. |
| Unrequested Verification Upload Attempt | MEDIUM | UploadThing middleware blocks presigned URL (`UNAUTHORIZED_NO_VERIFICATION_REQUEST`). | Inspect user audit history for automated submission bot patterns. |
| Contact Leak Evasion in Messaging | LOW / MED | Moderation service (`lib/services/contact-moderation.ts`) normalizes Unicode homoglyphs and blocks message. | Audit message attempt at `/dashboard/admin/messages`; issue automated warning to user. |
| Duplicate Stripe Webhook Execution | LOW | Webhook listener (`/api/webhooks/stripe/route.ts`) catches duplicate `stripeEventId`. | Return HTTP 200 OK to Stripe; log idempotent duplicate catch. |
| Host Payout Dispute / Safety Incident | HIGH | Navigate to `/dashboard/admin/safety/[caseId]`. Click **Place Payout Hold**. | Freeze Stripe payout stream for wedding listing until case resolution. |

---

## 5. Audit Logging & Compliance Verification

Every administrative operation generates an immutable audit record in PostgreSQL. Administrators can audit platform actions by inspecting the `AdminAuditLog` model with fields:
- `id` (UUID)
- `adminId` (Foreign key to `User`)
- `action` (e.g. `USER_STATUS_UPDATE`, `VERIFICATION_REVIEW`, `REFUND_ISSUED`, `LISTING_APPROVED`)
- `targetId` (ID of affected user, booking, listing, or verification)
- `details` (JSON payload of modified attributes)
- `createdAt` (Timestamp)
