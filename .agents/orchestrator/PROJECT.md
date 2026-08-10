# Project: WeddingWithIndia Marketplace — Authentication, DB & Security Repair
# Scope: God-Level Auth, DB Availability, Admin Protection & Financial/UX Hardening

## Architecture
- **Framework**: Next.js 16 App Router (`app/`), React 19, TypeScript, Tailwind CSS v4.
- **Authentication & Routing**: Clerk authentication (`@clerk/nextjs`), Catch-all route architecture (`app/login/[[...rest]]/page.tsx`, `app/signup/[[...rest]]/page.tsx`), edge proxy routing middleware (`proxy.ts`), database-backed RBAC (`lib/auth.ts`, `lib/rbac.ts`).
- **Data & Storage**: PostgreSQL on Supabase AWS Sydney via Prisma ORM (`prisma/schema.prisma`), database availability ping (`lib/prisma.ts:isDatabaseAvailable`), UploadThing storage provider (`lib/storage/index.ts`).
- **Payments & Financials**: Stripe Checkout, Webhooks (`app/api/webhooks/stripe/route.ts`), cancellation policy engine (`lib/services/cancellation-policy.ts`), refund & payout service (`lib/services/refunds.ts`).
- **Safety & Moderation**: Contact moderation service (`lib/services/contact-moderation.ts`), safety case triage & evidence proxy (`app/api/safety/evidence/[evidenceId]/route.ts`).
- **Testing Infrastructure**: Jest unit/integration test suite (`__tests__/lib/`), Playwright E2E test suite (`e2e/`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Admin Bootstrap CLI | Elevate target email (`founder@weddingwithindia.com`) to `role: ADMIN` | M3 | `scripts/bootstrap-admin.js` |
| 2 | Server-Authoritative Admin RBAC | Enforce `requireRole([UserRole.ADMIN])` on all admin actions & APIs | M3 | `lib/auth.ts`, `lib/rbac.ts` |
| 3 | Middleware Proxy Security | Protect `/dashboard/admin/*` and `/api/admin/*` via edge Clerk middleware | M3 | `proxy.ts` |
| 4 | Self-Role Elevation Block | Block users from setting self role to `ADMIN` in onboarding/settings | M3 | `lib/actions/index.ts` |
| 5 | Admin Audit Logging | Server-logged audit entries for admin mutations | M3 | `lib/actions/admin.ts` |
| 6 | Admin Request Verification | Admin initiates verification request for targeted user | M3 | `lib/actions/admin.ts` |
| 7 | User Submit Verification | User uploads documents and submits KYC payload | M3 | `lib/actions/index.ts` |
| 8 | Admin Review Verification | Admin approves/rejects/requests changes on KYC submission | M3 | `lib/actions/admin.ts`, `lib/actions/index.ts` |
| 9 | UploadThing Storage Gate | Middleware checking DB verification status before presigned URL | M3 | `lib/storage/index.ts` |
| 10 | Private Document / Evidence Proxy | RBAC-gated evidence file retrieval route handler | M3 | `app/api/safety/evidence/[evidenceId]/route.ts` |
| 11 | Strict Role Onboarding Flow | Signup -> Role Selection -> Profile -> Active transition | M3 | `lib/actions/index.ts` |
| 12 | Host Listing KYC Gate | Force `PUBLISHED` attempt to `DRAFT` if host is unverified | M3 | `lib/actions/index.ts` |
| 13 | Agent Referral & Commission State | `SIGNED_UP` -> `ONBOARDED` -> `CONVERTED` referral & payout states | M3 | `lib/actions/referrals.ts` |
| 14 | Server-Authoritative Pricing | Calculate pricePerGuest * guestsCount on server; validate `guestsCount >= 1` | M4 | `lib/actions/index.ts` |
| 15 | Stripe Checkout & $0 Coupon Bypass | Server-computed total checkout & zero-amount handling | M4 | `lib/actions/stripe.ts` |
| 16 | Stripe Webhook Idempotency | Signature check & `StripeWebhookEvent` deduping | M4 | `app/api/webhooks/stripe/route.ts` |
| 17 | Cancellation Tier & Refund Engine | 4-tier refund policy using integer cents arithmetic | M4 | `lib/services/cancellation-policy.ts`, `lib/services/refunds.ts` |
| 18 | Cumulative Partial Refund Guard | Prevent cumulative partial refunds from exceeding payment total | M4 | `lib/actions/stripe.ts` |
| 19 | PII Data Minimization & DTOs | Exclude PAN/Aadhaar/Passport/Bank details from public endpoints | M4 | `prisma/schema.prisma`, `app/api/` |
| 20 | Text Normalizer (`normalizeForModeration`) | Strip zero-width chars, NFKD decompose, remove diacritics, collapse spaces | M4 | `lib/services/contact-moderation.ts` |
| 21 | Contact Info Moderation Engine | Multi-regex detection for email/phone/WhatsApp/social handles/spelled digits | M4 | `lib/services/contact-moderation.ts` |
| 22 | Messaging Contact Interceptor | Intercept `sendMessage` & `editMessage` to block contact leaks | M4 | `lib/actions/messages.ts` |
| 23 | Brand Design Tokens & Theme | Tailwind v4 inline luxury theme (Maroon `#6b1026`, Gold `#c9972a`, Ivory) | M4 | `app/globals.css` |
| 24 | Sub-Dashboard Loading States | Add dedicated `loading.tsx` for admin & user sub-dashboards | M4 | `app/dashboard/` |
| 25 | Responsive QA & Grid Alignment | Fix non-responsive grid & test 320px-1920px breakpoints | M4 | `app/about/AboutContent.tsx` |
| 26 | Eliminate `as any` & Mock Hacks | Purge mock stores and `as any` assertions | M4 | Entire codebase |
| 27 | Clerk Catch-All Routing (R1) | Implement `app/login/[[...rest]]/page.tsx` and `app/signup/[[...rest]]/page.tsx` | M1 | `app/login`, `app/signup` |
| 28 | Client-Trust Route Removal (R2) | Delete `app/login/client-trust/page.tsx` & enforce server-authoritative relative redirects | M1 | `app/login` |
| 29 | DB Availability Diagnosis & Fix (R3) | Fix `isDatabaseAvailable()` timeout (5000ms) & remove false-negative 5s caching | M2 | `lib/prisma.ts` |
| 30 | Fail-Closed DB Auth Protection (R4) | Maintain strict fail-closed auth and service-unavailable UI | M2 | `lib/auth.ts`, `AdminLayout` |
| 31 | Founder Admin Bootstrap & Access (R5) | Synchronize `founder@weddingwithindia.com` as ADMIN to `/dashboard/admin` | M3 | `scripts/bootstrap-admin.js`, `lib/auth.ts` |
| 32 | Admin Routing & Auth Redirect Protection (R6) | Guard `/dashboard/admin/*`, replace dead `/sign-in` redirects, block open redirects | M3 | `app/dashboard/admin/layout.tsx`, `proxy.ts` |
| 33 | Admin Controls & 4-Level Verification Gate (R7) | Block unrequested KYC uploads at UI, Server Action, UploadThing, and DB levels | M3 | `lib/storage/index.ts`, `components/` |
| 34 | Security, Financial & UX Integrity (R8) | Webhook idempotency, server pricing, contact moderation, error boundary security | M4 | Entire codebase |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Clerk Routing & Client-Trust Removal | R1: Catch-all routes `app/login/[[...rest]]/page.tsx`, `app/signup/[[...rest]]/page.tsx`; R2: Delete `client-trust`, server-authoritative relative URL redirects | None | PLANNED |
| M2 | Database Availability & Fail-Closed Auth | R3: Fix `isDatabaseAvailable()` ping timeout (5000ms) & false-negative caching; R4: Fail-closed auth & service-unavailable UI | M1 | PLANNED |
| M3 | Founder Admin, Admin Routing & Verification | R5: `founder@weddingwithindia.com` ADMIN access; R6: Server-authoritative admin routes & redirect guards; R7: 4-level KYC upload gate | M2 | PLANNED |
| M4 | Financial/UX Integrity & Quad-Verification | R8: Stripe idempotency, pricing, moderation, error boundaries, responsive QA; Quad-Verification (`type-check`, `lint`, `test`, `build`) & Forensic Audit | M3 | PLANNED |

## Code Layout
- `app/login/[[...rest]]/page.tsx` — Catch-all Clerk login route
- `app/signup/[[...rest]]/page.tsx` — Catch-all Clerk signup route
- `lib/prisma.ts` — Prisma client instance & `isDatabaseAvailable()` check
- `lib/auth.ts` — Server-side auth, `syncAndGetDbUser()`, `requireRole()`
- `lib/utils.ts` — Shared utility functions including `sanitizeRedirectUrl()`
- `app/dashboard/admin/layout.tsx` — Server component admin layout guard
