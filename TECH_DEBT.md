# WeddingWithIndia — Technical Debt & Refactoring Backlog

This document catalogs technical debt items, architectural trade-offs, and refactoring priorities for **WeddingWithIndia**.

---

## 1. Technical Debt Collection

| Item ID | Category | Description | Priority | Target Quarter |
| :--- | :--- | :--- | :--- | :--- |
| **TD-01** | Database | Replace in-memory mock data fallbacks with automated DB reconnect strategies. | High | Q3 2026 |
| **TD-02** | State Management | Migrate custom `AuthContext` state synchronization to React Query / SWR for background revalidation. | Medium | Q4 2026 |
| **TD-03** | Testing | Implement automated Playwright E2E integration test suites for checkout and booking flows. | High | Q4 2026 |
| **TD-04** | Abstraction | Abstract third-party SDK dependencies (Clerk, Stripe, Resend) behind domain interface adapters. | Medium | Q1 2027 |
| **TD-05** | Image CDN | Replace direct Unsplash URLs with dynamic image optimization proxy. | Medium | Q1 2027 |

---

## 2. Refactoring Plans

### TD-01: Automated Database Reconnect Strategy
- **Current State**: When PostgreSQL connectivity fails, `syncAndGetDbUser()` returns a transient mock guest user to prevent runtime application crashes.
- **Target State**: Implement an exponential backoff connection retry loop in `lib/prisma.ts` with alerting triggers to Sentry when DB connections drop below minimum pool limits.

### TD-03: Playwright E2E Integration Suite
- **Current State**: Build verification relies on static page generation, TypeScript type checking (`tsc --noEmit`), and Next.js compiler checks.
- **Target State**: Suite of headless browser tests validating the full end-to-end guest booking pipeline:
  ```bash
  npx playwright test tests/e2e/guest-booking.spec.ts
  ```
