## 2026-08-11T03:08:20Z

You are worker_m4 (teamwork_preview_worker). Your working directory is c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m4.
You MUST read:
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\PROJECT.md
- c:\Projects\WeddingWithIndia\wedding-with-india\.agents\orchestrator\handoff.md

Your task is Milestone M4: Dashboard Repair & UI/Hydration Consistency (Requirements R5 & R6).

1. Hydration Mismatch Fix:
   - Audit client components in `app/dashboard/**/*`, `app/admin/**/*`, `components/**/*` for SSR locale/date/time hydration mismatches (e.g. `toLocaleDateString()`, `toLocaleTimeString()`, `formatDate()`, `Date.now()`, `new Date()`, client-side locale detection or `window` object access during initial JSX render).
   - Eliminate all date/locale hydration mismatches deterministically across JSX trees WITHOUT using `suppressHydrationWarning`.
   - Use proper client-side mounted state pattern (e.g. `useEffect` setting `isMounted = true`, or deterministic server ISO date string helpers) so server and client initial markup match 100%.

2. Brand Token Alignment across Admin Portal & Dashboards:
   - Audit all 19 Admin portal sub-routes (`app/admin/**/*`) and all role dashboards (`app/dashboard/**/*` for Host, Traveler, Agent, Coordinator, Admin).
   - Verify all routes use homepage brand tokens:
     - `#6b1026` Royal Maroon
     - `#c9972a` Luxury Gold
     - `#fdfaf7` Warm Ivory
     - `#1a1a1a` Dark Charcoal
   - Replace any mismatched raw hex codes or inconsistent theme colors with canonical Tailwind design tokens/brand hex codes matching the homepage.

3. Build & Test Verification:
   - Run `npm run type-check` and `npm run lint` and `npm test -- --no-coverage`.
   - Ensure 0 errors.

4. Handoff:
   - Write your handoff report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m4\handoff.md`.
   - Report back to parent orchestrator with a summary of files modified, fixes implemented, and test results.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
