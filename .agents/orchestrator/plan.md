# Master Forensic Audit Plan — WeddingWithIndia Marketplace

## Objective
Execute an independent verification, hostile red-team, real-user, and marketplace forensic audit of the WeddingWithIndia codebase, reconciling all Audit Pass 1 findings with rigorous line-level proof, discovering everything Pass 1 missed, and delivering a comprehensive 16-section Master Audit Report (Sections A–P) without modifying any source files or databases.

## Workstreams & Deliverables

### Workstream 1: Independent P0/P1 Finding Re-verification & Reconciliation (R1)
- Independently test and trace every finding from Pass 1 through the code paths:
  - **SEC-01**: Hardcoded test auth bypass in `lib/test-auth.ts`, reachability via `proxy.ts`, `app/api/test/auth/route.ts`, and Clerk bypass.
  - **UX-01**: Dietary restrictions disconnect & free-text input in `app/onboarding` vs `app/api/reports/host/[weddingId]`.
  - **OPS-01**: Server process termination on `unhandledRejection` via `cleanup()` calling `process.exit(0)` in `instrumentation.ts`.
  - **SEC-02**: CSV formula injection (DDE) in `app/api/reports/host/[weddingId]/route.ts`.
  - **TRU-01**: Synthetic green verified badge decoupling in `lib/wedding-dto.ts:228`.
  - **FIN-01**: Static multi-currency engine (`USD: 95.50`, `EUR: 108.00`) in `lib/currency.ts`.
  - **UX-02**: Multi-guest attendee manifest blindspot in `BookingSidebar.tsx`.
  - **UX-03**: Missing checkout cancellation & escrow drawer in `BookingSidebar.tsx`.
- Assign exact verdict tags: `VERIFIED`, `PARTIALLY VERIFIED`, `FALSE POSITIVE`, `OUTDATED`, `UNVERIFIED`.

### Workstream 2: Hostile Red-Team & Adversarial Invariant Testing (R2)
- Horizontal & vertical authorization matrix analysis across all 113 pages and 21 API endpoints.
- Defensive concurrency probing (`SELECT FOR UPDATE`, atomic seat decrement, idempotent Stripe webhook handling, double refund prevention).
- State machine invariant validation across 5 domain state machines (Auth, Booking, Payment/Escrow, Listing, KYC).

### Workstream 3: Performance Root-Cause Forensics (R3)
- Profile bundle sizes, client vs server component boundaries, hydration costs, sequential query waterfalls, 16 missing `loading.tsx` Suspense boundaries.
- Trace static mock data bloat in `lib/data.ts` and continuous CSS marquee animation repaints in `TrustStrip.tsx`.

### Workstream 4: Real-User Foreign Traveler Experience & Marketplace Inventory (R4)
- Psychological anxiety micro-moments: dietary allergy safety, solo female traveler security, emergency support, cultural dress codes.
- Component classification: KEEP / REDUCE / COMBINE / MOVE / REMOVE / ADD ("Too Much Website" vs "Too Little Website").
- Inventory realism & mobile viewport ergonomics audit.

### Workstream 5: Pass 1 Blindspot Discovery & Master Report Generation (R5)
- Compile complete Sections A through P in `MASTER_AUDIT_REPORT.md`.
- 11-dimension forensic scorecard with 0–100 scores and grades.
- Regression Risk Map & Dependency Graph.
- Mission-critical Do-Not-Touch list.
- Top 20 Actionable Recommendations with Sprint Work Packages (WP-01 to WP-07).
- Direct, explicit answers to Part 31 Top 10 Forensic Questions.

## Audit & Verification Gates
- **Zero Modification Integrity**: Strict validation of 0 file modifications outside `.agents/`.
- **Forensic Auditor Gate**: `teamwork_preview_auditor` verification for clean citations, non-fabrication, and completeness.
- **Sentinel Victory Gate**: Independent confirmation of all audit requirements and acceptance criteria.
