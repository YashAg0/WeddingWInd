# WEDDINGWITHINDIA — FORENSIC REMEDIATION BASELINE FREEZE

**Date:** 2026-09-22T16:45:00+05:30  
**Phase:** Phase 1 — Baseline Freeze  
**Lead Engineer:** Principal Production Reliability Engineer & Staff Full-Stack Engineer  

---

## 1. Environment & Version Identity

* **Git Commit:** \`7e3611cc6ca01fa52d936a74734606f9896cef6c\`
* **Branch:** \`master\`
* **Git Working Tree Status:** Clean (no modified tracked files; only forensic report \`WEDDINGWITHINDIA_FORENSIC_AUDIT_REPORT.md\` untracked)
* **Production URL:** \`https://weddingwithindia.com\`
* **Production API Health Endpoint:** \`https://weddingwithindia.com/api/health\`
  * Response: \`{"status":"ok","db":true,"commit":"7e3611c","commitSha":"7e3611cc6ca01fa52d936a74734606f9896cef6c"}\`
  * Parity: 100% parity between local HEAD commit and live production deployment.
* **Database Environment:**
  * Provider: Supabase Hosted PostgreSQL 15+ (ap-south-1 region)
  * Pooler: PgBouncer transaction mode via port 6543 (\`DATABASE_URL\`)
  * Direct: Native session mode via port 5432 (\`DIRECT_URL\`)
  * ORM: Prisma 6.2.1

---

## 2. Quality Gate Baselines

* **TypeScript Compilation (\`npm run type-check\`):**
  * Status: PASSED (0 errors)
* **ESLint (\`npm run lint\`):**
  * Status: PASSED (0 errors, 1 warning)
  * Warning: \`context/AuthContext.tsx:375:6\` (Missing dependencies in useEffect: \`refreshData\` and \`user\`)
* **Next.js Production Build (\`npx next build\`):**
  * Status: PASSED (133 static/dynamic routes compiled successfully in 2.7m)
  * SSG Observation: \`generateStaticParams\` prerendered \`/weddings/wedding-test_pp_1787346172967\`, confirming synthetic test wedding contamination in production database.
* **Automated Test Suite (\`npm test\`):**
  * Test Suites: 87 passed, 2 skipped, 89 total
  * Tests: 890 passed, 10 skipped, 900 total
  * Skipped Suites:
    * \`__tests__/lib/stage9-booking-concurrency.test.ts\` (Skipped due to \`localhost:5432\` mock in \`jest.setup.ts\`)
    * \`__tests__/lib/stage9-draft-idempotency.test.ts\` (Skipped due to \`localhost:5432\` mock in \`jest.setup.ts\`)
* **Synthetic Smoke Tests (\`scripts/smoke-test.js\` against production):**
  * Status: FAILED (77 passed, 11 failed)
  * Failures: 11 policy endpoints receiving HTTP 307 temporary redirect to \`/trust?tab=...\`
* **SEO & AI Crawler Audit (\`scripts/verify-seo-and-ai-crawler.js\`):**
  * Status: FAILED (120 passed, 3 failed)
  * Failures: \`/safety\`, \`/guest-safety\`, \`/host-safety\` missing from \`sitemap.xml\`
* **Trust Claims Verification (\`scripts/verify-trust-claims.js\`):**
  * Status: FAILED (0 passed, 14 failed)
  * Failures: Claims of "Escrow Protected" and "100% Physically Verified Hosts" lacking verification evidence.
* **PWA Verification (\`scripts/verify-pwa.js\`):**
  * Status: PASSED (5 passed, 0 failed)

---

## 3. Preservation Declaration

The master audit report \`WEDDINGWITHINDIA_FORENSIC_AUDIT_REPORT.md\` is preserved intact in the project root and will not be overwritten or modified during this remediation phase.
