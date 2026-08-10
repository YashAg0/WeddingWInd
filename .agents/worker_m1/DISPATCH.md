# DISPATCH — worker_m1

## Task Objective
Implement Milestone M1: Fix Clerk Catch-all Routing (R1) & Remove Client-Trust Architecture (R2).

## Scope & Instructions
1. **R1: Clerk Catch-All Routes**:
   - Refactor `app/login/page.tsx` into `app/login/[[...rest]]/page.tsx`.
   - Refactor `app/signup/page.tsx` into `app/signup/[[...rest]]/page.tsx`.
   - Preserve all custom visual styling (`Compass` brand icon, luxury container styling, title, sub-heading, custom loading spinners, suspense boundaries).

2. **R2: Client-Trust Deletion & Server-Authoritative Redirects**:
   - Delete `app/login/client-trust/page.tsx`.
   - Add/update `sanitizeRedirectUrl(url: string | null): string` in `lib/utils.ts` to strictly sanitize redirect URLs (ensure target starts with `/` and does NOT start with `//` or contain `://`).
   - Update `<SignIn>` and `<SignUp>` props in `app/login/[[...rest]]/page.tsx` and `app/signup/[[...rest]]/page.tsx` so `fallbackRedirectUrl` and `forceRedirectUrl` use direct sanitized target URLs instead of `/login/client-trust`.
   - Ensure post-login navigation resolves server-authoritatively without redirect loops.

3. **Verification**:
   - Run `npm run type-check`.
   - Run `npm run lint`.
   - Run `npm test -- --no-coverage`.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your implementation summary and verification command output to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\worker_m1\handoff.md` and notify parent.
