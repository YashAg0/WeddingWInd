# Auth & Database Integrity Technical Analysis (R3 & R4)

## Executive Summary
This analysis details the technical investigation of **Requirement R3 (Identity & Auth Hardening)** and **Requirement R4 (Database & Transaction Integrity)** for the WeddingWithIndia platform. 

The investigation covers:
1. The root cause of the Prisma `P2002` unique constraint error on `email` inside `syncAndGetDbUser()`, reconciliation between Clerk user sessions and PostgreSQL user rows, and canonical founder row protection.
2. Prisma singleton verification, database connection & transaction timeout configurations, elimination of `Promise.race` memory leaks, and isolation of external side effects from Prisma transactions.

---

## 1. Requirement R3: Identity & Auth Hardening Analysis

### 1.1 Root Cause of P2002 Email Error in `syncAndGetDbUser()`
File: `lib/auth.ts` (lines 50–203)

In the current implementation of `syncAndGetDbUser()`, step 3 queries the database inside a transaction:
```typescript
const existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } });
const existingByEmail = await tx.user.findUnique({ where: { email } });
```
Then applies branching logic:
```typescript
if (existingByClerkId) {
  upsertedUser = await tx.user.update({
    where: { id: existingByClerkId.id },
    data: { email, name, avatar }
  });
} else if (existingByEmail) {
  upsertedUser = await tx.user.update({
    where: { id: existingByEmail.id },
    data: { clerkUserId: clerkUser.id, name, avatar }
  });
} else {
  upsertedUser = await tx.user.create({ ... });
}
```

#### Vulnerabilities & Causes of P2002:
1. **Conflicting Email Overwrite (Primary P2002 Cause)**:
   If `existingByClerkId` exists (e.g. User A with `id: "user_a"`, `clerkUserId: "clerk_123"`, `email: "old@domain.com"`), and the email returned by Clerk changes to `founder@weddingwithindia.com` (or matches an existing user B), `if (existingByClerkId)` executes `tx.user.update({ where: { id: "user_a" }, data: { email: "founder@weddingwithindia.com" } })`. Because `User.email` has a `@unique` constraint in `prisma/schema.prisma` (line 113), PostgreSQL rejects the update with **P2002: Unique constraint failed on the fields: (`email`)**.
2. **Case-Sensitivity & Normalization Mismatch**:
   Clerk email strings may contain uppercase characters or whitespace. PostgreSQL lookups using raw Clerk strings can fail `findUnique({ where: { email } })`, leading the code to enter the `else` branch and attempt `tx.user.create()`. If PostgreSQL or unique index normalizes the string, `create()` fails with P2002.
3. **Unchecked Race Conditions on Concurrent Signups/Logins**:
   When a user signs up or logs in across multiple tabs or parallel API requests, concurrent `syncAndGetDbUser()` calls both find no existing record and attempt `tx.user.create()`. The second `create()` throws `P2002`. In `lib/auth.ts`, the top-level catch block logs a fatal error and throws `SERVICE_UNAVAILABLE` rather than catching `P2002` and retrying or fetching the created record.

---

### 1.2 Clerk ID vs. Verified Email Reconciliation Specification

To prevent `P2002` and maintain deterministic identity reconciliation, `syncAndGetDbUser()` must implement the following reconciliation state machine:

#### Step 1: Normalization
```typescript
const email = (clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@guest.weddingwithindia.com`)
  .toLowerCase()
  .trim();
```

#### Step 2: Database Lookups (Inside Transaction)
```typescript
const existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } });
const existingByEmail = await tx.user.findUnique({ where: { email } });
```

#### Step 3: Reconciliation Matrix

| `existingByClerkId` | `existingByEmail` | Condition | Correct Reconciliation Action |
| --- | --- | --- | --- |
| Exists | Exists | Same User (`id` matches) | Update `name` and `avatar`. Update `email` if unchanged/non-conflicting. Preserve `role` & `status`. |
| Exists | Exists | Different User (`id` mismatch) | `existingByEmail` is the canonical record for that email (e.g. founder). Reconcile `clerkUserId` onto `existingByEmail`. Do NOT attempt to overwrite `existingByClerkId.email` with `existingByEmail.email` (avoids P2002). |
| Exists | Null | Single Record Match | Update `name`, `avatar`, and `email` on `existingByClerkId`. |
| Null | Exists | Pending Bootstrap / Re-signed User | Reconcile `clerkUserId = clerkUser.id` onto `existingByEmail`. Update `name` & `avatar`. **NEVER** mutate `role` or `status`. |
| Null | Null | New User | Execute `tx.user.create({ data: { clerkUserId: clerkUser.id, email, name, avatar, role: "TRAVELER", status: "ONBOARDING" } })`. Wrap in try/catch for Prisma `P2002`. On `P2002`, re-query by `clerkUserId` or `email` to return existing record. |

---

### 1.3 Founder DB Row Canonical Truth Protection
- **Seeding & Bootstrap**: `scripts/bootstrap-admin.js` creates/elevates `founder@weddingwithindia.com` in PostgreSQL with `role: ADMIN` and `status: ACTIVE`.
- **Preservation Invariant**: In `syncAndGetDbUser()`, reconciliation updates `clerkUserId`, `name`, and `avatar` on `existingByEmail` without passing `role` or `status` in the update payload. The founder's `role: ADMIN` and `status: ACTIVE` remain untouched.
- **Self-Elevation Block**: Client self-role elevation is blocked in `lib/actions/index.ts:updateUserRoleAction` (`FORBIDDEN: Cannot self-assign administrative roles`).
- **Fail-Closed Guarantee**: On DB connection failures, `syncAndGetDbUser()` throws `SERVICE_UNAVAILABLE` and `isAdmin()` returns `false`. Zero synthetic users or mock permissions are returned.

---

## 2. Requirement R4: Database & Transaction Integrity Analysis

### 2.1 Strict Prisma Singleton Audit
- **File**: `lib/prisma.ts` (lines 1–85)
- **Singleton Implementation**:
  ```typescript
  const prismaClientSingleton = () => {
    const url = buildDatasourceUrl();
    return new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
  };
  declare const globalThis: { prismaGlobal: ReturnType<typeof prismaClientSingleton>; } & typeof global;
  const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
  if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
  ```
- **Audit Finding**: All application code (`app/`, `lib/`) exclusively imports `prisma` from `@/lib/prisma`. No duplicate `new PrismaClient()` instantiations exist in production runtime paths.

---

### 2.2 Connection & Transaction Timeouts
- **Datasource URL Timeout**:
  `lib/prisma.ts:buildDatasourceUrl()` appends `connect_timeout=15` to `DATABASE_URL`. This enforces a 15-second TCP connection timeout at the PostgreSQL driver level, preventing socket hanging during Supabase pooler cold starts.
- **Transaction Options**:
  `lib/auth.ts:syncAndGetDbUser()` passes `{ maxWait: 10000, timeout: 15000 }` to `$transaction`.
- **Finding**: Other server actions in `lib/actions/` rely on Prisma default transaction timeouts (`maxWait: 2000`, `timeout: 5000`). Under high network latency or Supabase pooler cold starts, default 2s acquisition timeouts can trigger transient errors. Recommending explicit `maxWait: 10000, timeout: 15000` options across critical transaction callers.

---

### 2.3 `Promise.race` Audit & Query Leak Verification
- **Audit Result**: `lib/prisma.ts:isDatabaseAvailable()` uses direct `await prisma.$queryRaw`SELECT 1`` without `Promise.race` wrappers.
- **Why this is critical**: `Promise.race` wrappers abandon running Prisma promises on timeout while the underlying TCP socket remains active in the pool. Removing `Promise.race` ensures abandoned queries do not leak checked-out connections or exhaust connection pool limits (`connection_limit`). Zero `Promise.race` query wrappers exist in production paths.

---

### 2.4 Transaction Atomicity & External Call Isolation Audit

Every `$transaction` block in the codebase was audited for external side effects (HTTP calls, email dispatch, Stripe API calls, cookie reads).

#### Verified Isolated Transactions:
1. `lib/auth.ts`: `getAttributionCookie()` and `associateReferralOnSignup()` run outside `$transaction`.
2. `lib/services/refunds.ts:processApprovedRefund()`: Creates `PENDING` refund in DB inside `$transaction`, executes `stripe.refunds.create()` OUTSIDE `$transaction`, and updates DB state afterwards.
3. `lib/actions/stripe.ts`: `stripe.checkout.sessions.create` and `stripe.refunds.create` run OUTSIDE `$transaction`.

#### Violations Identified (Side Effects Inside Transactions):

| File & Lines | Operation | Issue | Risk | Proposed Fix |
| --- | --- | --- | --- | --- |
| `app/api/webhooks/stripe/route.ts` (lines 178–186) | `await sendInvoiceEmail(...)` called inside `prisma.$transaction` | Async email HTTP/SMTP network call executed inside database transaction. | Transaction connection held open during email send; SMTP network error causes DB rollback of payment & ticket. | Move `sendInvoiceEmail` after `$transaction` block resolves. |
| `lib/actions/index.ts` (lines 849–852) | `await stripe.refunds.create(...)` called inside `prisma.$transaction` in `refundBookingAction()` | External Stripe HTTP API call executed inside interactive Prisma transaction. | Stripe API latency holds DB connection open; if Stripe call succeeds but DB update fails, money is refunded without DB record. | Move `stripe.refunds.create` outside transaction or adopt two-phase pattern from `lib/services/refunds.ts`. |

---

## 3. Summary of Recommendations for Implementation

1. **Fix `syncAndGetDbUser()` Reconciliation**:
   - Normalize email with `.toLowerCase().trim()`.
   - Update branching to check if `existingByClerkId` and `existingByEmail` are different records, prioritizing `existingByEmail` for `clerkUserId` linking.
   - Catch Prisma `P2002` on `tx.user.create()` to handle race conditions gracefully.
2. **Isolate External Calls from Transactions**:
   - Move `sendInvoiceEmail(...)` outside `$transaction` in `app/api/webhooks/stripe/route.ts`.
   - Refactor `refundBookingAction` in `lib/actions/index.ts` to execute `stripe.refunds.create` outside `$transaction`.
3. **Standardize Transaction Timeouts**:
   - Pass `{ maxWait: 10000, timeout: 15000 }` to `$transaction` calls in high-importance flows.
