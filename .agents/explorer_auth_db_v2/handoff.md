# Handoff Report — Auth & Database Integrity Explorer (R3 & R4)

## 1. Observation

Direct observations from codebase inspection across `lib/auth.ts`, `lib/prisma.ts`, `prisma/schema.prisma`, `app/api/webhooks/stripe/route.ts`, and `lib/actions/*.ts`:

### Observation O1: `syncAndGetDbUser()` User Reconciliation & P2002 Email Conflict
- **File**: `lib/auth.ts`, lines 94–137
- **Code Snippet**:
```typescript
const existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } });
const existingByEmail = await tx.user.findUnique({ where: { email } });

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
- **Constraint**: `prisma/schema.prisma` line 113 defines `email String @unique`.
- **Finding**: When `existingByClerkId` exists (User A) and its email changes in Clerk to an email owned by User B (`existingByEmail`), `tx.user.update({ where: { id: existingByClerkId.id }, data: { email } })` attempts to overwrite User A's email to User B's email. PostgreSQL rejects this with `P2002: Unique constraint failed on the fields: (email)`. Additionally, raw Clerk email lookups without `.toLowerCase().trim()` can miss existing DB rows, and `tx.user.create` lacks a `P2002` retry catch for concurrent signups.

### Observation O2: Founder DB Row Canonical Truth Protection
- **Files**: `scripts/bootstrap-admin.js` (lines 25–42), `lib/auth.ts` (lines 111–124)
- **Code Snippet**:
```typescript
upsertedUser = await tx.user.update({
  where: { id: existingByEmail.id },
  data: {
    clerkUserId: clerkUser.id,
    name,
    avatar
  }
});
```
- **Finding**: When `founder@weddingwithindia.com` authenticates via Clerk for the first time, `existingByEmail` matches the bootstrapped DB record created by `scripts/bootstrap-admin.js`. The update payload modifies only `clerkUserId`, `name`, and `avatar`. The record's `role: ADMIN` and `status: ACTIVE` are untouched. Client self-role elevation to ADMIN is blocked in `lib/actions/index.ts` line 37.

### Observation O3: Prisma Singleton Implementation
- **File**: `lib/prisma.ts`, lines 25–38
- **Code Snippet**:
```typescript
const prismaClientSingleton = () => {
  const url = buildDatasourceUrl();
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
};
declare const globalThis: { prismaGlobal: ReturnType<typeof prismaClientSingleton>; } & typeof global;
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
```
- **Finding**: `lib/prisma.ts` enforces global singleton pattern across Next.js dev server hot-module reloads. Grep search confirmed zero unauthorized instantiations of `new PrismaClient()` in `app/` or `lib/`.

### Observation O4: Database Connection & Transaction Timeouts
- **File**: `lib/prisma.ts`, lines 16–23 (`buildDatasourceUrl()`)
- **Code Snippet**:
```typescript
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("connect_timeout=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connect_timeout=15`;
}
```
- **Finding**: `connect_timeout=15` is appended to `DATABASE_URL`, setting driver-level TCP connection timeout to 15s. `syncAndGetDbUser()` in `lib/auth.ts` passes `{ maxWait: 10000, timeout: 15000 }` to `$transaction`. Other server actions in `lib/actions/` omit explicit transaction options and use Prisma default timeouts (`maxWait: 2000`, `timeout: 5000`).

### Observation O5: Absence of `Promise.race` Leaks
- **File**: `lib/prisma.ts`, lines 66–81 (`isDatabaseAvailable()`)
- **Finding**: `isDatabaseAvailable()` uses direct `await prisma.$queryRaw`SELECT 1`` without `Promise.race` wrappers. Zero `Promise.race` calls exist in production paths, preventing background connection leaks.

### Observation O6: Transaction Atomicity & External Call Isolation
- **Violations Found**:
  1. `app/api/webhooks/stripe/route.ts` (lines 178–186): `await sendInvoiceEmail(...)` (async email network call) is executed inside `prisma.$transaction(async (tx) => { ... })`.
  2. `lib/actions/index.ts` (lines 849–852): `const stripeRefund = await stripe.refunds.create(...)` (Stripe API call) is executed inside `prisma.$transaction(async (tx) => { ... })` in `refundBookingAction`.

---

## 2. Logic Chain

1. **P2002 Root Cause & Resolution**:
   - *From Observation O1*: When `existingByClerkId` is found, the current code unconditionally attempts to update its `email` field to `clerkUser.email`. If another record (`existingByEmail`) already owns that email, Prisma throws `P2002`.
   - *Deduction*: Lookups must normalize email via `.toLowerCase().trim()`. If `existingByClerkId` and `existingByEmail` exist and point to different records, `existingByEmail` represents the canonical record for that email (e.g. founder). The code must reconcile `clerkUserId` onto `existingByEmail` rather than overwriting `existingByClerkId.email`. `tx.user.create()` must catch `P2002` to gracefully handle concurrent signup race conditions.

2. **Founder Security & Canonical Truth**:
   - *From Observation O2*: Matching by `existingByEmail` preserves the founder's DB row. Updating only `clerkUserId`, `name`, and `avatar` guarantees `role: ADMIN` and `status: ACTIVE` are never downgraded or duplicated.

3. **Prisma Singleton & `Promise.race` Audit**:
   - *From Observations O3 & O5*: `lib/prisma.ts` correctly manages singletons and avoids `Promise.race` wrappers, ensuring connection pool stability without orphaned query leaks.

4. **Transaction Atomicity Fixes**:
   - *From Observation O6*: Executing `sendInvoiceEmail` and `stripe.refunds.create` inside `$transaction` blocks holds database connections open during network latency and causes DB rollbacks on network failures after external actions complete. Moving external API calls outside `$transaction` enforces strict transaction atomicity and prevents transaction lock contention.

---

## 3. Caveats
- Direct execution of live database queries against production Supabase instance was not performed (investigation is read-only).
- Code changes were analyzed and specified, but not applied to source files per explorer mandate.

---

## 4. Conclusion

1. **R3 (Identity & Auth Hardening)**:
   - Root cause of P2002 is conflicting `email` updates when `existingByClerkId` and `existingByEmail` are separate records, unnormalized email lookups, and unhandled race conditions in `create()`.
   - The reconciliation specification (Section 1.2 of `analysis.md`) safely resolves P2002, normalizes emails, catches concurrent `create()` races, and protects founder canonical truth.

2. **R4 (Database & Transaction Integrity)**:
   - Prisma singleton and `Promise.race` leak prevention are fully verified and compliant in `lib/prisma.ts`.
   - Database connection timeout `connect_timeout=15` is properly configured.
   - Transaction atomicity requires extracting `sendInvoiceEmail` in `app/api/webhooks/stripe/route.ts` and `stripe.refunds.create` in `lib/actions/index.ts` out of `$transaction` callbacks.

---

## 5. Verification Method

To independently verify the findings and subsequent implementations:
1. **Type & Code Invariants**:
   - Run `npm run type-check` and `npm run lint`.
2. **Jest Test Verification**:
   - Run `npm test -- --no-coverage` (specifically `__tests__/lib/auth-db-availability.test.ts`).
3. **File Inspection Targets**:
   - `lib/auth.ts`: Verify `syncAndGetDbUser()` email normalization, state machine reconciliation, and P2002 race handling.
   - `app/api/webhooks/stripe/route.ts`: Verify `sendInvoiceEmail` is outside `$transaction`.
   - `lib/actions/index.ts`: Verify `stripe.refunds.create` in `refundBookingAction` is outside `$transaction`.
