# Project: WeddingWithIndia End-to-End Recovery

## Architecture
- Framework: Next.js 14+ (App Router) / React 18 / TypeScript / Tailwind CSS
- Data & ORM: PostgreSQL / Prisma ORM (`lib/prisma.ts`)
- Authentication: Clerk Auth (`lib/auth.ts`, `syncAndGetDbUser()`)
- Storage: UploadThing (`lib/storage/index.ts`)
- Payments: Stripe SDK (`lib/stripe.ts`, `app/api/webhooks/stripe/route.ts`)
- Testing: Jest (`npm test -- --no-coverage`) & Playwright (`npx playwright test --list`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | P2002 Email Error Fix | Normalize emails, reconcile Clerk ID vs DB email without duplicate email errors | M1 | R3 / Survey |
| 2 | Founder Canonical Truth | Protect founder DB row from role downgrade, duplicate creation, or clerk mismatch | M1 | R3 / Survey |
| 3 | Concurrent Signup Race Protection | Wrap `tx.user.create()` in P2002 catch to fetch existing user on race | M1 | R3 / Survey |
| 4 | Stripe Webhook Transaction Atomicity | Move `sendInvoiceEmail` network call outside `prisma.$transaction` callback | M2 | R4 / Survey |
| 5 | Refund Action Transaction Atomicity | Move `stripe.refunds.create` network call outside `prisma.$transaction` callback | M2 | R4 / Survey |
| 6 | Listing Document Zod Fix | Transform empty string `""` to `null` in `verificationSchema` URL fields | M3 | R5 / Survey |
| 7 | Dashboard Edit Link Fix | Preserve query parameters on `/dashboard/listings` edit button links | M3 | R5 / Survey |
| 8 | Wedding Lifecycle Verification | Validate DRAFT -> SUBMITTED -> Admin Review -> APPROVED/REJECTED -> PUBLISHED | M3 | R5 / Survey |
| 9 | SSR Hydration Mismatch Fix | Eliminate locale/date hydration mismatches in client components without `suppressHydrationWarning` | M4 | R6 / Survey |
| 10| UI & Brand Color Alignment | Verify Admin portal and dashboards match homepage luxury gold & royal maroon tokens | M4 | R6 / Survey |
| 11| Quad-Verification Suite | Verify clean exit code 0 for type-check, lint, test, and build | M5 | R2, R8 / Survey |
| 12| Single Dev Server Behavioral Test | Verify end-to-end user workflows on a single Next.js dev server instance | M5 | R8 / Survey |
| 13| Forensic Integrity Audit | Execute `teamwork_preview_auditor` to guarantee genuine, non-cheating code implementation | M6 | Forensic Audit |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Identity & Auth Hardening | `syncAndGetDbUser()` P2002 fix, email normalization, Clerk ID reconciliation, founder protection | None | DONE |
| M2 | Database & Transaction Integrity | Refactor transaction atomicity in Stripe webhook & refund action | M1 | DONE |
| M3 | Wedding Lifecycle & Listing Creation Repair | Fix Zod empty string URL parsing in `verificationSchema`, fix edit link query params | M2 | DONE |
| M4 | Dashboard Repair & UI/Hydration Stabilization | Fix client component SSR date hydration mismatches, verify design token consistency | M3 | DONE |
| M5 | Financial, Security & Quad-Verification Run | Server-authoritative pricing verification, run type-check, lint, test, build & runtime test | M4 | DONE |
| M6 | Forensic Integrity Audit | Independent `teamwork_preview_auditor` verification for CLEAN verdict | M5 | DONE |

## Interface Contracts
### Clerk ↔ Prisma Sync (`lib/auth.ts`)
- `syncAndGetDbUser()` accepts authenticated Clerk user and returns canonical Prisma `User`.
- Normalizes `clerkUser.email` using `.toLowerCase().trim()`.
- Looks up `existingByClerkId` and `existingByEmail`. If `existingByEmail` exists, links `clerkUserId` to `existingByEmail` without overwriting `role` or `status`.

### Stripe Webhook Handler (`app/api/webhooks/stripe/route.ts`)
- Webhook events process idempotently via `prisma.stripeWebhookEvent`.
- Database transaction updates booking status to `CONFIRMED`; email dispatch (`sendInvoiceEmail`) is triggered post-transaction commit.

## Code Layout
- `lib/auth.ts`: Authentication & Clerk user synchronization logic
- `lib/prisma.ts`: Prisma Client singleton & connection health
- `lib/validation/index.ts`: Zod schema definitions for verification & listings
- `app/api/webhooks/stripe/route.ts`: Stripe webhook handler
- `lib/actions/index.ts`: Server Actions for bookings, listings, and refunds
- `app/dashboard/**/*`: User, Host, Agent, Coordinator dashboards
- `app/admin/**/*`: Admin portal sub-routes (19 routes)
