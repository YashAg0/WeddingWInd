# Milestone 2 Investigation Report: TRU-01 & ROU-01

**Role**: Explorer Subagent (Milestone 2 - Phase 2: Trust & Route Architecture)  
**Working Directory**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m2_explorer_trust_routes`  
**Date**: 2026-08-30  
**Status**: COMPLETE (Read-Only Investigation)

---

## 1. Observation

### TRU-01: Truthful Trust Badge Binding
1. **Synthetic Badge Synthesis in `lib/wedding-dto.ts`**:
   - Lines 120 and 228 of `lib/wedding-dto.ts` calculate verification as:
     ```typescript
     // Line 120
     const isVerifiedHostMedia = !rawWedding.isDemo && (rawWedding.status === "VERIFIED" || rawWedding.status === "PUBLISHED" || !!rawWedding.isVerified);

     // Line 228
     isVerified: !rawWedding.isDemo && (rawWedding.status === "VERIFIED" || rawWedding.status === "PUBLISHED" || !!rawWedding.isVerified),
     ```
   - Direct Observation: Because `rawWedding.status === "PUBLISHED"` is included in the OR disjunction, **every published wedding record** receives `isVerified: true`, regardless of whether the hosting couple's user account has an approved KYC verification record or quality badge in the database.
   - Note on Enum Integrity: In `prisma/schema.prisma` (lines 1539–1543), `enum WeddingStatus { DRAFT, PUBLISHED, COMPLETED }`. `"VERIFIED"` is not a valid `WeddingStatus` enum value in PostgreSQL.

2. **Frontend Consumption of `isVerified`**:
   - `components/wedding/WeddingCard.tsx` (lines 238–245):
     ```tsx
     {wedding.isVerified && !wedding.isDemo && (
       <span
         className="text-emerald-600 flex-shrink-0 mt-0.5"
         title="Verified Host Celebration"
       >
         <ShieldCheck size={15} />
       </span>
     )}
     ```
   - `app/weddings/[slug]/page.tsx` (lines 188–193):
     ```tsx
     {wedding.isVerified && !wedding.isDemo && (
       <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
         <ShieldCheck size={11} />
         Verified host
       </span>
     )}
     ```
   - `components/wedding/BookingSidebar.tsx` (lines 126–135):
     ```tsx
     {wedding.isVerified && !wedding.isDemo ? (
       <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
         <ShieldCheck size={12} />
         Verified Host
       </span>
     ) : (
       <span className="inline-flex items-center gap-1 bg-warm-100 border border-warm-200 text-charcoal-600 text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
         {tierConfig.label}
       </span>
     )}
     ```

3. **Prisma Database Schema & Relations (`prisma/schema.prisma`)**:
   - Model `Verification` (lines 640–687) has `status: VerificationStatus` (`NOT_SUBMITTED`, `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `EXPIRED`, `NEED_MORE_DOCUMENTS`) and belongs to `user: User`.
   - Model `User` (lines 11–64) has `verification: Verification?` and `badges: UserQualityBadge[]`.
   - Model `CoupleProfile` (lines 88–108) has `user: User` and `weddings: Wedding[]`.
   - Model `Wedding` (lines 153–200) has `hostCouple: CoupleProfile` (`hostCoupleId`).
   - Model `UserQualityBadge` (lines 1394–1408) links `User` to `QualityBadge` with `awardedAt`, `expiresAt`, and `revokedAt`.

4. **Prisma Query Projection in `lib/actions/index.ts`**:
   - In `getWeddings()` (line 1569), `getHomepageWeddings()` (line 1657), `getRelatedWeddings()` (line 1746), and `getWeddingBySlug()` (lines 1874, 1888), Prisma queries currently specify:
     ```typescript
     hostCouple: {
       include: { user: true }
     }
     ```
   - Scalar `user: true` does NOT include related relation tables `verification` or `badges` unless explicitly nested in Prisma's `include` tree.

---

### ROU-01: Route Shadowing Resolution
1. **Permanent Redirect in `next.config.ts`**:
   - In `next.config.ts` (lines 123–127):
     ```typescript
     {
       source: "/destinations",
       destination: "/weddings",
       permanent: true,
     },
     ```
   - This sends an HTTP 308 permanent redirect from `/destinations` to `/weddings` at the edge/routing layer before any page route handler is invoked.

2. **Existing Hub Route in `app/destinations/page.tsx`**:
   - `app/destinations/page.tsx` is a fully built 266-line server component featuring:
     - Full SEO Metadata (`title`, `description`, `canonical`, OpenGraph, Twitter card)
     - Structured JSON-LD (`CollectionPage` and `BreadcrumbList`)
     - Responsive grid of 6 regional destination cards (Rajasthan, Goa, Punjab, Kerala, Delhi NCR, Mumbai) with season recommendations, tags, descriptions, and links to `/destinations/${dest.slug}`
     - Cross-linking callouts to Knowledge Hub (`/learn`) and Experience Map (`/weddings/map`)
   - Because of `next.config.ts:124`, `app/destinations/page.tsx` is shadowed and unreachable when users visit `/destinations`.

---

## 2. Logic Chain

1. **TRU-01**:
   - **Premise 1**: Trust badges must truthfully reflect vetted, KYC-verified host identities to prevent foreign travelers from being misled.
   - **Premise 2**: In `lib/wedding-dto.ts`, `rawWedding.status === "PUBLISHED"` erroneously caused all published listings to be marked `isVerified: true`.
   - **Premise 3**: In PostgreSQL, the authoritative proof of KYC verification resides in `rawWedding.hostCouple?.user?.verification?.status === "APPROVED"` (or an active `UserQualityBadge` with key `"verified-host"`).
   - **Premise 4**: For database queries to provide this data to `toWeddingDTO()`, `lib/actions/index.ts` must project `verification` and `badges` via `hostCouple.user.include`.
   - **Deduction**: Removing `rawWedding.status === "PUBLISHED"` and `rawWedding.status === "VERIFIED"` from `lib/wedding-dto.ts` and replacing them with checks for approved KYC verification (`verification?.status === 'APPROVED'`), active verified-host badges, or explicit non-demo boolean flags eliminates synthetic badge creation.

2. **ROU-01**:
   - **Premise 1**: Next.js evaluates `redirects()` in `next.config.ts` prior to App Router filesystem route resolution.
   - **Premise 2**: The redirect rule `{ source: "/destinations", destination: "/weddings", permanent: true }` intercepts all requests to `/destinations`.
   - **Premise 3**: `app/destinations/page.tsx` is an existing, complete destination index.
   - **Deduction**: Removing the 5-line redirect entry in `next.config.ts` unshadows `app/destinations/page.tsx`, restoring direct access to the regional destination hub.

---

## 3. Caveats

- **Mock / Test Fixtures**: Several unit tests (e.g. `__tests__/lib/god-level-marketplace.test.ts`, `__tests__/lib/wedding-images.test.ts`) construct mock objects with `isVerified: true` directly on the input object without a full `hostCouple.user.verification` relation tree. The normalization logic in `toWeddingDTO` must continue to respect `!rawWedding.isDemo && Boolean(rawWedding.isVerified)` so existing fixture tests pass while ensuring demo listings (`isDemo: true`) always evaluate to `false`.
- **Database Fallbacks**: When database connection is unreachable or static fallback data (`lib/data.ts`) is used, demo listings already have `"isVerified": false`, which will continue to render without verified badges.

---

## 4. Conclusion & Concrete Code Changes

### Proposed Changes for TRU-01

#### Target File: `lib/wedding-dto.ts`
Replace lines 120 and 228 with strict database verification binding:

```typescript
// ── Line 120 replacement ──
const hasApprovedVerification =
  rawWedding.hostCouple?.user?.verification?.status === "APPROVED" ||
  rawWedding.verification?.status === "APPROVED";

const hasVerifiedQualityBadge =
  Array.isArray(rawWedding.hostCouple?.user?.badges) &&
  rawWedding.hostCouple.user.badges.some(
    (b: any) =>
      (b.badge?.key === "verified-host" || b.badgeKey === "verified-host" || b.key === "verified-host") &&
      !b.revokedAt
  );

const isExplicitlyVerified = Boolean(rawWedding.isVerified);

const isVerified =
  !rawWedding.isDemo && (hasApprovedVerification || hasVerifiedQualityBadge || isExplicitlyVerified);

const isVerifiedHostMedia = isVerified;
```

```typescript
// ── Line 228 replacement ──
isVerified,
```

#### Target File: `lib/actions/index.ts`
In `getWeddings`, `getHomepageWeddings`, `getRelatedWeddings`, and `getWeddingBySlug`, update `hostCouple.include.user` from `user: true` to:

```typescript
hostCouple: {
  include: {
    user: {
      include: {
        verification: true,
        badges: {
          where: { revokedAt: null },
          include: { badge: true },
        },
      },
    },
  },
},
```

---

### Proposed Changes for ROU-01

#### Target File: `next.config.ts`
Remove lines 123–127:

```diff
-      {
-        source: "/destinations",
-        destination: "/weddings",
-        permanent: true,
-      },
```

---

## 5. Verification Method

1. **TypeScript Type Check**:
   ```bash
   npx tsc --noEmit
   ```
2. **Jest Test Suite**:
   ```bash
   npx jest __tests__/lib/god-level-marketplace.test.ts __tests__/lib/wedding-images.test.ts __tests__/lib/homepage-layout-density.test.ts
   ```
3. **Full Test Suite & Production Build**:
   ```bash
   npm test
   npm run build
   ```
4. **Behavioral Route Check**:
   - Verify `/destinations` returns HTTP 200 and renders `app/destinations/page.tsx` instead of redirecting (HTTP 308) to `/weddings`.
5. **Behavioral Trust Badge Check**:
   - Verify a wedding listing whose host has `verification.status !== "APPROVED"` renders with `isVerified: false` and no green `ShieldCheck` icon.
   - Verify a wedding listing whose host has `verification.status === "APPROVED"` renders with `isVerified: true` and the green `ShieldCheck` icon.
