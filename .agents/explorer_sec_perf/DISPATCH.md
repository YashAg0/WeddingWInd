## 2026-08-30T03:06:24Z

You are Explorer 4 (Security, Performance, Accessibility, SEO & Operations) for the WeddingWithIndia marketplace master audit.
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_sec_perf\

Read the authoritative user request at:
c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md

STRICT CONSTRAINT: Non-destructive audit. Zero source code, database, config, or business logic files may be modified. Only coordination files and reports in your .agents/ folder are written.

Your Mission:
Perform an exhaustive technical audit of security, performance, accessibility, SEO, operations, and testability:
1. Defensive Security Audit:
   - Authentication & Session handling: Token storage, cookies (HttpOnly, Secure, SameSite), session invalidation, password hashing, OAuth callbacks.
   - Authorization & IDOR: Check every mutation / API handler for user ownership verification vs blind ID acceptance.
   - Injection & Sanitization: XSS prevention in user-generated content (reviews, descriptions, chat), SQL/Prisma raw query safety.
   - CSRF & CORS policies.
   - Rate limiting on sensitive endpoints (/api/auth, /api/checkout, /api/otp, /api/contact, AI endpoints).
   - Secret & credential leakage: Scan source files and client bundles for exposed API keys, private keys, database URLs, test keys in production code.
2. Performance Bottlenecks (Section F):
   - Bundle size analysis: Heavy client dependencies, unoptimized imports (e.g. icon packs, heavy UI libs), barrel file re-exports.
   - Image & Asset pipeline: Next.js Image component optimization, missing width/height/sizes, external image domain configs.
   - Server/Client waterfall requests, missing Suspense / loading.tsx boundaries, unhandled error.tsx / global-error.tsx.
3. Accessibility (WCAG 2.2 AA) & SEO:
   - Color contrast, focus visibility, screen reader labels, keyboard trap avoidance.
   - Meta tags, OpenGraph images, Twitter cards, dynamic sitemap.ts, robots.ts, structured data (Event / Tourism schema).
4. Operations & Observability:
   - Admin operational workflows, error logging, monitoring, telemetry, crash reporting.
5. E2E Test Scenarios Plan (Section M):
   - Comprehensive test matrix spanning Tiers 1 through 4 (Tier 1: Feature Coverage, Tier 2: Boundary/Corner, Tier 3: Pairwise Combinations, Tier 4: Real-World Foreign Traveler Journeys).
6. Do-Not-Touch List (Section O):
   - Identify mission-critical, high-risk modules, algorithms, or integrations that must not be casually altered during refactoring.

Deliverable:
Write a comprehensive, exhaustive, evidence-backed report to:
c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_sec_perf\handoff.md
Maintain progress.md in your working directory.
When finished, send a completion message back with your report path.
