# BRIEFING — 2026-08-30T05:05:00Z

## Mission
Investigate Phase 3 UX items: UX-06 (TrustStrip 28s marquee repaint loop replacement with static 4-column trust badge grid) and UX-05 (Consolidation of 27+ scattered legal/trust routes into unified 3-tab `/trust` portal).

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigation, codebase inspection, architecture design, UI/UX handoff report
- Working directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_p3_ux_legal
- Original parent: 87ed76c4-7c03-499b-840a-7b51c6f43da7
- Milestone: Phase 3 UX & Legal Portal

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or edit source files directly
- Propose clear, production-ready replacement designs and code snippets for implementer
- Focus strictly on UX-06 and UX-05 requirements

## Current Parent
- Conversation ID: 87ed76c4-7c03-499b-840a-7b51c6f43da7
- Updated: 2026-08-30T05:05:00Z

## Investigation State
- **Explored paths**:
  - `components/home/TrustStrip.tsx` (inspected 28s continuous marquee animation loop & 3x DOM duplication)
  - `components/home/Hero.tsx`, `components/home/WhyChooseUs.tsx`, `app/page.tsx` (analyzed landing page composition & layout)
  - `lib/constants/legal.ts` (single source of truth for legal config, emergency numbers, grievance officer, refund tiers)
  - 27+ legal/policy pages in `app/` (`terms`, `privacy`, `safety`, `guest-safety`, `host-safety`, `community-guidelines`, `incident-report`, `grievance`, `cancellation-policy`, `refund-policy`, `dpdp`, `gdpr`, `cookies`, `booking-terms`, `payment-terms`, `traveler-agreement`, etc.)
  - `components/layout/Footer.tsx` (analyzed 4-column link sprawl pointing to 24+ legal routes)
- **Key findings**:
  - UX-06: `TrustStrip.tsx` currently uses `@keyframes marqueeScroll` running an infinite 28s translation with `will-change: transform` and 3x array duplication. Designed a high-contrast, static 4-column trust badge grid highlighting 4 pillars (Verified Hosts, Escrow Protection, Dedicated Concierge, Cryptographic Pass) with zero repaints and WCAG 2.2.2 compliance.
  - UX-05: 27 fragmented legal pages cause severe cognitive load and fragmented trust signals. Designed a unified 3-tab `/trust` portal (`app/trust/page.tsx`) with URL-synced tabs (`terms`, `privacy`, `safety`), Suspense-wrapped search params, accordion disclosures for sub-agreements, emergency helpline banners, statutory grievance redressal disclosure, and backward-compatible redirects in `next.config.ts`.
- **Unexplored areas**: None for this subtask scope.

## Key Decisions Made
- Fully designed replacement `components/home/TrustStrip.tsx`.
- Fully designed `app/trust/page.tsx` with 3 core tabs (*Terms of Service*, *Privacy & Data Protection*, *Safety & Incident Resolution*).
- Formulated redirect map for `next.config.ts` and simplified footer schema for `components/layout/Footer.tsx`.

## Artifact Index
- `.agents/explorer_p3_ux_legal/DISPATCH.md` — Incoming dispatch log
- `.agents/explorer_p3_ux_legal/BRIEFING.md` — Agent briefing & situational memory
- `.agents/explorer_p3_ux_legal/progress.md` — Heartbeat & progress tracker
- `.agents/explorer_p3_ux_legal/handoff.md` — Final structured 5-component report
